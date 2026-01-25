<?php

use App\Models\ExamAttempt;
use App\Models\ExamQuestion;
use App\Models\ExamSession;
use App\Models\StudentAnswer;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->artisan('db:seed', ['--class' => 'RolePermissionSeeder']);
    $this->educator = User::factory()->create();
    $this->educator->assignRole('educator');
    $this->actingAs($this->educator);
    $this->withoutVite();
});

test('it calculates performance stats for a question', function () {
    $question = ExamQuestion::factory()->create(['difficulty' => 'hard']);

    // Create 10 attempts, 9 correct (90% success)
    for ($i = 0; $i < 10; $i++) {
        $attempt = ExamAttempt::factory()->create();
        StudentAnswer::factory()->create([
            'exam_attempt_id' => $attempt->id,
            'exam_question_id' => $question->id,
            'is_correct' => $i < 9,
        ]);
    }

    $stats = $question->getPerformanceStats();

    expect($stats['total_attempts'])->toBe(10);
    expect($stats['success_rate'])->toBe(90.0);
    expect($stats['suggested_difficulty'])->toBe('easy');
    expect($stats['needs_calibration'])->toBeTrue();
});

test('it can calibrate question difficulty', function () {
    $question = ExamQuestion::factory()->create(['difficulty' => 'hard']);

    // Create 10 correct attempts
    for ($i = 0; $i < 10; $i++) {
        $attempt = ExamAttempt::factory()->create();
        StudentAnswer::factory()->create([
            'exam_attempt_id' => $attempt->id,
            'exam_question_id' => $question->id,
            'is_correct' => true,
        ]);
    }

    $response = $this->post(route('question-bank.calibrate', $question));

    $response->assertRedirect();
    $response->assertSessionHas('success');
    expect($question->fresh()->difficulty)->toBe('easy');
});

test('it generates plagiarism report for essay questions', function () {
    $session = ExamSession::factory()->create(['created_by' => $this->educator->id]);
    $question = ExamQuestion::factory()->create([
        'module_id' => $session->exam->module_id,
        'question_type' => 'essay',
    ]);
    $session->exam->questions()->attach($question->id, ['points' => 5, 'order' => 1]);

    $student1 = User::factory()->create();
    $student2 = User::factory()->create();

    $attempt1 = ExamAttempt::factory()->create(['exam_session_id' => $session->id, 'user_id' => $student1->id]);
    $attempt2 = ExamAttempt::factory()->create(['exam_session_id' => $session->id, 'user_id' => $student2->id]);

    $plagiarizedText = 'This is a very long essay response that is exactly the same for both students to trigger detection.';

    StudentAnswer::factory()->create([
        'exam_attempt_id' => $attempt1->id,
        'exam_question_id' => $question->id,
        'answer' => $plagiarizedText,
    ]);

    StudentAnswer::factory()->create([
        'exam_attempt_id' => $attempt2->id,
        'exam_question_id' => $question->id,
        'answer' => $plagiarizedText,
    ]);

    $response = $this->get(route('exam-sessions.plagiarism', $session));

    $response->assertSuccessful();
    $response->assertInertia(fn ($page) => $page
        ->component('exam-sessions/plagiarism-report')
        ->has('reports', 1)
        ->where('reports.0.matches.0.similarity', 100)
    );
});
