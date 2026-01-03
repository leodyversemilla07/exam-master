<?php

use App\Models\ExamQuestion;
use App\Models\Module;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();

    // Assign permissions to user
    $role = \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'user']);
    $permissions = [
        'create exams',
        'edit exams',
        'delete exams',
        'view exams',
        'export exams',
    ];

    foreach ($permissions as $permission) {
        \Spatie\Permission\Models\Permission::firstOrCreate(['name' => $permission]);
    }

    $role->syncPermissions($permissions);
    $this->user->assignRole($role);

    $this->module = Module::factory()->create(['created_by' => $this->user->id]);
    $this->actingAs($this->user);
});

it('can create a matching type question', function () {
    $questionData = [
        'module_id' => $this->module->id,
        'question_type' => 'matching',
        'question' => 'Match the following countries with their capitals',
        'options' => [
            '1' => 'France',
            '2' => 'Germany',
            '3' => 'Italy',
        ],
        'correct_answer' => json_encode([
            '1' => 'Paris',
            '2' => 'Berlin',
            '3' => 'Rome',
        ]),
        'explanation' => 'These are the capital cities of European countries',
        'cognitive_level' => 'remembering',
        'difficulty' => 'easy',
        'learning_objective_code' => 'GEO-001',
        'points' => 3,
    ];

    $response = $this->post('/question-bank', $questionData);

    $response->assertRedirect();
    $this->assertDatabaseHas('exam_questions', [
        'module_id' => $this->module->id,
        'question_type' => 'matching',
        'question' => 'Match the following countries with their capitals',
    ]);

    $question = ExamQuestion::where('question_type', 'matching')->first();
    expect($question->options)->toBeArray();
    expect($question->options)->toHaveKey('1');
});

it('can create a fill in the blanks question', function () {
    $questionData = [
        'module_id' => $this->module->id,
        'question_type' => 'fill_in_the_blanks',
        'question' => 'The capital of France is [blank] and it is located in [blank].',
        'correct_answer' => 'Paris, Europe',
        'explanation' => 'Paris is the capital and largest city of France',
        'cognitive_level' => 'remembering',
        'difficulty' => 'easy',
        'learning_objective_code' => 'GEO-002',
        'points' => 2,
    ];

    $response = $this->post('/question-bank', $questionData);

    $response->assertRedirect();
    $this->assertDatabaseHas('exam_questions', [
        'module_id' => $this->module->id,
        'question_type' => 'fill_in_the_blanks',
        'correct_answer' => 'Paris, Europe',
    ]);

    $question = ExamQuestion::where('question_type', 'fill_in_the_blanks')->first();
    expect($question->question)->toContain('[blank]');
});

it('validates matching type requires options', function () {
    $questionData = [
        'module_id' => $this->module->id,
        'question_type' => 'matching',
        'question' => 'Match the following',
        'correct_answer' => 'test',
        'cognitive_level' => 'remembering',
        'difficulty' => 'easy',
        'points' => 1,
    ];

    $response = $this->post('/question-bank', $questionData);

    $response->assertSessionHasErrors(['options']);
});

it('can update a matching type question', function () {
    $question = ExamQuestion::factory()->create([
        'module_id' => $this->module->id,
        'created_by' => $this->user->id,
        'question_type' => 'matching',
        'question' => 'Original question',
        'options' => [
            '1' => 'Item 1',
            '2' => 'Item 2',
        ],
        'correct_answer' => json_encode(['1' => 'Match 1', '2' => 'Match 2']),
    ]);

    $updatedData = [
        'module_id' => $this->module->id,
        'question_type' => 'matching',
        'question' => 'Updated matching question',
        'options' => [
            '1' => 'Updated Item 1',
            '2' => 'Updated Item 2',
            '3' => 'New Item 3',
        ],
        'correct_answer' => json_encode([
            '1' => 'Match 1',
            '2' => 'Match 2',
            '3' => 'Match 3',
        ]),
        'cognitive_level' => 'understanding',
        'difficulty' => 'medium',
        'learning_objective_code' => 'TEST-001',
        'points' => 3,
    ];

    $response = $this->put("/question-bank/{$question->id}", $updatedData);

    $response->assertRedirect();

    $question->refresh();
    expect($question->question)->toBe('Updated matching question');
    expect($question->options)->toHaveKey('3');
});

it('can update a fill in the blanks question', function () {
    $question = ExamQuestion::factory()->create([
        'module_id' => $this->module->id,
        'created_by' => $this->user->id,
        'question_type' => 'fill_in_the_blanks',
        'question' => 'The sky is [blank].',
        'correct_answer' => 'blue',
    ]);

    $updatedData = [
        'module_id' => $this->module->id,
        'question_type' => 'fill_in_the_blanks',
        'question' => 'The [blank] is blue and the grass is [blank].',
        'correct_answer' => 'sky, green',
        'cognitive_level' => 'remembering',
        'difficulty' => 'easy',
        'learning_objective_code' => 'TEST-002',
        'points' => 2,
    ];

    $response = $this->put("/question-bank/{$question->id}", $updatedData);

    $response->assertRedirect();
    $this->assertDatabaseHas('exam_questions', [
        'id' => $question->id,
        'correct_answer' => 'sky, green',
    ]);
});

it('can export exam with matching questions to PDF', function () {
    $exam = \App\Models\Exam::factory()->create([
        'module_id' => $this->module->id,
        'created_by' => $this->user->id,
        'title' => 'Test Exam with Matching',
    ]);

    $matchingQuestion = ExamQuestion::factory()->create([
        'module_id' => $this->module->id,
        'created_by' => $this->user->id,
        'question_type' => 'matching',
        'question' => 'Match the items',
        'options' => [
            '1' => 'France',
            '2' => 'Germany',
        ],
        'correct_answer' => json_encode(['1' => 'Paris', '2' => 'Berlin']),
        'is_approved' => true,
    ]);

    $exam->questions()->attach($matchingQuestion->id, ['order' => 1, 'points' => 2]);

    $response = $this->get("/exam-builder/{$exam->id}/export-pdf");

    $response->assertSuccessful();
    $response->assertHeader('content-type', 'application/pdf');
});

it('can export exam with fill in the blanks questions to PDF', function () {
    $exam = \App\Models\Exam::factory()->create([
        'module_id' => $this->module->id,
        'created_by' => $this->user->id,
        'title' => 'Test Exam with Fill Blanks',
    ]);

    $fillBlanksQuestion = ExamQuestion::factory()->create([
        'module_id' => $this->module->id,
        'created_by' => $this->user->id,
        'question_type' => 'fill_in_the_blanks',
        'question' => 'The capital is [blank].',
        'correct_answer' => 'Paris',
        'is_approved' => true,
    ]);

    $exam->questions()->attach($fillBlanksQuestion->id, ['order' => 1, 'points' => 1]);

    $response = $this->get("/exam-builder/{$exam->id}/export-pdf");

    $response->assertSuccessful();
    $response->assertHeader('content-type', 'application/pdf');
});

it('can export exam with matching questions to Word', function () {
    $exam = \App\Models\Exam::factory()->create([
        'module_id' => $this->module->id,
        'created_by' => $this->user->id,
        'title' => 'Test Exam with Matching',
    ]);

    $matchingQuestion = ExamQuestion::factory()->create([
        'module_id' => $this->module->id,
        'created_by' => $this->user->id,
        'question_type' => 'matching',
        'question' => 'Match the items',
        'options' => [
            '1' => 'France',
            '2' => 'Germany',
        ],
        'correct_answer' => json_encode(['1' => 'Paris', '2' => 'Berlin']),
        'is_approved' => true,
    ]);

    $exam->questions()->attach($matchingQuestion->id, ['order' => 1, 'points' => 2]);

    $response = $this->get("/exam-builder/{$exam->id}/export-docx");

    $response->assertSuccessful();
    $response->assertHeader('content-type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
});

it('can filter questions by matching type', function () {
    ExamQuestion::factory()->create([
        'module_id' => $this->module->id,
        'created_by' => $this->user->id,
        'question_type' => 'matching',
        'options' => ['1' => 'Test'],
        'is_approved' => true,
    ]);

    ExamQuestion::factory()->create([
        'module_id' => $this->module->id,
        'created_by' => $this->user->id,
        'question_type' => 'multiple_choice',
        'is_approved' => true,
    ]);

    $response = $this->get('/question-bank?question_type=matching');

    $response->assertSuccessful();
    $response->assertInertia(fn ($page) => $page
        ->component('question-bank/index')
        ->has('questions.data', 1)
        ->where('questions.data.0.question_type', 'matching')
    );
});

it('can filter questions by fill in the blanks type', function () {
    ExamQuestion::factory()->create([
        'module_id' => $this->module->id,
        'created_by' => $this->user->id,
        'question_type' => 'fill_in_the_blanks',
        'question' => 'Test [blank]',
        'is_approved' => true,
    ]);

    ExamQuestion::factory()->create([
        'module_id' => $this->module->id,
        'created_by' => $this->user->id,
        'question_type' => 'essay',
        'is_approved' => true,
    ]);

    $response = $this->get('/question-bank?question_type=fill_in_the_blanks');

    $response->assertSuccessful();
    $response->assertInertia(fn ($page) => $page
        ->component('question-bank/index')
        ->has('questions.data', 1)
        ->where('questions.data.0.question_type', 'fill_in_the_blanks')
    );
});
