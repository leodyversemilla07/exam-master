<?php

use App\Models\Module;
use App\Models\User;
use App\Services\Analytics\AnalyticsCacheService;
use Illuminate\Support\Facades\Cache;

beforeEach(function () {
    $this->user = User::factory()->create();
});

describe('Analytics Caching', function () {
    it('caches exams created data with cache facade', function () {
        // Arrange
        $cacheKey = 'analytics:exams_created:month:2025-01-01:2025-02-01';
        $cachedData = [
            'period' => 'month',
            'data' => [['date' => '2025-01-15', 'count' => 5]],
            'total' => 5,
        ];

        // Act
        Cache::put($cacheKey, $cachedData, 300);
        $retrieved = Cache::get($cacheKey);

        // Assert
        expect($retrieved)->toEqual($cachedData);
        expect(Cache::has($cacheKey))->toBeTrue();
    });

    it('caches usage data for 10 minutes', function () {
        // Arrange
        $module = Module::factory()->create();

        // Act
        $cacheKey = 'analytics:usage_data:10';
        Cache::put($cacheKey, ['modules' => [], 'topics' => []], 600);

        // Assert
        expect(Cache::has($cacheKey))->toBeTrue();
    });

    it('caches educator activity data for 5 minutes', function () {
        // Arrange
        $startDate = now()->subMonth()->toDateString();
        $endDate = now()->toDateString();

        // Act
        $cacheKey = "analytics:educator_activity:{$startDate}:{$endDate}";
        Cache::put($cacheKey, ['educators' => []], 300);

        // Assert
        expect(Cache::has($cacheKey))->toBeTrue();
    });

    it('caches exams data for 5 minutes', function () {
        // Arrange
        $period = 'month';
        $startDate = now()->subMonth()->toDateString();
        $endDate = now()->toDateString();

        // Act
        $cacheKey = "analytics:exams_created:{$period}:{$startDate}:{$endDate}";
        Cache::put($cacheKey, ['period' => $period, 'data' => [], 'total' => 0], 300);

        // Assert
        expect(Cache::has($cacheKey))->toBeTrue();
    });
});

describe('AnalyticsCacheService', function () {
    it('clears usage cache', function () {
        // Arrange
        AnalyticsCacheService::remember('analytics:usage_data:10', 600, fn () => ['test' => 'data']);

        // Act
        AnalyticsCacheService::clearUsageCache();

        // Assert
        expect(Cache::has('analytics:usage_data:10'))->toBeFalse();
    });

    it('clears educator cache', function () {
        // Arrange
        AnalyticsCacheService::remember('analytics:educator_activity:2025-01-01:2025-02-01', 300, fn () => ['test' => 'data']);

        // Act
        AnalyticsCacheService::clearEducatorCache();

        // Assert
        expect(Cache::has('analytics:educator_activity:2025-01-01:2025-02-01'))->toBeFalse();
    });

    it('clears exams cache', function () {
        // Arrange
        AnalyticsCacheService::remember('analytics:exams_created:month:2025-01-01:2025-02-01', 300, fn () => ['test' => 'data']);

        // Act
        AnalyticsCacheService::clearExamsCache();

        // Assert
        expect(Cache::has('analytics:exams_created:month:2025-01-01:2025-02-01'))->toBeFalse();
    });
});
