<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Inertia\Inertia;
use Inertia\Response;

class SystemLogsController extends Controller
{
    /**
     * Display the system logs viewer.
     */
    public function index(): Response
    {
        abort_unless(auth()->user()->can('view users'), 403);

        return Inertia::render('system-logs/index');
    }

    /**
     * Get the latest log entries.
     */
    public function getLogs(Request $request): \Illuminate\Http\JsonResponse
    {
        abort_unless(auth()->user()->can('view users'), 403);

        $validated = $request->validate([
            'lines' => 'nullable|integer|min:10|max:1000',
            'level' => 'nullable|in:emergency,alert,critical,error,warning,notice,info,debug',
        ]);

        $lines = $validated['lines'] ?? 100;
        $level = $validated['level'] ?? null;

        $logPath = storage_path('logs/laravel.log');

        if (! File::exists($logPath)) {
            return response()->json([
                'logs' => [],
                'total' => 0,
                'message' => 'Log file not found',
            ]);
        }

        try {
            $logContent = File::get($logPath);
            $logLines = explode("\n", $logContent);
            $logLines = array_reverse($logLines);
            $logLines = array_slice($logLines, 0, $lines * 5); // Get more lines to parse

            $parsedLogs = [];
            $currentLog = null;

            foreach ($logLines as $line) {
                if (empty(trim($line))) {
                    continue;
                }

                // Check if it's a new log entry (starts with timestamp)
                if (preg_match('/^\[(\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}:\d{2}).*?\]\s+(\w+)\.(\w+):\s+(.+)$/', $line, $matches)) {
                    // Save previous log if exists
                    if ($currentLog !== null) {
                        // Filter by level if specified
                        if ($level === null || strtolower($currentLog['level']) === strtolower($level)) {
                            $parsedLogs[] = $currentLog;
                        }
                    }

                    // Start new log entry
                    $currentLog = [
                        'timestamp' => $matches[1],
                        'environment' => $matches[2],
                        'level' => strtoupper($matches[3]),
                        'message' => $matches[4],
                        'stack_trace' => '',
                    ];
                } elseif ($currentLog !== null) {
                    // Append to stack trace
                    $currentLog['stack_trace'] .= $line."\n";
                }

                // Stop if we have enough logs
                if (count($parsedLogs) >= $lines) {
                    break;
                }
            }

            // Add the last log
            if ($currentLog !== null && count($parsedLogs) < $lines) {
                if ($level === null || strtolower($currentLog['level']) === strtolower($level)) {
                    $parsedLogs[] = $currentLog;
                }
            }

            return response()->json([
                'logs' => $parsedLogs,
                'total' => count($parsedLogs),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'logs' => [],
                'total' => 0,
                'error' => 'Failed to read log file: '.$e->getMessage(),
            ], 500);
        }
    }

    /**
     * Clear the log file.
     */
    public function clearLogs(): \Illuminate\Http\JsonResponse
    {
        abort_unless(auth()->user()->can('view users'), 403);

        $logPath = storage_path('logs/laravel.log');

        if (File::exists($logPath)) {
            File::put($logPath, '');

            return response()->json([
                'logs' => [],
                'total' => 0,
                'success' => true,
                'message' => 'Logs cleared successfully',
            ]);
        }

        return response()->json([
            'logs' => [],
            'total' => 0,
            'success' => false,
            'message' => 'Log file not found',
        ], 404);
    }

    /**
     * Download the log file.
     */
    public function downloadLogs(): \Symfony\Component\HttpFoundation\BinaryFileResponse
    {
        abort_unless(auth()->user()->can('view users'), 403);

        // Rate limiting: max 5 downloads per hour per user
        $rateLimitKey = 'log-download:'.auth()->id();
        $downloadCount = cache()->get($rateLimitKey, 0);

        if ($downloadCount >= 5) {
            abort(429, 'Too many download attempts. Please try again later.');
        }

        $logPath = storage_path('logs/laravel.log');

        if (! File::exists($logPath)) {
            abort(404, 'Log file not found');
        }

        // Increment download counter with 1-hour expiration
        cache()->put($rateLimitKey, $downloadCount + 1, now()->addHour());

        // Log the download for audit purposes
        \Illuminate\Support\Facades\Log::info('Log file downloaded', [
            'user_id' => auth()->id(),
            'user_email' => auth()->user()->email,
            'ip_address' => request()->ip(),
            'file_size' => File::size($logPath),
        ]);

        return response()->download($logPath, 'laravel-'.date('Y-m-d-His').'.log');
    }
}
