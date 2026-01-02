<?php

namespace Tests\Feature;

use App\Models\Exam;
use App\Models\ExamTemplate;
use App\Models\User;
use App\Services\ExamPdfExporter;

it('expands placeholders correctly', function () {
    $user = User::factory()->create([
        'organization' => 'Test University',
    ]);

    $template = ExamTemplate::create([
        'user_id' => $user->id,
        'name' => 'Template',
        'header_content' => 'Welcome to {{school_name}}. This is {{exam_title}}.',
        'footer_content' => 'Date: {{date}}',
    ]);

    $exam = Exam::factory()->create([
        'created_by' => $user->id,
        'title' => 'Midterm Exam',
        'exam_template_id' => $template->id,
    ]);

    $exporter = new ExamPdfExporter;

    // Using reflection to test protected method
    $reflection = new \ReflectionClass(ExamPdfExporter::class);
    $method = $reflection->getMethod('processTemplate');
    $method->setAccessible(true);

    $result = $method->invoke($exporter, $exam);

    expect($result['header'])->toContain('Welcome to Test University');
    expect($result['header'])->toContain('This is Midterm Exam');
    expect($result['footer'])->toContain('Date: '.now()->format('F j, Y'));
});

it('uses fallback for school name if organization is null', function () {
    $user = User::factory()->create([
        'organization' => null,
    ]);

    $template = ExamTemplate::create([
        'user_id' => $user->id,
        'name' => 'Template',
        'header_content' => 'Welcome to {{school_name}}',
    ]);

    $exam = Exam::factory()->create([
        'created_by' => $user->id,
        'exam_template_id' => $template->id,
    ]);

    $exporter = new ExamPdfExporter;

    $reflection = new \ReflectionClass(ExamPdfExporter::class);
    $method = $reflection->getMethod('processTemplate');
    $method->setAccessible(true);

    $result = $method->invoke($exporter, $exam);

    expect($result['header'])->toContain('Welcome to Your School Name');
});
