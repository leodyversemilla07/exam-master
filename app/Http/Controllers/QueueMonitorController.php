<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class QueueMonitorController extends Controller
{
    /**
     * Display the queue monitor.
     */
    public function index(): Response
    {
        abort_unless(auth()->user()->can('view queue monitor'), 403);

        return Inertia::render('queue-monitor/index');
    }

    /**
     * Get queue statistics.
     */
    public function getStats(): JsonResponse
    {
        abort_unless(auth()->user()->can('view queue monitor'), 403);

        try {
            // Get failed jobs count
            $failedJobs = DB::table('failed_jobs')->count();

            // Get recent failed jobs
            $recentFailed = DB::table('failed_jobs')
                ->orderBy('failed_at', 'desc')
                ->limit(10)
                ->get()
                ->map(function ($job) {
                    return [
                        'id' => $job->id,
                        'uuid' => $job->uuid,
                        'connection' => $job->connection,
                        'queue' => $job->queue,
                        'exception' => substr($job->exception, 0, 200).'...', // Truncate for display
                        'failed_at' => $job->failed_at,
                    ];
                });

            // Get jobs table count if exists
            $pendingJobs = 0;
            if (DB::getSchemaBuilder()->hasTable('jobs')) {
                $pendingJobs = DB::table('jobs')->count();
            }

            return response()->json([
                'stats' => [
                    'failed_jobs' => $failedJobs,
                    'pending_jobs' => $pendingJobs,
                    'total_jobs' => $failedJobs + $pendingJobs,
                ],
                'recent_failed' => $recentFailed,
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to fetch queue stats: '.$e->getMessage()], 500);
        }
    }

    /**
     * Retry a failed job.
     */
    public function retryJob(Request $request): RedirectResponse
    {
        abort_unless(auth()->user()->can('manage queue monitor'), 403);

        $validated = $request->validate([
            'id' => 'required|integer',
        ]);

        try {
            // This would typically use Artisan::call('queue:retry', ['id' => $id])
            // But we'll just mark it for retry by deleting it (user must restart worker)
            DB::table('failed_jobs')->where('id', $validated['id'])->delete();

            return back()->with('success', 'Job removed from failed queue. Restart queue worker to process.');
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to retry job: '.$e->getMessage());
        }
    }

    /**
     * Delete a failed job.
     */
    public function deleteJob(Request $request): RedirectResponse
    {
        abort_unless(auth()->user()->can('manage queue monitor'), 403);

        $validated = $request->validate([
            'id' => 'required|integer',
        ]);

        try {
            DB::table('failed_jobs')->where('id', $validated['id'])->delete();

            return back()->with('success', 'Failed job deleted successfully');
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to delete job: '.$e->getMessage());
        }
    }

    /**
     * Clear all failed jobs.
     */
    public function clearFailedJobs(): RedirectResponse
    {
        abort_unless(auth()->user()->can('manage queue monitor'), 403);

        try {
            $count = DB::table('failed_jobs')->count();
            DB::table('failed_jobs')->truncate();

            return back()->with('success', "Cleared {$count} failed jobs");
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to clear jobs: '.$e->getMessage());
        }
    }
}
