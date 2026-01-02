<?php

use App\Models\Exam;
use App\Models\ExamQuestion;
use App\Models\Module;
use App\Models\TosGenerate;
use App\Models\User;
use App\Services\ExamWordExporter;
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
        'title' => 'Test Exam for Word Export',
    ]);

    // Create questions and attach to exam
    $questions = ExamQuestion::factory()->count(3)->create([
        'module_id' => $this->module->id,
        'tos_generate_id' => $this->tosGenerate->id,
        'is_approved' => true,
        'question_type' => 'multiple_choice',
        'options' => ['A' => 'Option A', 'B' => 'Option B', 'C' => 'Option C', 'D' => 'Option D'],
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

it('exports exam to Word without answers', function () {
    get("/exam-builder/{$this->exam->id}/export-docx")
        ->assertSuccessful()
        ->assertHeader('content-type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
});

it('exports exam to Word with answer key', function () {
    get("/exam-builder/{$this->exam->id}/export-docx-answers")
        ->assertSuccessful()
        ->assertHeader('content-type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
});

it('generates correct filename for Word export', function () {
    $exporter = new ExamWordExporter;

    $filenameWithoutAnswers = $exporter->getFilename($this->exam, false);
    $filenameWithAnswers = $exporter->getFilename($this->exam, true);

    expect($filenameWithoutAnswers)->toBe('test-exam-for-word-export.docx');
    expect($filenameWithAnswers)->toBe('test-exam-for-word-export_with_answers.docx');
});

it('cannot export exam with no questions', function () {
    $emptyExam = Exam::factory()->create([
        'module_id' => $this->module->id,
        'created_by' => $this->user->id,
        'status' => 'draft',
    ]);

    get("/exam-builder/{$emptyExam->id}/export-docx")
        ->assertStatus(400);
});

it('requires authentication to export Word', function () {
    auth()->logout();

    get("/exam-builder/{$this->exam->id}/export-docx")
        ->assertRedirect('/login');
});

it('requires view exams permission to export Word', function () {
    $userWithoutPermission = User::factory()->create();
    actingAs($userWithoutPermission);

    get("/exam-builder/{$this->exam->id}/export-docx")
        ->assertForbidden();
});

it('exports exam with true/false questions to Word', function () {
    $question = ExamQuestion::factory()->create([
        'module_id' => $this->module->id,
        'tos_generate_id' => $this->tosGenerate->id,
        'is_approved' => true,
        'question_type' => 'true_false',
        'question' => 'Is the sky blue?',
        'correct_answer' => 'true',
    ]);

    $this->exam->questions()->attach($question->id, ['order' => 10, 'points' => 1]);

    get("/exam-builder/{$this->exam->id}/export-docx")
        ->assertSuccessful()
        ->assertHeader('content-type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
});

it('exports exam with identification questions to Word', function () {
    $question = ExamQuestion::factory()->create([
        'module_id' => $this->module->id,
        'tos_generate_id' => $this->tosGenerate->id,
        'is_approved' => true,
        'question_type' => 'identification',
        'question' => 'What is the capital of France?',
        'correct_answer' => 'Paris',
    ]);

    $this->exam->questions()->attach($question->id, ['order' => 10, 'points' => 1]);

    get("/exam-builder/{$this->exam->id}/export-docx")
        ->assertSuccessful()
        ->assertHeader('content-type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
});

it('exports exam with essay questions to Word', function () {
    $question = ExamQuestion::factory()->create([
        'module_id' => $this->module->id,
        'tos_generate_id' => $this->tosGenerate->id,
        'is_approved' => true,
        'question_type' => 'essay',
        'question' => 'Explain the water cycle.',
        'correct_answer' => 'Sample answer about water cycle',
    ]);

    $this->exam->questions()->attach($question->id, ['order' => 10, 'points' => 5]);

    get("/exam-builder/{$this->exam->id}/export-docx")
        ->assertSuccessful()
        ->assertHeader('content-type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
});

it('includes all question types in Word export', function () {
    // Add various question types
    $types = [
        ['type' => 'true_false', 'answer' => 'true'],
        ['type' => 'identification', 'answer' => 'Paris'],
        ['type' => 'essay', 'answer' => 'Sample essay'],
        ['type' => 'matching', 'answer' => json_encode(['1' => 'A', '2' => 'B'])],
        ['type' => 'fill_in_the_blanks', 'answer' => 'answer'],
    ];

    foreach ($types as $index => $typeInfo) {
        $question = ExamQuestion::factory()->create([
            'module_id' => $this->module->id,
            'tos_generate_id' => $this->tosGenerate->id,
            'is_approved' => true,
            'question_type' => $typeInfo['type'],
            'question' => "Question for {$typeInfo['type']}",
            'correct_answer' => $typeInfo['answer'],
            'options' => $typeInfo['type'] === 'matching'
                ? ['Term 1' => 'Definition 1', 'Term 2' => 'Definition 2']
                : null,
        ]);

        $this->exam->questions()->attach($question->id, [
            'order' => 100 + $index,
            'points' => 1,
        ]);
    }

    get("/exam-builder/{$this->exam->id}/export-docx")
        ->assertSuccessful()
        ->assertHeader('content-type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');

    get("/exam-builder/{$this->exam->id}/export-docx-answers")
        ->assertSuccessful()
        ->assertHeader('content-type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
});
