<?php

namespace App\Http\Controllers;

use App\Models\Exam;
use App\Models\ExamAttempt;
use App\Models\ExamSession;
use App\Models\Module;
use App\Models\StudentAnswer;
use App\Models\Topic;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AnalyticsController extends Controller
{
    /**
     * Display analytics dashboard.
     */
    public function index(): Response
    {
        abort_unless(auth()->user()->can('view analytics'), 403);

        return Inertia::render('analytics/index');
    }

    /**
     * Get exams created per period.
     */
    public function examsCreatedPerPeriod(Request $request): JsonResponse
    {
        abort_unless(auth()->user()->can('view analytics'), 403);

        $validated = $request->validate([
            'period' => 'required|in:day,week,month,year',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
        ]);

        $period = $validated['period'];
        $startDate = $validated['start_date'] ?? Carbon::now()->subMonth();
        $endDate = $validated['end_date'] ?? Carbon::now();

        $isSqlite = DB::getDriverName() === 'sqlite';

        $query = Exam::query()
            ->whereBetween('created_at', [$startDate, $endDate]);

        // Group by period
        if ($period === 'day') {
            $query->selectRaw('DATE(created_at) as date, COUNT(*) as count')
                ->groupByRaw('DATE(created_at)');
        } elseif ($period === 'week') {
            if ($isSqlite) {
                $query->selectRaw("strftime('%Y-%W', created_at) as week, COUNT(*) as count")
                    ->groupByRaw("strftime('%Y-%W', created_at)");
            } else {
                $query->selectRaw('YEARWEEK(created_at) as week, COUNT(*) as count')
                    ->groupByRaw('YEARWEEK(created_at)');
            }
        } elseif ($period === 'month') {
            if ($isSqlite) {
                $query->selectRaw("strftime('%Y-%m', created_at) as month, COUNT(*) as count")
                    ->groupByRaw("strftime('%Y-%m', created_at)");
            } else {
                $query->selectRaw('YEAR(created_at) as year, MONTH(created_at) as month, COUNT(*) as count')
                    ->groupByRaw('YEAR(created_at), MONTH(created_at)');
            }
        } elseif ($period === 'year') {
            if ($isSqlite) {
                $query->selectRaw("strftime('%Y', created_at) as year, COUNT(*) as count")
                    ->groupByRaw("strftime('%Y', created_at)");
            } else {
                $query->selectRaw('YEAR(created_at) as year, COUNT(*) as count')
                    ->groupByRaw('YEAR(created_at)');
            }
        }

        $data = $query->get();

        return response()->json([
            'period' => $period,
            'data' => $data,
            'total' => $data->sum('count'),
        ]);
    }

    /**
     * Get most used modules and topics.
     */
    public function mostUsedModulesAndTopics(Request $request): JsonResponse
    {
        abort_unless(auth()->user()->can('view analytics'), 403);

        $validated = $request->validate([
            'limit' => 'nullable|integer|min:1|max:50',
        ]);

        $limit = $validated['limit'] ?? 10;

        // Most used modules
        $modules = Module::query()
            ->withCount('tosGenerates')
            ->orderByDesc('tos_generates_count')
            ->limit($limit)
            ->get(['id', 'code', 'name', 'tos_generates_count']);

        // Most used topics
        $topics = Topic::query()
            ->join('learning_objectives', 'topics.id', '=', 'learning_objectives.topic_id')
            ->join('exam_questions', 'learning_objectives.code', '=', 'exam_questions.learning_objective_code')
            ->join('exam_items', 'exam_questions.id', '=', 'exam_items.exam_question_id')
            ->selectRaw('topics.id, topics.code, topics.title, COUNT(DISTINCT exam_items.id) as usage_count')
            ->groupBy('topics.id', 'topics.code', 'topics.title')
            ->orderByDesc('usage_count')
            ->limit($limit)
            ->get();

        return response()->json([
            'modules' => $modules,
            'topics' => $topics,
        ]);
    }

    /**
     * Get educator activity reports.
     */
    public function educatorActivity(Request $request): JsonResponse
    {
        abort_unless(auth()->user()->can('view analytics'), 403);

        $validated = $request->validate([
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
        ]);

        $startDate = $validated['start_date'] ?? Carbon::now()->subMonth();
        $endDate = $validated['end_date'] ?? Carbon::now();

        $educators = User::query()
            ->role('educator')
            ->withCount([
                'tosGenerates as tos_created' => function ($query) use ($startDate, $endDate) {
                    $query->whereBetween('created_at', [$startDate, $endDate]);
                },
                'exams as exams_created' => function ($query) use ($startDate, $endDate) {
                    $query->whereBetween('created_at', [$startDate, $endDate]);
                },
            ])
            ->having('tos_created', '>', 0)
            ->orHaving('exams_created', '>', 0)
            ->get(['id', 'name', 'email']);

        return response()->json([
            'educators' => $educators,
            'period' => [
                'start' => $startDate,
                'end' => $endDate,
            ],
        ]);
    }

    /**
     * Export analytics report to CSV.
     */
    public function exportCsv(Request $request): \Symfony\Component\HttpFoundation\StreamedResponse
    {
        abort_unless(auth()->user()->can('view analytics'), 403);

        $validated = $request->validate([
            'type' => 'required|in:exams_created,modules_topics,educator_activity',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
        ]);

        $type = $validated['type'];
        $startDate = $validated['start_date'] ?? Carbon::now()->subMonth();
        $endDate = $validated['end_date'] ?? Carbon::now();

        $filename = "analytics_{$type}_".Carbon::now()->format('Y-m-d').'.csv';

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        return response()->stream(function () use ($type, $startDate, $endDate) {
            $handle = fopen('php://output', 'w');

            if ($type === 'exams_created') {
                fputcsv($handle, ['Date', 'Exams Created']);
                $data = Exam::query()
                    ->whereBetween('created_at', [$startDate, $endDate])
                    ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
                    ->groupByRaw('DATE(created_at)')
                    ->orderBy('date')
                    ->get();

                foreach ($data as $row) {
                    fputcsv($handle, [$row->date, $row->count]);
                }
            } elseif ($type === 'modules_topics') {
                fputcsv($handle, ['Type', 'Code', 'Title', 'Usage Count']);

                $modules = Module::query()
                    ->withCount('tosGenerates')
                    ->orderByDesc('tos_generates_count')
                    ->limit(50)
                    ->get();

                foreach ($modules as $module) {
                    fputcsv($handle, ['Module', $module->code, $module->name, $module->tos_generates_count]);
                }
            } elseif ($type === 'educator_activity') {
                fputcsv($handle, ['Educator Name', 'Email', 'TOS Created', 'Exams Created']);

                $educators = User::query()
                    ->role('educator')
                    ->withCount([
                        'tosGenerates as tos_created' => function ($query) use ($startDate, $endDate) {
                            $query->whereBetween('created_at', [$startDate, $endDate]);
                        },
                        'exams as exams_created' => function ($query) use ($startDate, $endDate) {
                            $query->whereBetween('created_at', [$startDate, $endDate]);
                        },
                    ])
                    ->get();

                foreach ($educators as $educator) {
                    fputcsv($handle, [
                        $educator->name,
                        $educator->email,
                        $educator->tos_created,
                        $educator->exams_created,
                    ]);
                }
            }

            fclose($handle);
        }, 200, $headers);
    }

    /**
     * Get student performance analytics.
     */
    public function studentPerformance(Request $request): JsonResponse
    {
        abort_unless(auth()->user()->can('view analytics'), 403);

        $validated = $request->validate([
            'session_id' => 'nullable|exists:exam_sessions,id',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
        ]);

        $startDate = $validated['start_date'] ?? Carbon::now()->subMonth();
        $endDate = $validated['end_date'] ?? Carbon::now();

        $query = ExamAttempt::query()
            ->whereIn('status', ['submitted', 'graded'])
            ->whereBetween('submitted_at', [$startDate, $endDate]);

        if (isset($validated['session_id'])) {
            $query->where('exam_session_id', $validated['session_id']);
        }

        $attempts = $query->get();

        $scoreDistribution = [
            '0-20' => $attempts->whereBetween('percentage', [0, 20])->count(),
            '21-40' => $attempts->whereBetween('percentage', [21, 40])->count(),
            '41-60' => $attempts->whereBetween('percentage', [41, 60])->count(),
            '61-80' => $attempts->whereBetween('percentage', [61, 80])->count(),
            '81-100' => $attempts->whereBetween('percentage', [81, 100])->count(),
        ];

        $avgTimeSpent = $attempts->avg('time_spent_seconds') ?? 0;

        return response()->json([
            'total_attempts' => $attempts->count(),
            'average_score' => round($attempts->avg('percentage') ?? 0, 2),
            'highest_score' => round($attempts->max('percentage') ?? 0, 2),
            'lowest_score' => round($attempts->min('percentage') ?? 0, 2),
            'passing_rate' => $attempts->count() > 0
                ? round(($attempts->where('percentage', '>=', 60)->count() / $attempts->count()) * 100, 2)
                : 0,
            'score_distribution' => $scoreDistribution,
            'average_time_spent_minutes' => round($avgTimeSpent / 60, 2),
        ]);
    }

    /**
     * Get question difficulty analysis based on student answers.
     */
    public function questionDifficultyAnalysis(Request $request): JsonResponse
    {
        abort_unless(auth()->user()->can('view analytics'), 403);

        $validated = $request->validate([
            'session_id' => 'nullable|exists:exam_sessions,id',
            'limit' => 'nullable|integer|min:1|max:100',
        ]);

        $limit = $validated['limit'] ?? 20;

        $query = StudentAnswer::query()
            ->select('exam_question_id', DB::raw('COUNT(*) as total_answers'), DB::raw('SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correct_answers'))
            ->with('question')
            ->groupBy('exam_question_id');

        if (isset($validated['session_id'])) {
            $query->whereHas('attempt', function ($q) use ($validated) {
                $q->where('exam_session_id', $validated['session_id']);
            });
        }

        $questionStats = $query->get()->map(function ($item) {
            $correctRate = $item->total_answers > 0
                ? round(($item->correct_answers / $item->total_answers) * 100, 2)
                : 0;

            return [
                'question_id' => $item->exam_question_id,
                'question_text' => $item->question->question_text ?? 'Unknown',
                'question_type' => $item->question->question_type ?? 'Unknown',
                'total_answers' => $item->total_answers,
                'correct_answers' => $item->correct_answers,
                'correct_rate' => $correctRate,
                'difficulty' => $correctRate >= 70 ? 'Easy' : ($correctRate >= 40 ? 'Medium' : 'Hard'),
            ];
        });

        $hardestQuestions = $questionStats->sortBy('correct_rate')->take($limit)->values();
        $easiestQuestions = $questionStats->sortByDesc('correct_rate')->take($limit)->values();

        return response()->json([
            'hardest_questions' => $hardestQuestions,
            'easiest_questions' => $easiestQuestions,
            'overall_correct_rate' => round($questionStats->avg('correct_rate') ?? 0, 2),
        ]);
    }

    /**
     * Get exam session performance summary.
     */
    public function sessionPerformance(Request $request): JsonResponse
    {
        abort_unless(auth()->user()->can('view analytics'), 403);

        $validated = $request->validate([
            'limit' => 'nullable|integer|min:1|max:50',
        ]);

        $limit = $validated['limit'] ?? 10;

        $sessions = ExamSession::query()
            ->withCount([
                'attempts as total_attempts',
                'attempts as completed_attempts' => function ($q) {
                    $q->whereIn('status', ['submitted', 'graded']);
                },
            ])
            ->withAvg(['attempts as average_score' => function ($q) {
                $q->whereIn('status', ['submitted', 'graded']);
            }], 'percentage')
            ->with('exam.module')
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get()
            ->map(function ($session) {
                return [
                    'id' => $session->id,
                    'title' => $session->title,
                    'exam_title' => $session->exam->title ?? 'Unknown',
                    'module_name' => $session->exam->module->name ?? 'Unknown',
                    'status' => $session->status,
                    'total_attempts' => $session->total_attempts,
                    'completed_attempts' => $session->completed_attempts,
                    'average_score' => round($session->average_score ?? 0, 2),
                    'completion_rate' => $session->total_attempts > 0
                        ? round(($session->completed_attempts / $session->total_attempts) * 100, 2)
                        : 0,
                    'start_time' => $session->start_time,
                    'end_time' => $session->end_time,
                ];
            });

        return response()->json([
            'sessions' => $sessions,
        ]);
    }

    /**
     * Export student performance data.
     */
    public function exportStudentPerformance(Request $request)
    {
        abort_unless(auth()->user()->can('view analytics'), 403);

        $validated = $request->validate([
            'session_id' => 'nullable|exists:exam_sessions,id',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
        ]);

        $startDate = $validated['start_date'] ?? Carbon::now()->subMonth();
        $endDate = $validated['end_date'] ?? Carbon::now();

        $query = ExamAttempt::query()
            ->with(['user', 'examSession.exam.module'])
            ->whereIn('status', ['submitted', 'graded'])
            ->whereBetween('submitted_at', [$startDate, $endDate]);

        if (isset($validated['session_id'])) {
            $query->where('exam_session_id', $validated['session_id']);
        }

        $attempts = $query->orderBy('submitted_at', 'desc')->get();

        $filename = 'student-performance-'.now()->format('Y-m-d').'.csv';
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        return response()->stream(function () use ($attempts) {
            $handle = fopen('php://output', 'w');

            fputcsv($handle, [
                'Student Name',
                'Email',
                'Exam Session',
                'Module',
                'Score',
                'Percentage',
                'Time Spent (min)',
                'Submitted At',
                'Status',
            ]);

            foreach ($attempts as $attempt) {
                fputcsv($handle, [
                    $attempt->user->name,
                    $attempt->user->email,
                    $attempt->examSession->title,
                    $attempt->examSession->exam->module->name ?? 'Unknown',
                    $attempt->correct_answers.'/'.$attempt->total_questions,
                    $attempt->percentage.'%',
                    round($attempt->time_spent_seconds / 60, 2),
                    $attempt->submitted_at?->format('Y-m-d H:i:s'),
                    $attempt->status,
                ]);
            }

            fclose($handle);
        }, 200, $headers);
    }
}
