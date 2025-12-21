<?php

use App\Models\Exam;
use App\Models\ExamQuestion;
use App\Models\Module;
use App\Models\TosGenerate;
use App\Models\User;
use App\Services\ExamPdfExporter;
use Spatie\Permission\Models\Permission;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\get;

beforeEach(function () {
    $this->user = User::factory()->create();

    // Create required permissions
    Permission::firstOrCreate(['name' => 'view exams']);
    Permission::firstOrCreate(['name' => 'create exams']);

    $this->user->givePermissionTo(['view exams', 'create exams']);

    // Create test module and TOS
    $this->module = Module::factory()->create(['is_active' => true]);
    $this->tosGenerate = TosGenerate::factory()->create([
        'module_id' => $this->module->id,
        'status' => 'completed',
    ]);

    // Create exam with questions
    $this->exam = Exam::factory()->create([
        'module_id' => $this->module->id,
        'tos_generate_id' => $this->tosGenerate->id,
        'created_by' => $this->user->id,
        'status' => 'published',
    ]);

    // Create questions and attach to exam
    $questions = ExamQuestion::factory()->count(5)->create([
        'module_id' => $this->module->id,
        'tos_generate_id' => $this->tosGenerate->id,
        'is_approved' => true,
        'question_type' => 'multiple_choice',
        'options' => ['Option A', 'Option B', 'Option C', 'Option D'],
        'correct_answer' => 'A',
    ]);

    $order = 1;
    foreach ($questions as $question) {
        $this->exam->questions()->attach($question->id, [
            'order' => $order++,
            'points' => 1,
        ]);
    }

    actingAs($this->user);
});

it('exports exam to PDF without answers', function () {
    get(route('exam-builder.export-pdf', $this->exam))
        ->assertSuccessful()
        ->assertHeader('content-type', 'application/pdf');
});

it('exports exam to PDF with answer key', function () {
    get(route('exam-builder.export-pdf-answers', $this->exam))
        ->assertSuccessful()
        ->assertHeader('content-type', 'application/pdf');
});

it('generates correct filename for PDF export', function () {
    $exporter = new ExamPdfExporter;

    $filenameWithoutAnswers = $exporter->getFilename($this->exam, false);
    $filenameWithAnswers = $exporter->getFilename($this->exam, true);

    expect($filenameWithoutAnswers)->toEndWith('.pdf');
    expect($filenameWithAnswers)->toContain('_with_answers');
    expect($filenameWithAnswers)->toEndWith('.pdf');
});

it('cannot export exam with no questions', function () {
    $emptyExam = Exam::factory()->create([
        'module_id' => $this->module->id,
        'created_by' => $this->user->id,
    ]);

    get(route('exam-builder.export-pdf', $emptyExam))
        ->assertStatus(400);
});

it('requires authentication to export PDF', function () {
    auth()->logout();

    get(route('exam-builder.export-pdf', $this->exam))
        ->assertRedirect(route('login'));
});

it('requires view exams permission to export PDF', function () {
    $userWithoutPermission = User::factory()->create();
    actingAs($userWithoutPermission);

    get(route('exam-builder.export-pdf', $this->exam))
        ->assertForbidden();
});

it('includes all question types in PDF export', function () {
    // Add different question types
    $trueFalseQuestion = ExamQuestion::factory()->create([
        'module_id' => $this->module->id,
        'tos_generate_id' => $this->tosGenerate->id,
        'question_type' => 'true_false',
        'correct_answer' => 'true',
    ]);

    $identificationQuestion = ExamQuestion::factory()->create([
        'module_id' => $this->module->id,
        'tos_generate_id' => $this->tosGenerate->id,
        'question_type' => 'identification',
        'correct_answer' => 'Sample Answer',
    ]);

    $essayQuestion = ExamQuestion::factory()->create([
        'module_id' => $this->module->id,
        'tos_generate_id' => $this->tosGenerate->id,
        'question_type' => 'essay',
        'correct_answer' => 'Sample essay answer explaining the concept.',
    ]);

    $this->exam->questions()->attach($trueFalseQuestion->id, ['order' => 6, 'points' => 1]);
    $this->exam->questions()->attach($identificationQuestion->id, ['order' => 7, 'points' => 2]);
    $this->exam->questions()->attach($essayQuestion->id, ['order' => 8, 'points' => 5]);

    get(route('exam-builder.export-pdf-answers', $this->exam))
        ->assertSuccessful()
        ->assertHeader('content-type', 'application/pdf');
});
