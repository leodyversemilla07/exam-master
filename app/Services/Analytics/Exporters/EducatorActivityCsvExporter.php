<?php

namespace App\Services\Analytics\Exporters;

use App\Models\User;
use Carbon\Carbon;

class EducatorActivityCsvExporter implements CsvExporterInterface
{
    public function getHeaders(): array
    {
        return ['Educator Name', 'Email', 'TOS Created', 'Exams Created'];
    }

    public function export($handle, Carbon $startDate, Carbon $endDate): void
    {
        fputcsv($handle, $this->getHeaders());

        $educators = User::query()
            ->role('educator')
            ->withCount([
                'tosGenerates as tos_created' => function ($query) use ($startDate, $endDate) {
                    $query->whereBetween('created_at', [$startDate, $endDate]);
                },
                'exams as exams_created' => function ($query) use ($startDate, $endDate) {
                    $query->whereBetween('created_at', [$startDate, $endDate]);
                },
            ])
            ->get();

        foreach ($educators as $educator) {
            fputcsv($handle, [
                $educator->name,
                $educator->email,
                $educator->tos_created,
                $educator->exams_created,
            ]);
        }
    }
}
