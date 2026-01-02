<?php

use App\Models\ExamQuestion;
use App\Models\Module;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->artisan('db:seed', ['--class' => 'RolePermissionSeeder']);

    $this->admin = User::factory()->create();
    $this->admin->assignRole('admin');

    $this->module = Module::factory()->create();
    $this->actingAs($this->admin);
});

test('can view question bank index', function () {
    ExamQuestion::factory()->count(5)->create([
        'module_id' => $this->module->id,
    ]);

    $response = $this->get(route('question-bank.index'));

    $response->assertSuccessful();
    $response->assertInertia(fn ($page) => $page
        ->component('question-bank/index')
        ->has('questions.data', 5)
    );
});

test('can create a question', function () {
    $data = [
        'module_id' => $this->module->id,
        'question_type' => 'multiple_choice',
        'question' => 'What is the capital of France?',
        'options' => ['Paris', 'London', 'Berlin', 'Madrid'],
        'correct_answer' => 'Paris',
        'cognitive_level' => 'remembering',
        'difficulty' => 'easy',
        'points' => 1,
    ];

    $response = $this->post(route('question-bank.store'), $data);

    $response->assertRedirect();
    $this->assertDatabaseHas('exam_questions', [
        'question' => 'What is the capital of France?',
        'module_id' => $this->module->id,
    ]);
});

test('can update a question', function () {
    $question = ExamQuestion::factory()->create([
        'module_id' => $this->module->id,
        'question' => 'Old Question Text',
    ]);

    $data = [
        'module_id' => $this->module->id,
        'question_type' => $question->question_type,
        'question' => 'Updated Question Text',
        'correct_answer' => $question->correct_answer,
        'cognitive_level' => $question->cognitive_level,
        'difficulty' => $question->difficulty,
        'points' => 2,
    ];

    if ($question->question_type === 'multiple_choice') {
        $data['options'] = $question->options;
    }

    $response = $this->put(route('question-bank.update', $question), $data);

    $response->assertRedirect();
    $this->assertDatabaseHas('exam_questions', [
        'id' => $question->id,
        'question' => 'Updated Question Text',
        'points' => 2,
    ]);
});

test('can delete a question', function () {
    $question = ExamQuestion::factory()->create([
        'module_id' => $this->module->id,
    ]);

    $response = $this->delete(route('question-bank.destroy', $question));

    $response->assertRedirect();
    $this->assertSoftDeleted('exam_questions', [
        'id' => $question->id,
    ]);
});

test('can approve a question', function () {
    $question = ExamQuestion::factory()->create([
        'module_id' => $this->module->id,
        'is_approved' => false,
    ]);

    $response = $this->post(route('question-bank.approve', $question));

    $response->assertRedirect();
    $this->assertTrue($question->fresh()->is_approved);
});

test('can bulk delete questions', function () {
    $questions = ExamQuestion::factory()->count(3)->create([
        'module_id' => $this->module->id,
    ]);

    $response = $this->delete(route('question-bank.bulk-destroy'), [
        'ids' => $questions->pluck('id')->toArray(),
    ]);

    $response->assertRedirect();
    foreach ($questions as $question) {
        $this->assertSoftDeleted('exam_questions', ['id' => $question->id]);
    }
});

test('can check for duplicate questions', function () {
    $question1 = ExamQuestion::factory()->create([
        'module_id' => $this->module->id,
        'question' => 'Is this a duplicate question?',
    ]);

    // We don't need to create the duplicate in DB if the service is mocked or if it uses the current one.
    // But usually it compares with others.
    $question2 = ExamQuestion::factory()->create([
        'module_id' => $this->module->id,
        'question' => 'Is this a duplicate question?',
    ]);

    $response = $this->get(route('question-bank.duplicates', $question1));

    $response->assertSuccessful();
    $response->assertJsonStructure(['duplicates']);
});
