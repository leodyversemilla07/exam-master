<?php

namespace App\Http\Controllers;

use App\Models\Exam;
use App\Models\ExamAttempt;
use App\Models\ExamSession;
use App\Models\Module;
use App\Models\StudentAnswer;
use App\Models\Topic;
use App\Models\User;
use App\Services\Analytics\Exporters\CsvExporterFactory;
use App\Services\Analytics\PeriodQueryBuilder;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AnalyticsController extends Controller
{
    public function __construct(
        private PeriodQueryBuilder $periodQueryBuilder
    ) {}

    /**
     * Display analytics dashboard.
     */
    public function index(Request $request): Response
    {
        abort_unless(auth()->user()->can('view analytics'), 403);

        $validated = $request->validate([
            'period' => 'nullable|in:day,week,month,year',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
        ]);

        $period = $validated['period'] ?? 'month';
        $startDate = $validated['start_date'] ?? null;
        $endDate = $validated['end_date'] ?? null;

        return Inertia::render('analytics/index', [
            'filters' => [
                'period' => $period,
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
            'examsData' => $this->getExamsCreatedData($period, $startDate, $endDate),
            'usageData' => $this->getUsageData(),
            'educatorData' => $this->getEducatorActivityData($startDate, $endDate),
        ]);
    }

    /**
     * Get exams created data.
     */
    private function getExamsCreatedData(string $period, ?string $startDate, ?string $endDate): array
    {
        $startDate = $startDate ?? Carbon::now()->subMonth();
        $endDate = $endDate ?? Carbon::now();

        $query = Exam::query()
            ->whereBetween('created_at', [$startDate, $endDate]);

        $this->periodQueryBuilder->groupByPeriod($query, $period);

        $data = $query->get();

        return [
            'period' => $period,
            'data' => $data,
            'total' => $data->sum('count'),
        ];
    }

    /**
     * Get usage data.
     */
    private function getUsageData(int $limit = 10): array
    {
        return [
            'modules' => $this->getMostUsedModules($limit),
            'topics' => $this->getMostUsedTopics($limit),
        ];
    }

    /**
     * Get most used modules.
     */
    private function getMostUsedModules(int $limit): \Illuminate\Database\Eloquent\Collection
    {
        return Module::query()
            ->withCount('tosGenerates')
            ->orderByDesc('tos_generates_count')
            ->limit($limit)
            ->get(['id', 'code', 'name as title', 'tos_generates_count']);
    }

    /**
     * Get most used topics.
     */
    private function getMostUsedTopics(int $limit): \Illuminate\Support\Collection
    {
        return Topic::query()
            ->join('learning_objectives', 'topics.id', '=', 'learning_objectives.topic_id')
            ->join('exam_questions', 'learning_objectives.code', '=', 'exam_questions.learning_objective_code')
            ->join('exam_items', 'exam_questions.id', '=', 'exam_items.exam_question_id')
            ->selectRaw('topics.id, topics.code, topics.title, COUNT(DISTINCT exam_items.id) as usage_count')
            ->groupBy('topics.id', 'topics.code', 'topics.title')
            ->orderByDesc('usage_count')
            ->limit($limit)
            ->get();
    }

    /**
     * Get educator activity data.
     */
    private function getEducatorActivityData(?string $startDate, ?string $endDate): array
    {
        $startDate = $startDate ?? Carbon::now()->subMonth();
        $endDate = $endDate ?? Carbon::now();

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
            ->get(['id', 'name', 'email', 'tos_created', 'exams_created']);

        return [
            'educators' => $educators,
            'period' => [
                'start' => $startDate,
                'end' => $endDate,
            ],
        ];
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

        $query = Exam::query()
            ->whereBetween('created_at', [$startDate, $endDate]);

        $this->periodQueryBuilder->groupByPeriod($query, $period);

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

        return response()->json([
            'modules' => $this->getMostUsedModules($limit),
            'topics' => $this->getMostUsedTopics($limit),
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

        $data = $this->getEducatorActivityData(
            $validated['start_date'] ?? null,
            $validated['end_date'] ?? null
        );

        return response()->json([
            'educators' => $data['educators'],
            'period' => $data['period'],
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
        $startDate = Carbon::parse($validated['start_date'] ?? Carbon::now()->subMonth());
        $endDate = Carbon::parse($validated['end_date'] ?? Carbon::now());

        $filename = "analytics_{$type}_".Carbon::now()->format('Y-m-d').'.csv';

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $exporter = CsvExporterFactory::create($type);

        return response()->stream(function () use ($exporter, $startDate, $endDate) {
            $handle = fopen('php://output', 'w');
            $exporter->export($handle, $startDate, $endDate);
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

        return response()->json([
            'total_attempts' => $attempts->count(),
            'average_score' => round($attempts->avg('percentage') ?? 0, 2),
            'highest_score' => round($attempts->max('percentage') ?? 0, 2),
            'lowest_score' => round($attempts->min('percentage') ?? 0, 2),
            'passing_rate' => $attempts->count() > 0
                ? round(($attempts->where('percentage', '>=', 60)->count() / $attempts->count()) * 100, 2)
                : 0,
            'score_distribution' => $this->calculateScoreDistribution($attempts),
            'average_time_spent_minutes' => round(($attempts->avg('time_spent_seconds') ?? 0) / 60, 2),
        ]);
    }

    /**
     * Calculate score distribution across ranges.
     */
    private function calculateScoreDistribution(\Illuminate\Support\Collection $attempts): array
    {
        return [
            '0-20' => $attempts->whereBetween('percentage', [0, 20])->count(),
            '21-40' => $attempts->whereBetween('percentage', [21, 40])->count(),
            '41-60' => $attempts->whereBetween('percentage', [41, 60])->count(),
            '61-80' => $attempts->whereBetween('percentage', [61, 80])->count(),
            '81-100' => $attempts->whereBetween('percentage', [81, 100])->count(),
        ];
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
                'difficulty' => $this->calculateDifficultyLabel($correctRate),
            ];
        });

        return response()->json([
            'hardest_questions' => $questionStats->sortBy('correct_rate')->take($limit)->values(),
            'easiest_questions' => $questionStats->sortByDesc('correct_rate')->take($limit)->values(),
            'overall_correct_rate' => round($questionStats->avg('correct_rate') ?? 0, 2),
        ]);
    }

    /**
     * Calculate difficulty label based on correct rate.
     */
    private function calculateDifficultyLabel(float $correctRate): string
    {
        return match (true) {
            $correctRate >= 70 => 'Easy',
            $correctRate >= 40 => 'Medium',
            default => 'Hard',
        };
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
