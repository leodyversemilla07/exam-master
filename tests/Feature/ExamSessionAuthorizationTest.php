<?php

use App\Models\Exam;
use App\Models\ExamSession;
use App\Models\Module;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
});

it('allows admins to list all educator exam sessions', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $educator = User::factory()->create();
    $educator->assignRole('educator');

    $otherEducator = User::factory()->create();
    $otherEducator->assignRole('educator');

    ExamSession::factory()->create(['created_by' => $educator->id]);
    ExamSession::factory()->create(['created_by' => $otherEducator->id]);

    $this->actingAs($admin)
        ->get(route('exam-sessions.index'))
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->component('exam-sessions/index')
            ->has('sessions.data', 2)
        );
});

it('keeps educators scoped to their own exam sessions', function () {
    $educator = User::factory()->create();
    $educator->assignRole('educator');

    $otherEducator = User::factory()->create();
    $otherEducator->assignRole('educator');

    ExamSession::factory()->create(['created_by' => $educator->id]);
    ExamSession::factory()->create(['created_by' => $otherEducator->id]);

    $this->actingAs($educator)
        ->get(route('exam-sessions.index'))
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->component('exam-sessions/index')
            ->has('sessions.data', 1)
            ->where('sessions.data.0.created_by', $educator->id)
        );
});

it('requires create permission to store exam sessions', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('view exam sessions');

    $module = Module::factory()->create(['created_by' => $user->id]);
    $exam = Exam::factory()->published()->create([
        'module_id' => $module->id,
        'created_by' => $user->id,
    ]);

    $this->actingAs($user)
        ->post(route('exam-sessions.store'), [
            'exam_id' => $exam->id,
            'title' => 'Unauthorized Session',
            'start_time' => now()->addHour()->format('Y-m-d\TH:i'),
            'end_time' => now()->addHours(2)->format('Y-m-d\TH:i'),
            'max_attempts' => 1,
        ])
        ->assertForbidden();
});

it('requires edit permission to edit and update exam sessions', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('view exam sessions');

    $session = ExamSession::factory()->create(['created_by' => $user->id]);

    $this->actingAs($user)
        ->get(route('exam-sessions.edit', $session))
        ->assertForbidden();

    $this->actingAs($user)
        ->patch(route('exam-sessions.update', $session), [
            'title' => 'Unauthorized Update',
            'start_time' => now()->addHour()->format('Y-m-d\TH:i'),
            'end_time' => now()->addHours(2)->format('Y-m-d\TH:i'),
            'max_attempts' => 1,
            'status' => 'active',
        ])
        ->assertForbidden();
});

it('requires delete permission to destroy exam sessions', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('view exam sessions');

    $session = ExamSession::factory()->create(['created_by' => $user->id]);

    $this->actingAs($user)
        ->delete(route('exam-sessions.destroy', $session))
        ->assertForbidden();
});

it('allows admins to edit sessions using any published exam', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $educator = User::factory()->create();
    $educator->assignRole('educator');

    $adminModule = Module::factory()->create(['created_by' => $admin->id]);
    $educatorModule = Module::factory()->create(['created_by' => $educator->id]);

    $adminExam = Exam::factory()->published()->create([
        'module_id' => $adminModule->id,
        'created_by' => $admin->id,
    ]);
    $educatorExam = Exam::factory()->published()->create([
        'module_id' => $educatorModule->id,
        'created_by' => $educator->id,
    ]);

    $session = ExamSession::factory()->create([
        'exam_id' => $educatorExam->id,
        'created_by' => $educator->id,
    ]);

    $this->actingAs($admin)
        ->get(route('exam-sessions.edit', $session))
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->component('exam-sessions/edit')
            ->has('exams', 2)
        );
});
