<?php

namespace App\Services\Analytics\Exporters;

use InvalidArgumentException;

class CsvExporterFactory
{
    /**
     * Create the appropriate CSV exporter based on type.
     *
     * @param  string  $type  The export type (exams_created, modules_topics, educator_activity)
     *
     * @throws InvalidArgumentException When an invalid type is provided
     */
    public static function create(string $type): CsvExporterInterface
    {
        return match ($type) {
            'exams_created' => new ExamsCreatedCsvExporter,
            'modules_topics' => new ModulesTopicsCsvExporter,
            'educator_activity' => new EducatorActivityCsvExporter,
            default => throw new InvalidArgumentException("Unknown export type: {$type}"),
        };
    }

    /**
     * Get all available export types.
     */
    public static function getAvailableTypes(): array
    {
        return [
            'exams_created',
            'modules_topics',
            'educator_activity',
        ];
    }

    /**
     * Check if an export type is valid.
     */
    public static function isValidType(string $type): bool
    {
        return in_array($type, self::getAvailableTypes(), true);
    }
}
