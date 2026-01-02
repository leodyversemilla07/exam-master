<?php

use App\Models\Exam;
use App\Models\ExamAttempt;
use App\Models\ExamItem;
use App\Models\ExamQuestion;
use App\Models\ExamSession;
use App\Models\Module;
use App\Models\StudentAnswer;
use App\Models\User;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

    $permissions = [
        'view analytics',
        'view available exams',
        'take exams',
        'view own results',
        'view own attempts',
        'create exam sessions',
        'view exam sessions',
        'view exams',
        'create exams',
    ];

    foreach ($permissions as $permission) {
        Permission::firstOrCreate(['name' => $permission]);
    }

    Role::firstOrCreate(['name' => 'admin'])->syncPermissions(['view analytics']);
    Role::firstOrCreate(['name' => 'student'])->syncPermissions([
        'view available exams',
        'take exams',
        'view own results',
        'view own attempts',
    ]);
    Role::firstOrCreate(['name' => 'educator'])->syncPermissions([
        'create exam sessions',
        'view exam sessions',
        'view exams',
        'create exams',
    ]);
});

test('admin can access student performance analytics', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $response = $this->actingAs($admin)->get(route('analytics.student-performance'));

    $response->assertOk()
        ->assertJsonStructure([
            'total_attempts',
            'average_score',
            'highest_score',
            'lowest_score',
            'passing_rate',
            'score_distribution',
            'average_time_spent_minutes',
        ]);
});

test('user without permission cannot access student performance analytics', function () {
    $student = User::factory()->create();
    $student->assignRole('student');

    $response = $this->actingAs($student)->get(route('analytics.student-performance'));

    $response->assertForbidden();
});

test('student performance returns correct statistics', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $educator = User::factory()->create();
    $educator->assignRole('educator');

    $student = User::factory()->create();
    $student->assignRole('student');

    $module = Module::factory()->create();
    $exam = Exam::factory()->create([
        'module_id' => $module->id,
        'status' => 'published',
        'created_by' => $educator->id,
    ]);

    $session = ExamSession::create([
        'exam_id' => $exam->id,
        'title' => 'Test Session',
        'start_time' => now()->subHour(),
        'end_time' => now()->addDays(1),
        'max_attempts' => 3,
        'created_by' => $educator->id,
        'status' => 'closed',
    ]);

    // Create exam attempts with different scores
    ExamAttempt::factory()->create([
        'exam_session_id' => $session->id,
        'user_id' => $student->id,
        'status' => 'submitted',
        'score' => 80,
        'total_questions' => 100,
        'percentage' => 80,
        'submitted_at' => now(),
        'time_spent_seconds' => 1800, // 30 minutes
    ]);

    ExamAttempt::factory()->create([
        'exam_session_id' => $session->id,
        'user_id' => User::factory()->create()->id,
        'status' => 'graded',
        'score' => 60,
        'total_questions' => 100,
        'percentage' => 60,
        'submitted_at' => now(),
        'time_spent_seconds' => 2400, // 40 minutes
    ]);

    ExamAttempt::factory()->create([
        'exam_session_id' => $session->id,
        'user_id' => User::factory()->create()->id,
        'status' => 'submitted',
        'score' => 40,
        'total_questions' => 100,
        'percentage' => 40,
        'submitted_at' => now(),
        'time_spent_seconds' => 1200, // 20 minutes
    ]);

    $response = $this->actingAs($admin)->get(route('analytics.student-performance'));

    $response->assertOk()
        ->assertJson([
            'total_attempts' => 3,
            'average_score' => 60,
            'highest_score' => 80,
            'lowest_score' => 40,
            'passing_rate' => 66.67, // 2 out of 3 passed (>= 60%)
            'average_time_spent_minutes' => 30, // Average of 30, 40, 20
        ]);
});

test('admin can access question difficulty analysis', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $response = $this->actingAs($admin)->get(route('analytics.question-difficulty'));

    $response->assertOk()
        ->assertJsonStructure([
            'hardest_questions',
            'easiest_questions',
            'overall_correct_rate',
        ]);
});

test('question difficulty analysis returns correct data', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $educator = User::factory()->create();
    $educator->assignRole('educator');

    $student = User::factory()->create();
    $student->assignRole('student');

    $module = Module::factory()->create();
    $exam = Exam::factory()->create([
        'module_id' => $module->id,
        'status' => 'published',
        'created_by' => $educator->id,
    ]);

    $question = ExamQuestion::factory()->create([
        'module_id' => $module->id,
        'question_type' => 'multiple_choice',
        'question' => 'What is 2+2?',
        'options' => ['A' => '3', 'B' => '4', 'C' => '5', 'D' => '6'],
        'correct_answer' => 'B',
        'points' => 1,
    ]);

    ExamItem::create([
        'exam_id' => $exam->id,
        'exam_question_id' => $question->id,
        'order' => 1,
        'points' => 1,
    ]);

    $session = ExamSession::create([
        'exam_id' => $exam->id,
        'title' => 'Test Session',
        'start_time' => now()->subHour(),
        'end_time' => now()->addDays(1),
        'max_attempts' => 3,
        'created_by' => $educator->id,
        'status' => 'closed',
    ]);

    $attempt1 = ExamAttempt::factory()->create([
        'exam_session_id' => $session->id,
        'user_id' => $student->id,
        'status' => 'submitted',
        'submitted_at' => now(),
    ]);

    $attempt2 = ExamAttempt::factory()->create([
        'exam_session_id' => $session->id,
        'user_id' => User::factory()->create()->id,
        'status' => 'submitted',
        'submitted_at' => now(),
    ]);

    $attempt3 = ExamAttempt::factory()->create([
        'exam_session_id' => $session->id,
        'user_id' => User::factory()->create()->id,
        'status' => 'submitted',
        'submitted_at' => now(),
    ]);

    // Create student answers - 2 correct, 1 incorrect
    StudentAnswer::factory()->create([
        'exam_attempt_id' => $attempt1->id,
        'exam_question_id' => $question->id,
        'is_correct' => true,
    ]);

    StudentAnswer::factory()->create([
        'exam_attempt_id' => $attempt2->id,
        'exam_question_id' => $question->id,
        'is_correct' => true,
    ]);

    StudentAnswer::factory()->create([
        'exam_attempt_id' => $attempt3->id,
        'exam_question_id' => $question->id,
        'is_correct' => false,
    ]);

    $response = $this->actingAs($admin)->get(route('analytics.question-difficulty'));

    $response->assertOk();
    $data = $response->json();

    // Should have 66.67% correct rate (2/3)
    expect($data['overall_correct_rate'])->toBe(66.67);
});

test('admin can access session performance analytics', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $response = $this->actingAs($admin)->get(route('analytics.session-performance'));

    $response->assertOk()
        ->assertJsonStructure([
            'sessions',
        ]);
});

test('session performance returns correct session data', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $educator = User::factory()->create();
    $educator->assignRole('educator');

    $student = User::factory()->create();
    $student->assignRole('student');

    $module = Module::factory()->create(['name' => 'Mathematics']);
    $exam = Exam::factory()->create([
        'title' => 'Math Exam 1',
        'module_id' => $module->id,
        'status' => 'published',
        'created_by' => $educator->id,
    ]);

    $session = ExamSession::create([
        'exam_id' => $exam->id,
        'title' => 'Math Session 1',
        'start_time' => now()->subHour(),
        'end_time' => now()->addDays(1),
        'max_attempts' => 3,
        'created_by' => $educator->id,
        'status' => 'closed',
    ]);

    // Create completed attempts
    ExamAttempt::factory()->create([
        'exam_session_id' => $session->id,
        'user_id' => $student->id,
        'status' => 'submitted',
        'percentage' => 75,
        'submitted_at' => now(),
    ]);

    ExamAttempt::factory()->create([
        'exam_session_id' => $session->id,
        'user_id' => User::factory()->create()->id,
        'status' => 'graded',
        'percentage' => 85,
        'submitted_at' => now(),
    ]);

    // Create in-progress attempt (should not be counted in completed)
    ExamAttempt::factory()->create([
        'exam_session_id' => $session->id,
        'user_id' => User::factory()->create()->id,
        'status' => 'in_progress',
        'percentage' => 0,
    ]);

    $response = $this->actingAs($admin)->get(route('analytics.session-performance'));

    $response->assertOk();
    $data = $response->json();

    $sessionData = collect($data['sessions'])->firstWhere('id', $session->id);

    expect($sessionData)->not->toBeNull();
    expect($sessionData['total_attempts'])->toBe(3);
    expect($sessionData['completed_attempts'])->toBe(2);
    expect($sessionData['average_score'])->toBe(80); // (75 + 85) / 2
    expect($sessionData['completion_rate'])->toBe(66.67); // 2/3 = 66.67%
});

test('admin can export student performance data', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $educator = User::factory()->create();
    $educator->assignRole('educator');

    $student = User::factory()->create(['name' => 'Test Student', 'email' => 'student@test.com']);
    $student->assignRole('student');

    $module = Module::factory()->create();
    $exam = Exam::factory()->create([
        'module_id' => $module->id,
        'status' => 'published',
        'created_by' => $educator->id,
    ]);

    $session = ExamSession::create([
        'exam_id' => $exam->id,
        'title' => 'Test Session',
        'start_time' => now()->subHour(),
        'end_time' => now()->addDays(1),
        'max_attempts' => 1,
        'created_by' => $educator->id,
        'status' => 'closed',
    ]);

    ExamAttempt::factory()->create([
        'exam_session_id' => $session->id,
        'user_id' => $student->id,
        'status' => 'submitted',
        'score' => 80,
        'total_questions' => 100,
        'percentage' => 80,
        'time_spent_seconds' => 1800,
        'submitted_at' => now(),
    ]);

    $response = $this->actingAs($admin)->get(route('analytics.export-student-performance'));

    $response->assertOk()
        ->assertHeader('Content-Type', 'text/csv; charset=utf-8');

    $content = $response->streamedContent();
    expect($content)->toContain('Student Name');
    expect($content)->toContain('Test Student');
    expect($content)->toContain('student@test.com');
});

test('student performance can be filtered by date range', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $educator = User::factory()->create();
    $educator->assignRole('educator');

    $module = Module::factory()->create();
    $exam = Exam::factory()->create([
        'module_id' => $module->id,
        'status' => 'published',
        'created_by' => $educator->id,
    ]);

    $session = ExamSession::create([
        'exam_id' => $exam->id,
        'title' => 'Test Session',
        'start_time' => now()->subDays(35),
        'end_time' => now()->addDays(1),
        'max_attempts' => 3,
        'created_by' => $educator->id,
        'status' => 'closed',
    ]);

    // Attempt within date range
    ExamAttempt::factory()->create([
        'exam_session_id' => $session->id,
        'user_id' => User::factory()->create()->id,
        'status' => 'submitted',
        'percentage' => 80,
        'submitted_at' => now()->subDays(5),
    ]);

    // Attempt outside date range
    ExamAttempt::factory()->create([
        'exam_session_id' => $session->id,
        'user_id' => User::factory()->create()->id,
        'status' => 'submitted',
        'percentage' => 60,
        'submitted_at' => now()->subDays(30),
    ]);

    $response = $this->actingAs($admin)->get(route('analytics.student-performance', [
        'start_date' => now()->subDays(7)->format('Y-m-d'),
        'end_date' => now()->format('Y-m-d'),
    ]));

    $response->assertOk();
    $data = $response->json();

    expect($data['total_attempts'])->toBe(1);
    expect($data['average_score'])->toBe(80);
});

test('student performance can be filtered by session', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $educator = User::factory()->create();
    $educator->assignRole('educator');

    $module = Module::factory()->create();
    $exam = Exam::factory()->create([
        'module_id' => $module->id,
        'status' => 'published',
        'created_by' => $educator->id,
    ]);

    $session1 = ExamSession::create([
        'exam_id' => $exam->id,
        'title' => 'Session 1',
        'start_time' => now()->subHour(),
        'end_time' => now()->addDays(1),
        'max_attempts' => 1,
        'created_by' => $educator->id,
        'status' => 'closed',
    ]);

    $session2 = ExamSession::create([
        'exam_id' => $exam->id,
        'title' => 'Session 2',
        'start_time' => now()->subHour(),
        'end_time' => now()->addDays(1),
        'max_attempts' => 1,
        'created_by' => $educator->id,
        'status' => 'closed',
    ]);

    // Attempt in session 1
    ExamAttempt::factory()->create([
        'exam_session_id' => $session1->id,
        'user_id' => User::factory()->create()->id,
        'status' => 'submitted',
        'percentage' => 90,
        'submitted_at' => now(),
    ]);

    // Attempt in session 2
    ExamAttempt::factory()->create([
        'exam_session_id' => $session2->id,
        'user_id' => User::factory()->create()->id,
        'status' => 'submitted',
        'percentage' => 50,
        'submitted_at' => now(),
    ]);

    $response = $this->actingAs($admin)->get(route('analytics.student-performance', [
        'session_id' => $session1->id,
    ]));

    $response->assertOk();
    $data = $response->json();

    expect($data['total_attempts'])->toBe(1);
    expect($data['average_score'])->toBe(90);
});
