<?php

namespace App\Services\Analytics\Exporters;

use Carbon\Carbon;

interface CsvExporterInterface
{
    /**
     * Export data to CSV format.
     *
     * @param  resource  $handle  The file handle for writing
     * @param  Carbon  $startDate  The start date filter
     * @param  Carbon  $endDate  The end date filter
     */
    public function export($handle, Carbon $startDate, Carbon $endDate): void;

    /**
     * Get the CSV headers for this export type.
     */
    public function getHeaders(): array;
}
