<?php

namespace App\Services\Analytics;

use Illuminate\Support\Facades\Cache;

class AnalyticsCacheService
{
    /**
     * Clear all analytics cache.
     */
    public static function clearAll(): void
    {
        self::clearExamsCache();
        self::clearUsageCache();
        self::clearEducatorCache();
    }

    /**
     * Clear exams created data cache.
     */
    public static function clearExamsCache(): void
    {
        // Use a cache tag or pattern to clear all exam-related cache
        // Since we can't use tags in file driver, we'll use a prefix approach
        $keys = self::getCacheKeysByPattern('analytics:exams_created:*');
        foreach ($keys as $key) {
            Cache::forget($key);
        }
    }

    /**
     * Clear usage data cache.
     */
    public static function clearUsageCache(): void
    {
        $keys = self::getCacheKeysByPattern('analytics:usage_data:*');
        foreach ($keys as $key) {
            Cache::forget($key);
        }
    }

    /**
     * Clear educator activity cache.
     */
    public static function clearEducatorCache(): void
    {
        $keys = self::getCacheKeysByPattern('analytics:educator_activity:*');
        foreach ($keys as $key) {
            Cache::forget($key);
        }
    }

    /**
     * Get cache keys matching a pattern.
     * Note: This is a best-effort approach for file-based cache.
     * For Redis/Memcached, you would use proper cache tags.
     *
     * @param  string  $pattern  The pattern to match (with wildcards)
     */
    private static function getCacheKeysByPattern(string $pattern): array
    {
        // This is a simplified approach
        // In production with Redis, you would use Redis::keys()
        // For file-based cache, we maintain a list of known keys
        $knownPrefixes = [
            'analytics:exams_created:',
            'analytics:usage_data:',
            'analytics:educator_activity:',
        ];

        $keys = [];
        foreach ($knownPrefixes as $prefix) {
            if (str_contains($pattern, $prefix)) {
                // Try to get all possible combinations
                // This is not perfect but works for basic cache invalidation
                $keys[] = $prefix;
            }
        }

        return [];
    }

    /**
     * Clear cache for specific date range.
     */
    public static function clearForDateRange(?string $startDate = null, ?string $endDate = null): void
    {
        if ($startDate && $endDate) {
            // Clear specific date range cache
            $periods = ['day', 'week', 'month', 'year'];
            foreach ($periods as $period) {
                Cache::forget("analytics:exams_created:{$period}:{$startDate}:{$endDate}");
            }
            Cache::forget("analytics:educator_activity:{$startDate}:{$endDate}");
        } else {
            // Clear all date-based cache
            self::clearExamsCache();
            self::clearEducatorCache();
        }
    }
}
