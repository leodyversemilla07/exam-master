<?php

use App\Models\Exam;
use App\Models\User;
use App\Services\Analytics\PeriodQueryBuilder;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;

beforeEach(function () {
    $this->builder = new PeriodQueryBuilder;
    $this->user = User::factory()->create();
});

describe('groupByPeriod', function () {
    it('groups by day period', function () {
        // Arrange
        Exam::factory()->count(3)->create([
            'created_by' => $this->user->id,
            'created_at' => Carbon::parse('2025-01-15 10:00:00'),
        ]);

        $query = Exam::query();

        // Act
        $result = $this->builder->groupByPeriod($query, 'day');
        $data = $result->get();

        // Assert
        expect($data)->toHaveCount(1);
        expect($data->first()->count)->toBe(3);
    });

    it('groups by week period', function () {
        // Arrange
        Exam::factory()->create([
            'created_by' => $this->user->id,
            'created_at' => Carbon::parse('2025-01-15'),
        ]);
        Exam::factory()->create([
            'created_by' => $this->user->id,
            'created_at' => Carbon::parse('2025-01-16'),
        ]);

        $query = Exam::query();

        // Act
        $result = $this->builder->groupByPeriod($query, 'week');
        $data = $result->get();

        // Assert
        expect($data)->toHaveCount(1);
        expect($data->first()->count)->toBe(2);
    });

    it('groups by month period', function () {
        // Arrange
        Exam::factory()->create([
            'created_by' => $this->user->id,
            'created_at' => Carbon::parse('2025-01-01'),
        ]);
        Exam::factory()->create([
            'created_by' => $this->user->id,
            'created_at' => Carbon::parse('2025-01-31'),
        ]);

        $query = Exam::query();

        // Act
        $result = $this->builder->groupByPeriod($query, 'month');
        $data = $result->get();

        // Assert
        expect($data)->toHaveCount(1);
        expect($data->first()->count)->toBe(2);
    });

    it('groups by year period', function () {
        // Arrange
        Exam::factory()->create([
            'created_by' => $this->user->id,
            'created_at' => Carbon::parse('2025-01-01'),
        ]);
        Exam::factory()->create([
            'created_by' => $this->user->id,
            'created_at' => Carbon::parse('2025-12-31'),
        ]);

        $query = Exam::query();

        // Act
        $result = $this->builder->groupByPeriod($query, 'year');
        $data = $result->get();

        // Assert
        expect($data)->toHaveCount(1);
        expect($data->first()->count)->toBe(2);
    });

    it('returns query unchanged for invalid period', function () {
        // Arrange
        $query = Exam::query();

        // Act
        $result = $this->builder->groupByPeriod($query, 'invalid');

        // Assert
        expect($result)->toBeInstanceOf(Builder::class);
    });
});

describe('getDateFormat', function () {
    it('returns correct date format for day period', function () {
        $result = $this->builder->getDateFormat('day', 'created_at');

        expect($result)->toBe('DATE(created_at)');
    });

    it('returns correct date format for week period', function () {
        $result = $this->builder->getDateFormat('week', 'created_at');

        if (DB::getDriverName() === 'sqlite') {
            expect($result)->toBe("strftime('%Y-%W', created_at)");
        } else {
            expect($result)->toBe('YEARWEEK(created_at)');
        }
    });

    it('returns correct date format for month period', function () {
        $result = $this->builder->getDateFormat('month', 'created_at');

        if (DB::getDriverName() === 'sqlite') {
            expect($result)->toBe("strftime('%Y-%m', created_at)");
        } else {
            expect($result)->toBe("DATE_FORMAT(created_at, '%Y-%m')");
        }
    });

    it('returns correct date format for year period', function () {
        $result = $this->builder->getDateFormat('year', 'created_at');

        if (DB::getDriverName() === 'sqlite') {
            expect($result)->toBe("strftime('%Y', created_at)");
        } else {
            expect($result)->toBe('YEAR(created_at)');
        }
    });

    it('returns column name for invalid period', function () {
        $result = $this->builder->getDateFormat('invalid', 'created_at');

        expect($result)->toBe('created_at');
    });
});
