<?php

namespace App\Http\Controllers;

use App\Models\Exam;
use App\Models\ExamSession;
use App\Services\PlagiarismDetectionService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ExamSessionController extends Controller
{
    public function __construct(
        private PlagiarismDetectionService $plagiarismService
    ) {}

    public function index(): Response
    {
        $sessions = ExamSession::with(['exam.module', 'creator'])
            ->withCount('attempts')
            ->when(! auth()->user()->hasRole('super-admin'), function ($query) {
                $query->where('created_by', auth()->id());
            })
            ->orderByDesc('created_at')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('exam-sessions/index', [
            'sessions' => $sessions,
        ]);
    }

    public function create(): RedirectResponse
    {
        return redirect()->route('modules.index');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'exam_id' => ['required', 'exists:exams,id'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'start_time' => ['required', 'date', 'after_or_equal:now'],
            'end_time' => ['required', 'date', 'after:start_time'],
            'max_attempts' => ['required', 'integer', 'min:1', 'max:10'],
            'shuffle_questions' => ['boolean'],
            'shuffle_options' => ['boolean'],
            'show_results_immediately' => ['boolean'],
            'show_correct_answers' => ['boolean'],
            'allow_review' => ['boolean'],
        ]);

        // Calculate time limit from session duration
        $startTime = new \DateTime($validated['start_time']);
        $endTime = new \DateTime($validated['end_time']);
        $durationMinutes = (int) (($endTime->getTimestamp() - $startTime->getTimestamp()) / 60);

        $session = ExamSession::create([
            ...$validated,
            'time_limit_minutes' => $durationMinutes,
            'created_by' => auth()->id(),
            'status' => 'active',
        ]);

        return redirect()->route('exam-sessions.show', $session)
            ->with('success', 'Exam session created successfully. Share the access code with your students.');
    }

    public function show(ExamSession $examSession): Response
    {
        $this->authorizeSession($examSession);

        $examSession->load([
            'exam.module',
            'exam.questions',
            'creator',
            'attempts.user',
        ]);

        $stats = [
            'total_attempts' => $examSession->attempts->count(),
            'completed_attempts' => $examSession->attempts->whereIn('status', ['submitted', 'graded'])->count(),
            'in_progress' => $examSession->attempts->where('status', 'in_progress')->count(),
            'average_score' => $examSession->attempts
                ->whereIn('status', ['submitted', 'graded'])
                ->avg('percentage') ?? 0,
            'highest_score' => $examSession->attempts
                ->whereIn('status', ['submitted', 'graded'])
                ->max('percentage') ?? 0,
            'lowest_score' => $examSession->attempts
                ->whereIn('status', ['submitted', 'graded'])
                ->min('percentage') ?? 0,
        ];

        return Inertia::render('exam-sessions/show', [
            'session' => $examSession,
            'stats' => $stats,
        ]);
    }

    public function edit(ExamSession $examSession): Response
    {
        $this->authorizeSession($examSession);

        $examSession->load('exam.module');

        $exams = Exam::with('module')
            ->where('status', 'published')
            ->when(! auth()->user()->hasRole('super-admin'), function ($query) {
                $query->where('created_by', auth()->id());
            })
            ->get(['id', 'title', 'module_id', 'total_items', 'total_points', 'time_limit']);

        return Inertia::render('exam-sessions/edit', [
            'session' => $examSession,
            'exams' => $exams,
        ]);
    }

    public function update(Request $request, ExamSession $examSession): RedirectResponse
    {
        $this->authorizeSession($examSession);

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'start_time' => ['required', 'date'],
            'end_time' => ['required', 'date', 'after:start_time'],
            'max_attempts' => ['required', 'integer', 'min:1', 'max:10'],
            'shuffle_questions' => ['boolean'],
            'shuffle_options' => ['boolean'],
            'show_results_immediately' => ['boolean'],
            'show_correct_answers' => ['boolean'],
            'allow_review' => ['boolean'],
            'status' => ['required', 'in:draft,active,ended'],
        ]);

        // Calculate time limit from session duration
        $startTime = new \DateTime($validated['start_time']);
        $endTime = new \DateTime($validated['end_time']);
        $durationMinutes = (int) (($endTime->getTimestamp() - $startTime->getTimestamp()) / 60);

        $examSession->update([
            ...$validated,
            'time_limit_minutes' => $durationMinutes,
        ]);

        return redirect()->route('exam-sessions.show', $examSession)
            ->with('success', 'Exam session updated successfully.');
    }

    public function destroy(ExamSession $examSession): RedirectResponse
    {
        $this->authorizeSession($examSession);

        if ($examSession->attempts()->exists()) {
            return back()->withErrors([
                'error' => 'Cannot delete a session that has student attempts.',
            ]);
        }

        $examSession->delete();

        return redirect()->route('exam-sessions.index')
            ->with('success', 'Exam session deleted successfully.');
    }

    public function regenerateCode(ExamSession $examSession): RedirectResponse
    {
        $this->authorizeSession($examSession);

        $examSession->update([
            'access_code' => strtoupper(\Illuminate\Support\Str::random(8)),
        ]);

        return back()->with('success', 'Access code regenerated successfully.');
    }

    public function results(ExamSession $examSession): Response
    {
        $this->authorizeSession($examSession);

        $attempts = $examSession->attempts()
            ->with(['user', 'answers.question'])
            ->orderByDesc('submitted_at')
            ->paginate(50);

        return Inertia::render('exam-sessions/results', [
            'session' => $examSession->load('exam.module'),
            'attempts' => $attempts,
        ]);
    }

    public function exportResults(ExamSession $examSession)
    {
        $this->authorizeSession($examSession);

        // Log access for audit purposes
        \Illuminate\Support\Facades\Log::info('Exam results exported', [
            'exam_session_id' => $examSession->id,
            'session_title' => $examSession->title,
            'exported_by' => auth()->id(),
            'exporter_email' => auth()->user()->email,
            'ip_address' => request()->ip(),
            'timestamp' => now()->toIso8601String(),
        ]);

        $attempts = $examSession->attempts()
            ->with(['user'])
            ->whereIn('status', ['submitted', 'graded'])
            ->orderBy('user_id')
            ->get();

        $csvContent = "Student Name,Email,Attempt #,Score,Percentage,Submitted At,Time Spent\n";

        foreach ($attempts as $attempt) {
            $csvContent .= sprintf(
                "%s,%s,%d,%.2f,%.2f%%,%s,%d minutes\n",
                $attempt->user->name,
                $attempt->user->email,
                $attempt->attempt_number,
                $attempt->score,
                $attempt->percentage,
                $attempt->submitted_at?->format('Y-m-d H:i:s'),
                floor($attempt->time_spent_seconds / 60)
            );
        }

        $filename = sprintf(
            '%s-results-%s.csv',
            \Illuminate\Support\Str::slug($examSession->title),
            now()->format('Y-m-d')
        );

        return response($csvContent)
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', "attachment; filename=\"{$filename}\"");
    }

    /**
     * View plagiarism report for essay questions in this session.
     */
    public function plagiarismReport(ExamSession $examSession): Response
    {
        $this->authorizeSession($examSession);

        $reports = $this->plagiarismService->generateReport($examSession);

        return Inertia::render('exam-sessions/plagiarism-report', [
            'session' => [
                'id' => $examSession->id,
                'title' => $examSession->title,
                'access_code' => $examSession->access_code,
            ],
            'reports' => $reports,
        ]);
    }

    protected function authorizeSession(ExamSession $session): void
    {
        if (! auth()->user()->hasRole('super-admin') && $session->created_by !== auth()->id()) {
            abort(403);
        }
    }
}
