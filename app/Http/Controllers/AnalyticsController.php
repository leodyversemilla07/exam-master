<?php

namespace App\Http\Controllers;

use App\Models\Exam;
use App\Models\Module;
use App\Models\Topic;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
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

        $query = Exam::query()
            ->whereBetween('created_at', [$startDate, $endDate])
            ->selectRaw('DATE(created_at) as date, COUNT(*) as count');

        // Group by period
        if ($period === 'day') {
            $query->groupByRaw('DATE(created_at)');
        } elseif ($period === 'week') {
            $query->selectRaw('YEARWEEK(created_at) as week, COUNT(*) as count')
                ->groupByRaw('YEARWEEK(created_at)');
        } elseif ($period === 'month') {
            $query->selectRaw('YEAR(created_at) as year, MONTH(created_at) as month, COUNT(*) as count')
                ->groupByRaw('YEAR(created_at), MONTH(created_at)');
        } elseif ($period === 'year') {
            $query->selectRaw('YEAR(created_at) as year, COUNT(*) as count')
                ->groupByRaw('YEAR(created_at)');
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
            ->get(['id', 'code', 'title', 'tos_generates_count']);

        // Most used topics
        $topics = Topic::query()
            ->join('learning_objectives', 'topics.id', '=', 'learning_objectives.topic_id')
            ->join('exam_items', 'learning_objectives.id', '=', 'exam_items.learning_objective_id')
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
                    fputcsv($handle, ['Module', $module->code, $module->title, $module->tos_generates_count]);
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
}
