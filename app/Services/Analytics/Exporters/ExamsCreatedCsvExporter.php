<?php

namespace App\Services\Analytics\Exporters;

use App\Models\Exam;
use Carbon\Carbon;

class ExamsCreatedCsvExporter implements CsvExporterInterface
{
    public function getHeaders(): array
    {
        return ['Date', 'Exams Created'];
    }

    public function export($handle, Carbon $startDate, Carbon $endDate): void
    {
        fputcsv($handle, $this->getHeaders());

        $data = Exam::query()
            ->whereBetween('created_at', [$startDate, $endDate])
            ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->groupByRaw('DATE(created_at)')
            ->orderBy('date')
            ->get();

        foreach ($data as $row) {
            fputcsv($handle, [$row->date, $row->count]);
        }
    }
}
