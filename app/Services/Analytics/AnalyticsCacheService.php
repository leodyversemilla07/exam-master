<?php

namespace App\Services\Analytics;

use Closure;
use DateInterval;
use DateTimeInterface;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class AnalyticsCacheService
{
    private const RegistryKey = 'analytics:cache_keys';

    /**
     * Remember an analytics value and track the key for targeted invalidation.
     */
    public static function remember(string $key, DateTimeInterface|DateInterval|int|null $ttl, Closure $callback): mixed
    {
        self::registerKey($key);

        return Cache::remember($key, $ttl, $callback);
    }

    /**
     * Clear all analytics cache.
     */
    public static function clearAll(): void
    {
        self::clearByPattern('analytics:*');
    }

    /**
     * Clear exams created data cache.
     */
    public static function clearExamsCache(): void
    {
        self::clearByPattern('analytics:exams_created:*');
    }

    /**
     * Clear usage data cache.
     */
    public static function clearUsageCache(): void
    {
        self::clearByPattern('analytics:usage_data:*');
    }

    /**
     * Clear educator activity cache.
     */
    public static function clearEducatorCache(): void
    {
        self::clearByPattern('analytics:educator_activity:*');
    }

    /**
     * Clear cache for specific date range.
     */
    public static function clearForDateRange(?string $startDate = null, ?string $endDate = null): void
    {
        if ($startDate && $endDate) {
            $periods = ['day', 'week', 'month', 'year'];

            foreach ($periods as $period) {
                self::forget("analytics:exams_created:{$period}:{$startDate}:{$endDate}");
            }

            self::forget("analytics:educator_activity:{$startDate}:{$endDate}");

            return;
        }

        self::clearExamsCache();
        self::clearEducatorCache();
    }

    private static function clearByPattern(string $pattern): void
    {
        foreach (self::getCacheKeysByPattern($pattern) as $key) {
            self::forget($key);
        }
    }

    private static function forget(string $key): void
    {
        Cache::forget($key);

        $keys = array_values(array_filter(
            self::registeredKeys(),
            fn (string $registeredKey): bool => $registeredKey !== $key
        ));

        Cache::forever(self::RegistryKey, $keys);
    }

    private static function registerKey(string $key): void
    {
        $keys = self::registeredKeys();

        if (! in_array($key, $keys, true)) {
            $keys[] = $key;
            Cache::forever(self::RegistryKey, $keys);
        }
    }

    /**
     * @return array<int, string>
     */
    private static function registeredKeys(): array
    {
        return Cache::get(self::RegistryKey, []);
    }

    /**
     * @return array<int, string>
     */
    private static function getCacheKeysByPattern(string $pattern): array
    {
        return array_values(array_filter(
            self::registeredKeys(),
            fn (string $key): bool => Str::is($pattern, $key)
        ));
    }
}
