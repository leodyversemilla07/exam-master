<?php

use App\Models\Exam;
use App\Models\ExamQuestion;
use App\Models\Module;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    // Seed roles and permissions
    $this->artisan('db:seed', ['--class' => 'RolePermissionSeeder']);

    $this->user = User::factory()->create();
    $this->user->assignRole('super-admin');
    $this->actingAs($this->user);
});

test('can create an exam', function () {
    $module = Module::factory()->create();

    $response = $this->postJson('/exam-builder', [
        'module_id' => $module->id,
        'title' => 'Midterm Exam',
        'description' => 'Covers chapters 1-5',
        'exam_type' => 'summative',
        'time_limit' => 90,
        'passing_score' => 75,
        'instructions' => 'Answer all questions',
        'shuffle_questions' => true,
        'show_answers' => false,
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('exams', [
        'title' => 'Midterm Exam',
        'module_id' => $module->id,
        'exam_type' => 'summative',
    ]);
});

test('exam requires a module', function () {
    $response = $this->postJson('/exam-builder', [
        'title' => 'Test Exam',
        'exam_type' => 'formative',
        'passing_score' => 75,
    ]);

    $response->assertJsonValidationErrors(['module_id']);
});

test('can add questions to exam', function () {
    $exam = Exam::factory()->create(['created_by' => $this->user->id]);
    $questions = ExamQuestion::factory()->count(3)->create([
        'module_id' => $exam->module_id,
        'is_approved' => true,
    ]);

    $response = $this->postJson("/exam-builder/{$exam->id}/add-questions", [
        'question_ids' => $questions->pluck('id')->toArray(),
    ]);

    $response->assertRedirect();
    $this->assertEquals(3, $exam->fresh()->questions()->count());
});

test('can remove question from exam', function () {
    $exam = Exam::factory()->create(['created_by' => $this->user->id]);
    $question = ExamQuestion::factory()->create([
        'module_id' => $exam->module_id,
    ]);

    $exam->questions()->attach($question->id, ['order' => 1, 'points' => 2]);

    $response = $this->deleteJson("/exam-builder/{$exam->id}/questions/{$question->id}");

    $response->assertRedirect();
    $this->assertEquals(0, $exam->fresh()->questions()->count());
});

test('can update question points in exam', function () {
    $exam = Exam::factory()->create(['created_by' => $this->user->id]);
    $question = ExamQuestion::factory()->create([
        'module_id' => $exam->module_id,
    ]);

    $exam->questions()->attach($question->id, ['order' => 1, 'points' => 2]);

    $response = $this->patchJson("/exam-builder/{$exam->id}/questions/{$question->id}/points", [
        'points' => 5,
    ]);

    $response->assertRedirect();
    $this->assertEquals(5, $exam->fresh()->questions()->first()->pivot->points);
});

test('can publish exam', function () {
    $exam = Exam::factory()->create(['created_by' => $this->user->id, 'status' => 'draft']);
    $question = ExamQuestion::factory()->create(['module_id' => $exam->module_id]);
    $exam->questions()->attach($question->id, ['order' => 1, 'points' => 2]);

    $response = $this->postJson("/exam-builder/{$exam->id}/publish");

    $response->assertRedirect();
    $this->assertEquals('published', $exam->fresh()->status);
});

test('cannot publish exam with no questions', function () {
    $exam = Exam::factory()->create(['created_by' => $this->user->id, 'status' => 'draft']);

    $response = $this->postJson("/exam-builder/{$exam->id}/publish");

    $response->assertRedirect();
    $this->assertEquals('draft', $exam->fresh()->status);
});

test('can duplicate exam', function () {
    $exam = Exam::factory()->create([
        'created_by' => $this->user->id,
        'title' => 'Original Exam',
    ]);
    $question = ExamQuestion::factory()->create(['module_id' => $exam->module_id]);
    $exam->questions()->attach($question->id, ['order' => 1, 'points' => 2]);

    $response = $this->postJson("/exam-builder/{$exam->id}/duplicate");

    $response->assertRedirect();
    $this->assertDatabaseHas('exams', [
        'title' => 'Original Exam (Copy)',
        'status' => 'draft',
    ]);

    $duplicatedExam = Exam::where('title', 'Original Exam (Copy)')->first();
    $this->assertEquals(1, $duplicatedExam->questions()->count());
});

test('calculates totals correctly', function () {
    $exam = Exam::factory()->create(['created_by' => $this->user->id]);
    $questions = ExamQuestion::factory()->count(3)->create([
        'module_id' => $exam->module_id,
    ]);

    foreach ($questions as $index => $question) {
        $exam->questions()->attach($question->id, [
            'order' => $index + 1,
            'points' => ($index + 1) * 2, // 2, 4, 6
        ]);
    }

    $exam->calculateTotals();
    $exam->refresh();

    expect($exam->total_items)->toBe(3);
    expect($exam->total_points)->toBe(12);
});
