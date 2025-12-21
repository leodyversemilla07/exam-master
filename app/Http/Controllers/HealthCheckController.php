<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class HealthCheckController extends Controller
{
    /**
     * Perform a health check on the application.
     */
    public function __invoke(): JsonResponse
    {
        $checks = [
            'status' => 'healthy',
            'timestamp' => now()->toIso8601String(),
            'checks' => [
                'database' => $this->checkDatabase(),
                'cache' => $this->checkCache(),
                'queue' => $this->checkQueue(),
            ],
        ];

        // Overall status
        $allHealthy = collect($checks['checks'])->every(fn ($check) => $check['status'] === 'healthy');
        $checks['status'] = $allHealthy ? 'healthy' : 'unhealthy';

        $statusCode = $allHealthy ? 200 : 503;

        return response()->json($checks, $statusCode);
    }

    /**
     * Check database connection.
     */
    private function checkDatabase(): array
    {
        try {
            DB::connection()->getPdo();
            DB::connection()->getDatabaseName();

            return [
                'status' => 'healthy',
                'message' => 'Database connection successful',
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'unhealthy',
                'message' => 'Database connection failed: '.$e->getMessage(),
            ];
        }
    }

    /**
     * Check cache system.
     */
    private function checkCache(): array
    {
        try {
            $key = 'health_check_'.time();
            $value = 'test';

            Cache::put($key, $value, 10);
            $retrieved = Cache::get($key);
            Cache::forget($key);

            if ($retrieved === $value) {
                return [
                    'status' => 'healthy',
                    'message' => 'Cache system operational',
                ];
            }

            return [
                'status' => 'unhealthy',
                'message' => 'Cache read/write failed',
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'unhealthy',
                'message' => 'Cache system error: '.$e->getMessage(),
            ];
        }
    }

    /**
     * Check queue system.
     */
    private function checkQueue(): array
    {
        try {
            // Check if jobs table exists and is accessible
            $failedJobsCount = DB::table('failed_jobs')->count();

            return [
                'status' => 'healthy',
                'message' => 'Queue system operational',
                'failed_jobs' => $failedJobsCount,
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'unhealthy',
                'message' => 'Queue system error: '.$e->getMessage(),
            ];
        }
    }
}
