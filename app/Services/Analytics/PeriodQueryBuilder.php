<?php

namespace App\Services\Analytics;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;

class PeriodQueryBuilder
{
    /**
     * Apply period-based grouping to a query.
     *
     * @param  Builder  $query  The query builder instance
     * @param  string  $period  The grouping period (day, week, month, year)
     * @param  string  $dateColumn  The column to group by (default: created_at)
     */
    public function groupByPeriod(Builder $query, string $period, string $dateColumn = 'created_at'): Builder
    {
        $isSqlite = DB::getDriverName() === 'sqlite';

        return match ($period) {
            'day' => $query->selectRaw("DATE({$dateColumn}) as date, COUNT(*) as count")
                ->groupByRaw("DATE({$dateColumn})"),
            'week' => $isSqlite
                ? $query->selectRaw("strftime('%Y-%W', {$dateColumn}) as week, COUNT(*) as count")
                    ->groupByRaw("strftime('%Y-%W', {$dateColumn})")
                : $query->selectRaw("YEARWEEK({$dateColumn}) as week, COUNT(*) as count")
                    ->groupByRaw("YEARWEEK({$dateColumn})"),
            'month' => $isSqlite
                ? $query->selectRaw("strftime('%Y-%m', {$dateColumn}) as month, COUNT(*) as count")
                    ->groupByRaw("strftime('%Y-%m', {$dateColumn})")
                : $query->selectRaw("YEAR({$dateColumn}) as year, MONTH({$dateColumn}) as month, COUNT(*) as count")
                    ->groupByRaw("YEAR({$dateColumn}), MONTH({$dateColumn})"),
            'year' => $isSqlite
                ? $query->selectRaw("strftime('%Y', {$dateColumn}) as year, COUNT(*) as count")
                    ->groupByRaw("strftime('%Y', {$dateColumn})")
                : $query->selectRaw("YEAR({$dateColumn}) as year, COUNT(*) as count")
                    ->groupByRaw("YEAR({$dateColumn})"),
            default => $query,
        };
    }

    /**
     * Get the appropriate date format for a period.
     *
     * @param  string  $period  The grouping period
     * @param  string  $dateColumn  The column name
     * @return string The SQL date format expression
     */
    public function getDateFormat(string $period, string $dateColumn = 'created_at'): string
    {
        $isSqlite = DB::getDriverName() === 'sqlite';

        return match ($period) {
            'day' => "DATE({$dateColumn})",
            'week' => $isSqlite ? "strftime('%Y-%W', {$dateColumn})" : "YEARWEEK({$dateColumn})",
            'month' => $isSqlite ? "strftime('%Y-%m', {$dateColumn})" : "DATE_FORMAT({$dateColumn}, '%Y-%m')",
            'year' => $isSqlite ? "strftime('%Y', {$dateColumn})" : "YEAR({$dateColumn})",
            default => $dateColumn,
        };
    }
}
