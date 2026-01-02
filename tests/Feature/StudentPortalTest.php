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

    $studentPermissions = [
        'view available exams',
        'take exams',
        'view own results',
        'view own attempts',
        'edit own profile',
    ];

    foreach ($studentPermissions as $permission) {
        Permission::firstOrCreate(['name' => $permission]);
    }

    $educatorPermissions = [
        'create exam sessions',
        'edit exam sessions',
        'delete exam sessions',
        'view exam sessions',
        'view student results',
        'grade exams',
        'view exams',
        'create exams',
    ];

    foreach ($educatorPermissions as $permission) {
        Permission::firstOrCreate(['name' => $permission]);
    }

    Role::firstOrCreate(['name' => 'student'])->syncPermissions($studentPermissions);
    Role::firstOrCreate(['name' => 'educator'])->syncPermissions($educatorPermissions);
});

test('educator can create an exam session', function () {
    $educator = User::factory()->create();
    $educator->assignRole('educator');

    $module = Module::factory()->create();
    $exam = Exam::factory()->create([
        'module_id' => $module->id,
        'status' => 'published',
        'created_by' => $educator->id,
    ]);

    $response = $this->actingAs($educator)->post('/exam-sessions', [
        'exam_id' => $exam->id,
        'title' => 'Test Session',
        'description' => 'Test description',
        'start_time' => now()->addHour()->format('Y-m-d\TH:i'),
        'end_time' => now()->addDays(1)->format('Y-m-d\TH:i'),
        'time_limit_minutes' => 60,
        'max_attempts' => 1,
        'shuffle_questions' => false,
        'shuffle_options' => false,
        'show_results_immediately' => true,
        'show_correct_answers' => false,
        'allow_review' => true,
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('exam_sessions', [
        'title' => 'Test Session',
        'exam_id' => $exam->id,
    ]);
});

test('exam session generates unique access code', function () {
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
        'start_time' => now()->addHour(),
        'end_time' => now()->addDays(1),
        'max_attempts' => 1,
        'created_by' => $educator->id,
        'status' => 'active',
    ]);

    expect($session->access_code)->toHaveLength(8);
    expect($session->access_code)->toMatch('/^[A-Z0-9]+$/');
});

test('student can join exam by access code', function () {
    $student = User::factory()->create();
    $student->assignRole('student');

    $module = Module::factory()->create();
    $exam = Exam::factory()->create([
        'module_id' => $module->id,
        'status' => 'published',
    ]);

    $session = ExamSession::create([
        'exam_id' => $exam->id,
        'title' => 'Test Session',
        'start_time' => now()->subHour(),
        'end_time' => now()->addDays(1),
        'max_attempts' => 1,
        'created_by' => 1,
        'status' => 'active',
    ]);

    $response = $this->actingAs($student)->post('/student/join-exam', [
        'access_code' => $session->access_code,
    ]);

    $response->assertRedirect("/student/exam/{$session->id}/start");
});

test('student cannot join exam with invalid access code', function () {
    $student = User::factory()->create();
    $student->assignRole('student');

    $response = $this->actingAs($student)->post('/student/join-exam', [
        'access_code' => 'INVALIDCODE',
    ]);

    $response->assertSessionHasErrors('access_code');
});

test('student can start an exam attempt', function () {
    $student = User::factory()->create();
    $student->assignRole('student');

    $module = Module::factory()->create();
    $exam = Exam::factory()->create([
        'module_id' => $module->id,
        'status' => 'published',
        'total_items' => 1,
    ]);

    $question = ExamQuestion::factory()->create([
        'module_id' => $module->id,
        'question_type' => 'multiple_choice',
        'question' => 'Test question?',
        'options' => ['A' => 'Answer A', 'B' => 'Answer B', 'C' => 'Answer C', 'D' => 'Answer D'],
        'correct_answer' => 'A',
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
        'created_by' => 1,
        'status' => 'active',
    ]);

    $response = $this->actingAs($student)->post("/student/exam/{$session->id}/begin");

    $response->assertRedirect();
    $this->assertDatabaseHas('exam_attempts', [
        'exam_session_id' => $session->id,
        'user_id' => $student->id,
        'status' => 'in_progress',
    ]);
});

test('student cannot exceed max attempts', function () {
    $student = User::factory()->create();
    $student->assignRole('student');

    $module = Module::factory()->create();
    $exam = Exam::factory()->create([
        'module_id' => $module->id,
        'status' => 'published',
    ]);

    $session = ExamSession::create([
        'exam_id' => $exam->id,
        'title' => 'Test Session',
        'start_time' => now()->subHour(),
        'end_time' => now()->addDays(1),
        'max_attempts' => 1,
        'created_by' => 1,
        'status' => 'active',
    ]);

    ExamAttempt::create([
        'exam_session_id' => $session->id,
        'user_id' => $student->id,
        'attempt_number' => 1,
        'started_at' => now()->subMinutes(30),
        'submitted_at' => now()->subMinutes(5),
        'status' => 'submitted',
        'score' => 80,
        'percentage' => 80,
    ]);

    $response = $this->actingAs($student)->post("/student/exam/{$session->id}/begin");

    $response->assertSessionHasErrors();
});

test('student can save answer during exam', function () {
    $student = User::factory()->create();
    $student->assignRole('student');

    $module = Module::factory()->create();
    $exam = Exam::factory()->create([
        'module_id' => $module->id,
        'status' => 'published',
    ]);

    $question = ExamQuestion::factory()->create([
        'module_id' => $module->id,
        'question_type' => 'multiple_choice',
        'question' => 'Test question?',
        'options' => ['A' => 'Answer A', 'B' => 'Answer B', 'C' => 'Answer C', 'D' => 'Answer D'],
        'correct_answer' => 'A',
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
        'max_attempts' => 1,
        'created_by' => 1,
        'status' => 'active',
    ]);

    $attempt = ExamAttempt::create([
        'exam_session_id' => $session->id,
        'user_id' => $student->id,
        'attempt_number' => 1,
        'started_at' => now(),
        'status' => 'in_progress',
    ]);

    // Create the student answer record first (normally done when attempt starts)
    $studentAnswer = StudentAnswer::create([
        'exam_attempt_id' => $attempt->id,
        'exam_question_id' => $question->id,
        'max_points' => 1,
    ]);

    $response = $this->actingAs($student)->post("/student/exam/take/{$attempt->id}/save-answer", [
        'answer_id' => $studentAnswer->id,
        'answer' => 'B',
    ]);

    $response->assertSuccessful();
    $this->assertDatabaseHas('student_answers', [
        'id' => $studentAnswer->id,
        'answer' => 'B',
    ]);
});

test('student can submit exam and receive score', function () {
    $student = User::factory()->create();
    $student->assignRole('student');

    $module = Module::factory()->create();
    $exam = Exam::factory()->create([
        'module_id' => $module->id,
        'status' => 'published',
        'total_points' => 2,
    ]);

    $question1 = ExamQuestion::factory()->create([
        'module_id' => $module->id,
        'question_type' => 'multiple_choice',
        'question' => 'Question 1?',
        'options' => ['A' => 'Answer A', 'B' => 'Answer B', 'C' => 'Answer C', 'D' => 'Answer D'],
        'correct_answer' => 'A',
        'points' => 1,
    ]);

    $question2 = ExamQuestion::factory()->create([
        'module_id' => $module->id,
        'question_type' => 'true_false',
        'question' => 'Question 2?',
        'correct_answer' => 'true',
        'points' => 1,
    ]);

    ExamItem::create([
        'exam_id' => $exam->id,
        'exam_question_id' => $question1->id,
        'order' => 1,
        'points' => 1,
    ]);

    ExamItem::create([
        'exam_id' => $exam->id,
        'exam_question_id' => $question2->id,
        'order' => 2,
        'points' => 1,
    ]);

    $session = ExamSession::create([
        'exam_id' => $exam->id,
        'title' => 'Test Session',
        'start_time' => now()->subHour(),
        'end_time' => now()->addDays(1),
        'max_attempts' => 1,
        'show_results_immediately' => true,
        'created_by' => 1,
        'status' => 'active',
    ]);

    $attempt = ExamAttempt::create([
        'exam_session_id' => $session->id,
        'user_id' => $student->id,
        'attempt_number' => 1,
        'started_at' => now()->subMinutes(10),
        'status' => 'in_progress',
    ]);

    StudentAnswer::create([
        'exam_attempt_id' => $attempt->id,
        'exam_question_id' => $question1->id,
        'answer' => 'A',
    ]);

    StudentAnswer::create([
        'exam_attempt_id' => $attempt->id,
        'exam_question_id' => $question2->id,
        'answer' => 'true',
    ]);

    $response = $this->actingAs($student)->post("/student/exam/take/{$attempt->id}/submit");

    $response->assertRedirect();

    $attempt->refresh();
    expect($attempt->status)->toBe('submitted');
    expect((float) $attempt->score)->toBe(2.0);
    expect((float) $attempt->percentage)->toBe(100.0);
});

test('auto grading works for multiple choice', function () {
    $module = Module::factory()->create();
    $exam = Exam::factory()->create(['module_id' => $module->id]);

    $question = ExamQuestion::factory()->create([
        'module_id' => $module->id,
        'question_type' => 'multiple_choice',
        'question' => 'Test question?',
        'options' => ['A' => 'Answer A', 'B' => 'Answer B', 'C' => 'Answer C', 'D' => 'Answer D'],
        'correct_answer' => 'B',
        'points' => 2,
    ]);

    ExamItem::create([
        'exam_id' => $exam->id,
        'exam_question_id' => $question->id,
        'order' => 1,
        'points' => 2,
    ]);

    $session = ExamSession::create([
        'exam_id' => $exam->id,
        'title' => 'Test',
        'start_time' => now()->subHour(),
        'end_time' => now()->addDay(),
        'max_attempts' => 1,
        'created_by' => 1,
        'status' => 'active',
    ]);

    $attempt = ExamAttempt::create([
        'exam_session_id' => $session->id,
        'user_id' => User::factory()->create()->id,
        'attempt_number' => 1,
        'started_at' => now(),
        'status' => 'in_progress',
    ]);

    $correctAnswer = StudentAnswer::create([
        'exam_attempt_id' => $attempt->id,
        'exam_question_id' => $question->id,
        'answer' => 'B',
        'max_points' => 2,
    ]);
    $correctAnswer->autoGrade();

    expect($correctAnswer->is_correct)->toBeTrue();
    expect((float) $correctAnswer->points_earned)->toBe(2.0);
});

test('auto grading marks wrong answer as incorrect', function () {
    $module = Module::factory()->create();
    $exam = Exam::factory()->create(['module_id' => $module->id]);

    $question = ExamQuestion::factory()->create([
        'module_id' => $module->id,
        'question_type' => 'multiple_choice',
        'question' => 'Test question?',
        'options' => ['A' => 'Answer A', 'B' => 'Answer B', 'C' => 'Answer C', 'D' => 'Answer D'],
        'correct_answer' => 'B',
        'points' => 2,
    ]);

    ExamItem::create([
        'exam_id' => $exam->id,
        'exam_question_id' => $question->id,
        'order' => 1,
        'points' => 2,
    ]);

    $session = ExamSession::create([
        'exam_id' => $exam->id,
        'title' => 'Test',
        'start_time' => now()->subHour(),
        'end_time' => now()->addDay(),
        'max_attempts' => 1,
        'created_by' => 1,
        'status' => 'active',
    ]);

    $attempt = ExamAttempt::create([
        'exam_session_id' => $session->id,
        'user_id' => User::factory()->create()->id,
        'attempt_number' => 1,
        'started_at' => now(),
        'status' => 'in_progress',
    ]);

    $incorrectAnswer = StudentAnswer::create([
        'exam_attempt_id' => $attempt->id,
        'exam_question_id' => $question->id,
        'answer' => 'A',
        'max_points' => 2,
    ]);
    $incorrectAnswer->autoGrade();

    expect($incorrectAnswer->is_correct)->toBeFalse();
    expect((float) $incorrectAnswer->points_earned)->toBe(0.0);
});

test('auto grading works for identification with case insensitivity', function () {
    $module = Module::factory()->create();
    $exam = Exam::factory()->create(['module_id' => $module->id]);

    $question = ExamQuestion::factory()->create([
        'module_id' => $module->id,
        'question_type' => 'identification',
        'question' => 'What language is Laravel built with?',
        'correct_answer' => 'PHP',
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
        'title' => 'Test',
        'start_time' => now()->subHour(),
        'end_time' => now()->addDay(),
        'max_attempts' => 1,
        'created_by' => 1,
        'status' => 'active',
    ]);

    $attempt = ExamAttempt::create([
        'exam_session_id' => $session->id,
        'user_id' => User::factory()->create()->id,
        'attempt_number' => 1,
        'started_at' => now(),
        'status' => 'in_progress',
    ]);

    $answer = StudentAnswer::create([
        'exam_attempt_id' => $attempt->id,
        'exam_question_id' => $question->id,
        'answer' => 'php',
        'max_points' => 1,
    ]);
    $answer->autoGrade();

    expect($answer->is_correct)->toBeTrue();
});

test('auto grading works for identification with trimming', function () {
    $module = Module::factory()->create();
    $exam = Exam::factory()->create(['module_id' => $module->id]);

    $question = ExamQuestion::factory()->create([
        'module_id' => $module->id,
        'question_type' => 'identification',
        'question' => 'What language is Laravel built with?',
        'correct_answer' => 'PHP',
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
        'title' => 'Test',
        'start_time' => now()->subHour(),
        'end_time' => now()->addDay(),
        'max_attempts' => 1,
        'created_by' => 1,
        'status' => 'active',
    ]);

    $attempt = ExamAttempt::create([
        'exam_session_id' => $session->id,
        'user_id' => User::factory()->create()->id,
        'attempt_number' => 1,
        'started_at' => now(),
        'status' => 'in_progress',
    ]);

    $answer = StudentAnswer::create([
        'exam_attempt_id' => $attempt->id,
        'exam_question_id' => $question->id,
        'answer' => ' PHP ',
        'max_points' => 1,
    ]);
    $answer->autoGrade();

    expect($answer->is_correct)->toBeTrue();
});

test('educator can export results to CSV', function () {
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
        'start_time' => now()->subHour(),
        'end_time' => now()->addDays(1),
        'max_attempts' => 1,
        'created_by' => $educator->id,
        'status' => 'active',
    ]);

    $response = $this->actingAs($educator)->get("/exam-sessions/{$session->id}/export-results");

    $response->assertSuccessful();
    expect($response->headers->get('Content-Type'))->toContain('text/csv');
});

test('educator can regenerate session access code', function () {
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
        'start_time' => now()->subHour(),
        'end_time' => now()->addDays(1),
        'max_attempts' => 1,
        'created_by' => $educator->id,
        'status' => 'active',
    ]);

    $originalCode = $session->access_code;

    $response = $this->actingAs($educator)->post("/exam-sessions/{$session->id}/regenerate-code");

    $response->assertRedirect();
    $session->refresh();
    expect($session->access_code)->not->toBe($originalCode);
});

test('exam session can determine if active', function () {
    $module = Module::factory()->create();
    $exam = Exam::factory()->create(['module_id' => $module->id]);

    $activeSession = ExamSession::create([
        'exam_id' => $exam->id,
        'title' => 'Active Session',
        'start_time' => now()->subHour(),
        'end_time' => now()->addDays(1),
        'max_attempts' => 1,
        'created_by' => 1,
        'status' => 'active',
    ]);

    $upcomingSession = ExamSession::create([
        'exam_id' => $exam->id,
        'title' => 'Upcoming Session',
        'start_time' => now()->addHour(),
        'end_time' => now()->addDays(1),
        'max_attempts' => 1,
        'created_by' => 1,
        'status' => 'active',
    ]);

    $expiredSession = ExamSession::create([
        'exam_id' => $exam->id,
        'title' => 'Expired Session',
        'start_time' => now()->subDays(2),
        'end_time' => now()->subDay(),
        'max_attempts' => 1,
        'created_by' => 1,
        'status' => 'active',
    ]);

    expect($activeSession->isActive())->toBeTrue();
    expect($upcomingSession->isUpcoming())->toBeTrue();
    expect($expiredSession->isExpired())->toBeTrue();
});

test('exam attempt calculates time remaining', function () {
    $module = Module::factory()->create();
    $exam = Exam::factory()->create([
        'module_id' => $module->id,
        'time_limit' => 60,
    ]);

    $session = ExamSession::create([
        'exam_id' => $exam->id,
        'title' => 'Test Session',
        'start_time' => now()->subHour(),
        'end_time' => now()->addDays(1),
        'time_limit_minutes' => 30,
        'max_attempts' => 1,
        'created_by' => 1,
        'status' => 'active',
    ]);

    // Create attempt that started 10 minutes ago
    $startedAt = now()->subMinutes(10);

    $attempt = ExamAttempt::create([
        'exam_session_id' => $session->id,
        'user_id' => User::factory()->create()->id,
        'attempt_number' => 1,
        'started_at' => $startedAt,
        'status' => 'in_progress',
    ]);

    $timeRemaining = $attempt->getTimeRemainingSeconds();
    // 30 min limit - 10 min elapsed = 20 min remaining = 1200 seconds (approximately)
    expect($timeRemaining)->toBeGreaterThan(1190); // Allow a bit of tolerance
    expect($timeRemaining)->toBeLessThanOrEqual(1210);
});

test('student can access dashboard', function () {
    $student = User::factory()->create();
    $student->assignRole('student');

    $response = $this->actingAs($student)->get('/student/dashboard');

    $response->assertSuccessful();
    $response->assertInertia(function ($page) {
        $page->component('student/dashboard')
            ->has('availableSessions')
            ->has('inProgressAttempts')
            ->has('recentResults')
            ->has('stats');
    });
});

test('student dashboard shows available sessions', function () {
    $student = User::factory()->create();
    $student->assignRole('student');

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
        'title' => 'Available Test Session',
        'start_time' => now()->subHour(),
        'end_time' => now()->addDays(1),
        'max_attempts' => 1,
        'created_by' => $educator->id,
        'status' => 'active',
    ]);

    $response = $this->actingAs($student)->get('/student/dashboard');

    $response->assertSuccessful();
    $response->assertInertia(function ($page) {
        $page->component('student/dashboard')
            ->where('availableSessions.0.title', 'Available Test Session');
    });
});

test('student dashboard shows in progress attempts', function () {
    $student = User::factory()->create();
    $student->assignRole('student');

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
        'start_time' => now()->subHour(),
        'end_time' => now()->addDays(1),
        'max_attempts' => 1,
        'created_by' => $educator->id,
        'status' => 'active',
    ]);

    ExamAttempt::create([
        'exam_session_id' => $session->id,
        'user_id' => $student->id,
        'attempt_number' => 1,
        'started_at' => now(),
        'status' => 'in_progress',
    ]);

    $response = $this->actingAs($student)->get('/student/dashboard');

    $response->assertSuccessful();
    $response->assertInertia(function ($page) {
        $page->component('student/dashboard')
            ->has('inProgressAttempts', 1);
    });
});

test('student dashboard calculates stats correctly', function () {
    $student = User::factory()->create();
    $student->assignRole('student');

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
        'start_time' => now()->subHour(),
        'end_time' => now()->addDays(1),
        'max_attempts' => 3,
        'created_by' => $educator->id,
        'status' => 'active',
    ]);

    // Create a completed attempt with 80% score
    ExamAttempt::create([
        'exam_session_id' => $session->id,
        'user_id' => $student->id,
        'attempt_number' => 1,
        'started_at' => now()->subMinutes(30),
        'submitted_at' => now()->subMinutes(10),
        'status' => 'submitted',
        'score' => 8,
        'total_points' => 10,
        'percentage' => 80.0,
    ]);

    // Create an in-progress attempt
    ExamAttempt::create([
        'exam_session_id' => $session->id,
        'user_id' => $student->id,
        'attempt_number' => 2,
        'started_at' => now(),
        'status' => 'in_progress',
    ]);

    $response = $this->actingAs($student)->get('/student/dashboard');

    $response->assertSuccessful();
    $response->assertInertia(function ($page) {
        $page->component('student/dashboard')
            ->where('stats.total_attempts', 2)
            ->where('stats.completed_exams', 1)
            ->where('stats.average_score', 80)
            ->where('stats.in_progress', 1);
    });
});
