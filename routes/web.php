<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DuplicateDetectionController;
use App\Http\Controllers\ExamBuilderController;
use App\Http\Controllers\ExamController;
use App\Http\Controllers\LearningObjectiveController;
use App\Http\Controllers\ModuleController;
use App\Http\Controllers\ProfileController;
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

Route::get('/dashboard', DashboardController::class)
    ->middleware(['auth', 'verified'])->name('dashboard');

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

Route::resource('modules', ModuleController::class)
    ->middleware(['auth', 'verified', 'permission:view modules']);

Route::post('modules/{module}/toggle', [ModuleController::class, 'toggleStatus'])
    ->name('modules.toggle')
    ->middleware(['auth', 'verified', 'permission:edit modules']);

Route::resource('tos-generates', TosGenerateController::class)
    ->middleware(['auth', 'verified', 'permission:view tos']);

// AI Question Generation Route
Route::post('tos-generates/{tos_generate}/generate', [TosGenerateController::class, 'generateQuestions'])
    ->name('tos-generates.generate')
    ->middleware(['auth', 'verified', 'permission:generate questions']);

Route::resource('question-bank', ExamController::class)
    ->parameters(['question-bank' => 'exam'])
    ->middleware(['auth', 'verified', 'permission:view exams']);

Route::post('question-bank/{exam}/approve', [ExamController::class, 'approve'])
    ->name('question-bank.approve')
    ->middleware(['auth', 'verified', 'permission:approve questions']);

Route::delete('question-bank/bulk-destroy', [ExamController::class, 'bulkDestroy'])
    ->name('question-bank.bulk-destroy')
    ->middleware(['auth', 'verified', 'permission:bulk delete questions']);

// Exam Builder Routes
Route::resource('exam-builder', ExamBuilderController::class)
    ->middleware(['auth', 'verified', 'permission:view exams']);

Route::post('exam-builder/{exam}/add-questions', [ExamBuilderController::class, 'addQuestions'])
    ->name('exam-builder.add-questions')
    ->middleware(['auth', 'verified', 'permission:edit exams']);

Route::delete('exam-builder/{exam}/questions/{question}', [ExamBuilderController::class, 'removeQuestion'])
    ->name('exam-builder.remove-question')
    ->middleware(['auth', 'verified', 'permission:edit exams']);

Route::patch('exam-builder/{exam}/reorder-questions', [ExamBuilderController::class, 'reorderQuestions'])
    ->name('exam-builder.reorder-questions')
    ->middleware(['auth', 'verified', 'permission:edit exams']);

Route::patch('exam-builder/{exam}/questions/{question}/points', [ExamBuilderController::class, 'updateQuestionPoints'])
    ->name('exam-builder.update-points')
    ->middleware(['auth', 'verified', 'permission:edit exams']);

Route::post('exam-builder/{exam}/publish', [ExamBuilderController::class, 'publish'])
    ->name('exam-builder.publish')
    ->middleware(['auth', 'verified', 'permission:approve questions']);

Route::post('exam-builder/{exam}/duplicate', [ExamBuilderController::class, 'duplicate'])
    ->name('exam-builder.duplicate')
    ->middleware(['auth', 'verified', 'permission:create exams']);

Route::get('exam-builder/{exam}/export-pdf', [ExamBuilderController::class, 'exportPdf'])
    ->name('exam-builder.export-pdf')
    ->middleware(['auth', 'verified', 'permission:view exams']);

Route::get('exam-builder/{exam}/export-pdf-answers', [ExamBuilderController::class, 'exportPdfWithAnswers'])
    ->name('exam-builder.export-pdf-answers')
    ->middleware(['auth', 'verified', 'permission:view exams']);

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
