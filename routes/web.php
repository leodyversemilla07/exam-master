<?php

use App\Http\Controllers\AnalyticsController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DuplicateDetectionController;
use App\Http\Controllers\ExamBuilderController;
use App\Http\Controllers\ExamCollaboratorController;
use App\Http\Controllers\ExamController;
use App\Http\Controllers\ExamSessionController;
use App\Http\Controllers\HealthCheckController;
use App\Http\Controllers\LearningObjectiveController;
use App\Http\Controllers\ModuleController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\QueueMonitorController;
use App\Http\Controllers\StudentDashboardController;
use App\Http\Controllers\StudentExamController;
use App\Http\Controllers\SystemLogsController;
use App\Http\Controllers\TopicController;
use App\Http\Controllers\TosCalculatorController;
use App\Http\Controllers\TosGenerateController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
    ]);
});

Route::get('/design-system', function () {
    return Inertia::render('design-system-showcase');
})->name('design-system');

Route::get('/dashboard', DashboardController::class)
    ->middleware(['auth', 'verified'])->name('dashboard');

Route::get('/health', HealthCheckController::class)->name('health.check');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('/password', function () {
        return Inertia::render('settings/password');
    })->name('password.edit');

    Route::get('/appearance', function () {
        return Inertia::render('settings/appearance');
    })->name('appearance.edit');
});

Route::resource('users', UserController::class)
    ->only(['index', 'store', 'update', 'destroy'])
    ->middleware(['auth', 'verified', 'permission:view users']);

Route::post('users/{user}/toggle', [UserController::class, 'toggleActive'])
    ->name('users.toggle')
    ->middleware(['auth', 'verified', 'permission:edit users']);

Route::resource('modules', ModuleController::class)
    ->middleware(['auth', 'verified', 'permission:view modules']);

Route::post('modules/extract-from-pdf', [ModuleController::class, 'extractFromPdf'])
    ->name('modules.extract-pdf')
    ->middleware(['auth', 'verified', 'permission:create modules']);

Route::post('modules/{module}/extract-tos', [ModuleController::class, 'extractTosFromModule'])
    ->name('modules.extract-tos')
    ->middleware(['auth', 'verified', 'permission:create tos']);

Route::post('modules/{module}/toggle', [ModuleController::class, 'toggleStatus'])
    ->name('modules.toggle')
    ->middleware(['auth', 'verified', 'permission:edit modules']);

Route::resource('tos-generates', TosGenerateController::class)
    ->middleware(['auth', 'verified', 'permission:view tos']);

// AI Question Generation Route
Route::post('tos-generates/{tos_generate}/generate', [TosGenerateController::class, 'generateQuestions'])
    ->name('tos-generates.generate')
    ->middleware(['auth', 'verified', 'permission:generate questions']);

Route::delete('question-bank/bulk-destroy', [ExamController::class, 'bulkDestroy'])
    ->name('question-bank.bulk-destroy')
    ->middleware(['auth', 'verified', 'permission:bulk delete questions']);

Route::post('question-bank/{exam}/approve', [ExamController::class, 'approve'])
    ->name('question-bank.approve')
    ->middleware(['auth', 'verified', 'permission:approve questions']);

Route::post('question-bank/{exam}/polish', [ExamController::class, 'polish'])
    ->name('question-bank.polish')
    ->middleware(['auth', 'verified', 'permission:edit exams']);

Route::post('question-bank/{exam}/calibrate', [ExamController::class, 'calibrate'])
    ->name('question-bank.calibrate')
    ->middleware(['auth', 'verified', 'permission:edit exams']);

Route::resource('question-bank', ExamController::class)
    ->parameters(['question-bank' => 'exam'])
    ->middleware(['auth', 'verified', 'permission:view exams']);

// Exam Builder Routes
Route::post('exam-builder/{exam}/add-questions', [ExamBuilderController::class, 'addQuestions'])
    ->name('exam-builder.add-questions')
    ->middleware(['auth', 'verified', 'permission:edit exams']);

Route::delete('exam-builder/{exam}/questions/{question}', [ExamBuilderController::class, 'removeQuestion'])
    ->name('exam-builder.remove-question')
    ->middleware(['auth', 'verified', 'permission:edit exams']);

Route::patch('exam-builder/{exam}/questions/reorder', [ExamBuilderController::class, 'reorderQuestions'])
    ->name('exam-builder.reorder-questions')
    ->middleware(['auth', 'verified', 'permission:edit exams']);

Route::patch('exam-builder/{exam}/questions/{question}/points', [ExamBuilderController::class, 'updateQuestionPoints'])
    ->name('exam-builder.update-points')
    ->middleware(['auth', 'verified', 'permission:edit exams']);

Route::post('exam-builder/{exam}/publish', [ExamBuilderController::class, 'publish'])
    ->name('exam-builder.publish')
    ->middleware(['auth', 'verified', 'permission:publish exams']);

Route::post('exam-builder/{exam}/duplicate', [ExamBuilderController::class, 'duplicate'])
    ->name('exam-builder.duplicate')
    ->middleware(['auth', 'verified', 'permission:create exams']);

Route::post('exam-builder/{exam}/archive', [ExamBuilderController::class, 'archive'])
    ->name('exam-builder.archive')
    ->middleware(['auth', 'verified', 'permission:edit exams']);

Route::post('exam-builder/{exam}/unarchive', [ExamBuilderController::class, 'unarchive'])
    ->name('exam-builder.unarchive')
    ->middleware(['auth', 'verified', 'permission:edit exams']);

Route::resource('exam-builder', ExamBuilderController::class)
    ->middleware(['auth', 'verified', 'permission:view exams']);

// Exam Collaborator Routes
Route::get('exam-builder/{exam}/collaborators', [ExamCollaboratorController::class, 'index'])
    ->name('exam-builder.collaborators')
    ->middleware(['auth', 'verified']);

Route::post('exam-builder/{exam}/collaborators', [ExamCollaboratorController::class, 'store'])
    ->name('exam-builder.collaborators.store')
    ->middleware(['auth', 'verified']);

Route::patch('exam-builder/{exam}/collaborators/{user}', [ExamCollaboratorController::class, 'update'])
    ->name('exam-builder.collaborators.update')
    ->middleware(['auth', 'verified']);

Route::delete('exam-builder/{exam}/collaborators/{user}', [ExamCollaboratorController::class, 'destroy'])
    ->name('exam-builder.collaborators.destroy')
    ->middleware(['auth', 'verified']);

Route::post('exam-builder/{exam}/collaborators/leave', [ExamCollaboratorController::class, 'leave'])
    ->name('exam-builder.collaborators.leave')
    ->middleware(['auth', 'verified']);

Route::get('exam-builder/collaborators/search', [ExamCollaboratorController::class, 'searchUsers'])
    ->name('exam-builder.collaborators.search')
    ->middleware(['auth', 'verified']);

Route::get('exam-builder/{examId}/export-pdf', [ExamBuilderController::class, 'exportPdf'])
    ->name('exam-builder.export-pdf')
    ->middleware(['auth', 'verified', 'permission:view exams']);

Route::get('exam-builder/{examId}/export-pdf-answers', [ExamBuilderController::class, 'exportPdfWithAnswers'])
    ->name('exam-builder.export-pdf-answers')
    ->middleware(['auth', 'verified', 'permission:view exams']);

Route::get('exam-builder/{examId}/export-docx', [ExamBuilderController::class, 'exportDocx'])
    ->name('exam-builder.export-docx')
    ->middleware(['auth', 'verified', 'permission:view exams']);

Route::get('exam-builder/{examId}/export-docx-answers', [ExamBuilderController::class, 'exportDocxWithAnswers'])
    ->name('exam-builder.export-docx-answers')
    ->middleware(['auth', 'verified', 'permission:view exams']);

Route::get('exam-builder/{examId}/preview', [ExamBuilderController::class, 'preview'])
    ->name('exam-builder.preview')
    ->middleware(['auth', 'verified', 'permission:view exams']);

Route::resource('exam-templates', \App\Http\Controllers\ExamTemplateController::class)
    ->middleware(['auth', 'verified']);

// Topic Management Routes
Route::patch('modules/{module}/topics/reorder', [TopicController::class, 'reorder'])
    ->name('modules.topics.reorder')
    ->middleware(['auth', 'verified', 'permission:edit modules']);

Route::resource('modules.topics', TopicController::class)
    ->except(['show'])
    ->middleware(['auth', 'verified', 'permission:view modules']);

Route::get('modules/{module}/topics/{topic}', [TopicController::class, 'show'])
    ->name('modules.topics.show')
    ->middleware(['auth', 'verified', 'permission:view modules']);

// Learning Objective Routes
Route::patch('modules/{module}/topics/{topic}/objectives/reorder', [LearningObjectiveController::class, 'reorder'])
    ->name('modules.topics.objectives.reorder')
    ->middleware(['auth', 'verified', 'permission:edit modules']);

Route::resource('modules.topics.objectives', LearningObjectiveController::class)
    ->only(['index', 'store', 'update', 'destroy'])
    ->middleware(['auth', 'verified', 'permission:view modules']);

// TOS Calculator Routes
Route::get('modules/{module}/tos-calculator', [TosCalculatorController::class, 'index'])
    ->name('modules.tos-calculator')
    ->middleware(['auth', 'verified', 'permission:view modules']);

// Duplicate Detection Routes
Route::get('modules/{module}/duplicate-detection', [DuplicateDetectionController::class, 'index'])
    ->name('modules.duplicate-detection')
    ->middleware(['auth', 'verified', 'permission:view modules']);

// TOS Distribution & Matrix Routes
Route::get('tos-generates/{tos_generate}/matrix', [TosGenerateController::class, 'showMatrix'])
    ->name('tos-generates.matrix')
    ->middleware(['auth', 'verified', 'permission:view tos']);

Route::get('tos-generates/{tos_generate}/validate', [TosGenerateController::class, 'validateTos'])
    ->name('tos-generates.validate')
    ->middleware(['auth', 'verified', 'permission:view tos']);

Route::get('tos-generates/{tos_generate}/distribution', [TosGenerateController::class, 'getDistribution'])
    ->name('tos-generates.distribution')
    ->middleware(['auth', 'verified', 'permission:view tos']);

Route::get('tos-generates/{tos_generate}/summary', [TosGenerateController::class, 'getSummary'])
    ->name('tos-generates.summary')
    ->middleware(['auth', 'verified', 'permission:view tos']);

Route::get('tos-generates/{tos_generate}/export-pdf', [TosGenerateController::class, 'exportPdf'])
    ->name('tos-generates.export-pdf')
    ->middleware(['auth', 'verified', 'permission:view tos']);

Route::post('tos-generates/{tos_generate}/duplicate', [TosGenerateController::class, 'duplicate'])
    ->name('tos-generates.duplicate')
    ->middleware(['auth', 'verified', 'permission:create tos']);

// Duplicate Detection Routes
Route::get('question-bank/{question}/duplicates', [ExamController::class, 'checkDuplicates'])
    ->name('question-bank.duplicates')
    ->middleware(['auth', 'verified', 'permission:view exams']);

Route::get('modules/{module}/duplicate-stats', [ExamController::class, 'getModuleDuplicates'])
    ->name('modules.duplicate-stats')
    ->middleware(['auth', 'verified', 'permission:view modules']);

Route::post('question-bank/check-duplicates', [ExamController::class, 'bulkCheckDuplicates'])
    ->name('question-bank.check-duplicates')
    ->middleware(['auth', 'verified', 'permission:create questions']);

// Analytics Routes
Route::get('analytics', [AnalyticsController::class, 'index'])
    ->name('analytics.index')
    ->middleware(['auth', 'verified', 'permission:view analytics']);

Route::get('analytics/exams-created', [AnalyticsController::class, 'examsCreatedPerPeriod'])
    ->name('analytics.exams-created')
    ->middleware(['auth', 'verified', 'permission:view analytics']);

Route::get('analytics/modules-topics', [AnalyticsController::class, 'mostUsedModulesAndTopics'])
    ->name('analytics.modules-topics')
    ->middleware(['auth', 'verified', 'permission:view analytics']);

Route::get('analytics/educator-activity', [AnalyticsController::class, 'educatorActivity'])
    ->name('analytics.educator-activity')
    ->middleware(['auth', 'verified', 'permission:view analytics']);

Route::get('analytics/export-csv', [AnalyticsController::class, 'exportCsv'])
    ->name('analytics.export-csv')
    ->middleware(['auth', 'verified', 'permission:view analytics']);

Route::get('analytics/student-performance', [AnalyticsController::class, 'studentPerformance'])
    ->name('analytics.student-performance')
    ->middleware(['auth', 'verified', 'permission:view analytics']);

Route::get('analytics/question-difficulty', [AnalyticsController::class, 'questionDifficultyAnalysis'])
    ->name('analytics.question-difficulty')
    ->middleware(['auth', 'verified', 'permission:view analytics']);

Route::get('analytics/session-performance', [AnalyticsController::class, 'sessionPerformance'])
    ->name('analytics.session-performance')
    ->middleware(['auth', 'verified', 'permission:view analytics']);

Route::get('analytics/export-student-performance', [AnalyticsController::class, 'exportStudentPerformance'])
    ->name('analytics.export-student-performance')
    ->middleware(['auth', 'verified', 'permission:view analytics']);

// System Logs Routes
Route::get('system-logs', [SystemLogsController::class, 'index'])
    ->name('system-logs.index')
    ->middleware(['auth', 'verified', 'permission:view users']);

Route::get('system-logs/logs', [SystemLogsController::class, 'getLogs'])
    ->name('system-logs.logs')
    ->middleware(['auth', 'verified', 'permission:view users']);

Route::post('system-logs/clear', [SystemLogsController::class, 'clearLogs'])
    ->name('system-logs.clear')
    ->middleware(['auth', 'verified', 'permission:view users']);

Route::get('system-logs/download', [SystemLogsController::class, 'downloadLogs'])
    ->name('system-logs.download')
    ->middleware(['auth', 'verified', 'permission:view users']);

// Queue Monitor Routes
Route::get('queue-monitor', [QueueMonitorController::class, 'index'])
    ->name('queue-monitor.index')
    ->middleware(['auth', 'verified', 'permission:view users']);

Route::get('queue-monitor/stats', [QueueMonitorController::class, 'getStats'])
    ->name('queue-monitor.stats')
    ->middleware(['auth', 'verified', 'permission:view users']);

Route::post('queue-monitor/retry', [QueueMonitorController::class, 'retryJob'])
    ->name('queue-monitor.retry')
    ->middleware(['auth', 'verified', 'permission:view users']);

Route::delete('queue-monitor/job', [QueueMonitorController::class, 'deleteJob'])
    ->name('queue-monitor.delete')
    ->middleware(['auth', 'verified', 'permission:view users']);

Route::post('queue-monitor/clear', [QueueMonitorController::class, 'clearFailedJobs'])
    ->name('queue-monitor.clear')
    ->middleware(['auth', 'verified', 'permission:view users']);

// Exam Sessions Routes (for educators)
Route::resource('exam-sessions', ExamSessionController::class)
    ->middleware(['auth', 'verified', 'permission:view exam sessions']);

Route::post('exam-sessions/{examSession}/regenerate-code', [ExamSessionController::class, 'regenerateCode'])
    ->name('exam-sessions.regenerate-code')
    ->middleware(['auth', 'verified', 'permission:edit exam sessions']);

Route::get('exam-sessions/{examSession}/results', [ExamSessionController::class, 'results'])
    ->name('exam-sessions.results')
    ->middleware(['auth', 'verified', 'permission:view student results']);

Route::get('exam-sessions/{examSession}/plagiarism', [ExamSessionController::class, 'plagiarismReport'])
    ->name('exam-sessions.plagiarism')
    ->middleware(['auth', 'verified', 'permission:view student results']);

Route::get('exam-sessions/{examSession}/export-results', [ExamSessionController::class, 'exportResults'])
    ->name('exam-sessions.export-results')
    ->middleware(['auth', 'verified', 'permission:view student results']);

Route::get('exam-sessions-preview/results', function () {
    return Inertia::render('exam-sessions/results', [
        'session' => [
            'id' => 1,
            'title' => 'Midterm Exam - Section A',
            'status' => 'active',
            'access_code' => 'ABC12345',
            'start_time' => now()->subDays(2)->toISOString(),
            'end_time' => now()->addDays(5)->toISOString(),
            'exam' => [
                'id' => 1,
                'title' => 'Introduction to Computer Science',
                'module' => ['id' => 1, 'name' => 'CS101 - Fundamentals'],
            ],
        ],
        'attempts' => [
            'data' => [
                [
                    'id' => 1,
                    'exam_session_id' => 1,
                    'user_id' => 1,
                    'status' => 'graded',
                    'started_at' => now()->subHours(3)->toISOString(),
                    'completed_at' => now()->subHours(2)->toISOString(),
                    'submitted_at' => now()->subHours(2)->toISOString(),
                    'attempt_number' => 1,
                    'score' => 85.5,
                    'total_points' => 100,
                    'percentage' => 85.5,
                    'time_spent_seconds' => 3420,
                    'created_at' => now()->subHours(3)->toISOString(),
                    'updated_at' => now()->subHours(2)->toISOString(),
                    'user' => ['id' => 1, 'name' => 'John Smith', 'email' => 'john.smith@example.com'],
                    'answers' => array_map(fn ($i) => ['id' => $i, 'is_correct' => $i <= 17, 'points_earned' => $i <= 17 ? 5 : 0, 'question' => ['id' => $i, 'question_text' => "Question $i", 'points' => 5]], range(1, 20)),
                ],
                [
                    'id' => 2,
                    'exam_session_id' => 1,
                    'user_id' => 2,
                    'status' => 'graded',
                    'started_at' => now()->subHours(4)->toISOString(),
                    'completed_at' => now()->subHours(3)->toISOString(),
                    'submitted_at' => now()->subHours(3)->toISOString(),
                    'attempt_number' => 1,
                    'score' => 92.0,
                    'total_points' => 100,
                    'percentage' => 92.0,
                    'time_spent_seconds' => 2880,
                    'created_at' => now()->subHours(4)->toISOString(),
                    'updated_at' => now()->subHours(3)->toISOString(),
                    'user' => ['id' => 2, 'name' => 'Jane Doe', 'email' => 'jane.doe@example.com'],
                    'answers' => array_map(fn ($i) => ['id' => $i + 20, 'is_correct' => $i <= 18, 'points_earned' => $i <= 18 ? 5 : 0, 'question' => ['id' => $i, 'question_text' => "Question $i", 'points' => 5]], range(1, 20)),
                ],
                [
                    'id' => 3,
                    'exam_session_id' => 1,
                    'user_id' => 3,
                    'status' => 'submitted',
                    'started_at' => now()->subHours(2)->toISOString(),
                    'completed_at' => now()->subHour()->toISOString(),
                    'submitted_at' => now()->subHour()->toISOString(),
                    'attempt_number' => 1,
                    'score' => 68.0,
                    'total_points' => 100,
                    'percentage' => 68.0,
                    'time_spent_seconds' => 4200,
                    'created_at' => now()->subHours(2)->toISOString(),
                    'updated_at' => now()->subHour()->toISOString(),
                    'user' => ['id' => 3, 'name' => 'Bob Wilson', 'email' => 'bob.wilson@example.com'],
                    'answers' => array_map(fn ($i) => ['id' => $i + 40, 'is_correct' => $i <= 14, 'points_earned' => $i <= 14 ? 5 : 0, 'question' => ['id' => $i, 'question_text' => "Question $i", 'points' => 5]], range(1, 20)),
                ],
                [
                    'id' => 4,
                    'exam_session_id' => 1,
                    'user_id' => 4,
                    'status' => 'in_progress',
                    'started_at' => now()->subMinutes(30)->toISOString(),
                    'completed_at' => null,
                    'submitted_at' => null,
                    'attempt_number' => 1,
                    'score' => null,
                    'total_points' => null,
                    'percentage' => null,
                    'time_spent_seconds' => null,
                    'created_at' => now()->subMinutes(30)->toISOString(),
                    'updated_at' => now()->subMinutes(30)->toISOString(),
                    'user' => ['id' => 4, 'name' => 'Alice Johnson', 'email' => 'alice.johnson@example.com'],
                    'answers' => [],
                ],
                [
                    'id' => 5,
                    'exam_session_id' => 1,
                    'user_id' => 5,
                    'status' => 'graded',
                    'started_at' => now()->subHours(5)->toISOString(),
                    'completed_at' => now()->subHours(4)->toISOString(),
                    'submitted_at' => now()->subHours(4)->toISOString(),
                    'attempt_number' => 1,
                    'score' => 45.0,
                    'total_points' => 100,
                    'percentage' => 45.0,
                    'time_spent_seconds' => 3600,
                    'created_at' => now()->subHours(5)->toISOString(),
                    'updated_at' => now()->subHours(4)->toISOString(),
                    'user' => ['id' => 5, 'name' => 'Charlie Brown', 'email' => 'charlie.brown@example.com'],
                    'answers' => array_map(fn ($i) => ['id' => $i + 60, 'is_correct' => $i <= 9, 'points_earned' => $i <= 9 ? 5 : 0, 'question' => ['id' => $i, 'question_text' => "Question $i", 'points' => 5]], range(1, 20)),
                ],
            ],
            'current_page' => 1,
            'last_page' => 1,
            'per_page' => 50,
            'total' => 5,
            'links' => [
                ['url' => null, 'label' => '&laquo; Previous', 'active' => false],
                ['url' => '/exam-sessions-preview/results?page=1', 'label' => '1', 'active' => true],
                ['url' => null, 'label' => 'Next &raquo;', 'active' => false],
            ],
        ],
    ]);
})->name('exam-sessions.results.preview')->middleware(['auth', 'verified']);

// Student Portal Routes
Route::prefix('student')->name('student.')->middleware(['auth', 'verified', 'role:student'])->group(function () {
    Route::get('dashboard', StudentDashboardController::class)
        ->name('dashboard');

    Route::post('join-exam', [StudentExamController::class, 'joinByCode'])
        ->name('join-exam');

    Route::get('exam/{session}/start', [StudentExamController::class, 'showStart'])
        ->name('exam.start');

    Route::post('exam/{session}/begin', [StudentExamController::class, 'startAttempt'])
        ->name('exam.begin');

    Route::get('exam/take/{attempt}', [StudentExamController::class, 'take'])
        ->name('exam.take');

    Route::post('exam/take/{attempt}/save-answer', [StudentExamController::class, 'saveAnswer'])
        ->name('exam.save-answer');

    Route::post('exam/take/{attempt}/submit', [StudentExamController::class, 'submit'])
        ->name('exam.submit');

    Route::get('exam/results/{attempt}', [StudentExamController::class, 'results'])
        ->name('exam.results');

    Route::get('exam-history', [StudentExamController::class, 'history'])
        ->name('exam.history');
});
