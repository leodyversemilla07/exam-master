<?php

use App\Http\Controllers\ExamManagementController;
use App\Http\Controllers\ModManagementController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\SystemLogsController;
use App\Http\Controllers\TosGenerateController;
use App\Http\Controllers\UserManagementController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

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

Route::resource('usermanagements', UserManagementController::class)
    ->only(['index', 'store', 'update', 'destroy'])
    ->middleware(['auth', 'verified']);

Route::resource('modmanagements', ModManagementController::class)
    ->only(['index', 'store'])
    ->middleware(['auth', 'verified']);
Route::resource('tosgenerates', TosGenerateController::class)
    ->only(['index', 'store'])
    ->middleware(['auth', 'verified']);
Route::resource('exammanagements', ExamManagementController::class)
    ->only(['index', 'store'])
    ->middleware(['auth', 'verified']);
Route::resource('systemlogss', SystemLogsController::class)
    ->only(['index', 'store'])
    ->middleware(['auth', 'verified']);
Route::resource('settingss', SettingsController::class)
    ->only(['index', 'store'])
    ->middleware(['auth', 'verified']);

