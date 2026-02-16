<?php

namespace App\Services\Analytics\Exporters;

use App\Models\Module;
use Carbon\Carbon;

class ModulesTopicsCsvExporter implements CsvExporterInterface
{
    private const LIMIT = 50;

    public function getHeaders(): array
    {
        return ['Type', 'Code', 'Title', 'Usage Count'];
    }

    public function export($handle, Carbon $startDate, Carbon $endDate): void
    {
        fputcsv($handle, $this->getHeaders());

        $modules = Module::query()
            ->withCount('tosGenerates')
            ->orderByDesc('tos_generates_count')
            ->limit(self::LIMIT)
            ->get();

        foreach ($modules as $module) {
            fputcsv($handle, [
                'Module',
                $module->code,
                $module->name,
                $module->tos_generates_count,
            ]);
        }
    }
}
