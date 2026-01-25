<?php

use App\Models\ExamAttempt;
use App\Models\ExamQuestion;
use App\Models\ExamSession;
use App\Models\StudentAnswer;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Prism\Prism\Facades\Prism;
use Prism\Prism\Testing\StructuredResponseFake;
use Prism\Prism\Testing\TextResponseFake;

it('generates AI feedback when viewing results', function () {
    $this->seed(RolePermissionSeeder::class);

    $user = User::factory()->create();
    $user->assignRole('student');

    $session = ExamSession::factory()->create([
        'status' => 'active',
        'allow_review' => true,
    ]);

    $attempt = ExamAttempt::factory()->create([
        'user_id' => $user->id,
        'exam_session_id' => $session->id,
        'status' => 'submitted',
        'started_at' => now()->subMinutes(30),
        'submitted_at' => now(),
    ]);

    $question = ExamQuestion::factory()->create();

    $answer = StudentAnswer::create([
        'exam_attempt_id' => $attempt->id,
        'exam_question_id' => $question->id,
        'is_correct' => false,
        'answer' => 'Wrong Answer',
        'max_points' => 1.0,
        'points_earned' => 0.0,
    ]);

    // Mock Prism
    Prism::fake([
        TextResponseFake::make()->withText('Encouraging AI summary feedback.'),
        TextResponseFake::make()->withText('Specific answer feedback.'),
    ]);

    $this->actingAs($user)
        ->get(route('student.exam.results', $attempt))
        ->assertStatus(200)
        ->assertInertia(fn ($page) => $page
            ->component('student/exam/results')
            ->has('aiFeedback')
            ->where('aiFeedback', 'Encouraging AI summary feedback.')
        );

    $attempt->refresh();
    expect($attempt->metadata['ai_feedback'])->toBe('Encouraging AI summary feedback.');

    $answer->refresh();
    expect($answer->feedback)->toBe('Specific answer feedback.');
});

it('polishes a question using AI', function () {
    $this->seed(RolePermissionSeeder::class);

    $user = User::factory()->create();
    $user->assignRole('educator');

    $question = ExamQuestion::factory()->create([
        'question' => 'Old Question',
        'explanation' => 'Old Explanation',
    ]);

    // Mock Prism structured response
    Prism::fake([
        StructuredResponseFake::make()->withStructured([
            'question' => 'Polished Question',
            'explanation' => 'Polished Explanation',
            'rationale' => 'Improved clarity.',
        ]),
    ]);

    $this->actingAs($user)
        ->post(route('question-bank.polish', $question))
        ->assertRedirect();

    $question->refresh();
    expect($question->question)->toBe('Polished Question');
    expect($question->explanation)->toBe('Polished Explanation');
    expect($question->ai_metadata['polish_rationale'])->toBe('Improved clarity.');
});
