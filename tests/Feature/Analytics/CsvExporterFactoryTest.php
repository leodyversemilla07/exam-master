<?php

use App\Services\Analytics\Exporters\CsvExporterFactory;
use App\Services\Analytics\Exporters\EducatorActivityCsvExporter;
use App\Services\Analytics\Exporters\ExamsCreatedCsvExporter;
use App\Services\Analytics\Exporters\ModulesTopicsCsvExporter;

describe('CsvExporterFactory', function () {
    describe('create', function () {
        it('creates ExamsCreatedCsvExporter for exams_created type', function () {
            $exporter = CsvExporterFactory::create('exams_created');

            expect($exporter)->toBeInstanceOf(ExamsCreatedCsvExporter::class);
        });

        it('creates ModulesTopicsCsvExporter for modules_topics type', function () {
            $exporter = CsvExporterFactory::create('modules_topics');

            expect($exporter)->toBeInstanceOf(ModulesTopicsCsvExporter::class);
        });

        it('creates EducatorActivityCsvExporter for educator_activity type', function () {
            $exporter = CsvExporterFactory::create('educator_activity');

            expect($exporter)->toBeInstanceOf(EducatorActivityCsvExporter::class);
        });

        it('throws exception for invalid type', function () {
            expect(function () {
                CsvExporterFactory::create('invalid_type');
            })->toThrow(InvalidArgumentException::class, 'Unknown export type: invalid_type');
        });
    });

    describe('getAvailableTypes', function () {
        it('returns all available export types', function () {
            $types = CsvExporterFactory::getAvailableTypes();

            expect($types)->toBeArray();
            expect($types)->toContain('exams_created');
            expect($types)->toContain('modules_topics');
            expect($types)->toContain('educator_activity');
            expect(count($types))->toBe(3);
        });
    });

    describe('isValidType', function () {
        it('returns true for valid types', function () {
            expect(CsvExporterFactory::isValidType('exams_created'))->toBeTrue();
            expect(CsvExporterFactory::isValidType('modules_topics'))->toBeTrue();
            expect(CsvExporterFactory::isValidType('educator_activity'))->toBeTrue();
        });

        it('returns false for invalid types', function () {
            expect(CsvExporterFactory::isValidType('invalid'))->toBeFalse();
            expect(CsvExporterFactory::isValidType(''))->toBeFalse();
            expect(CsvExporterFactory::isValidType('random'))->toBeFalse();
        });
    });
});
