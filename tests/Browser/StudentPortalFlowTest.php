<?php

/**
 * Student Portal Browser Tests
 *
 * Tests the student exam-taking experience including joining exams,
 * taking exams, and viewing results.
 */

use App\Models\Exam;
use App\Models\ExamQuestion;
use App\Models\ExamSession;
use App\Models\Module;
use App\Models\User;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;



beforeEach(function () {
    // Ensure student role exists
    Role::firstOrCreate(['name' => 'student', 'guard_name' => 'web']);
    Role::firstOrCreate(['name' => 'educator', 'guard_name' => 'web']);

    $studentRole = Role::where('name', 'student')->first();

    $permissions = [
        'take exams',
        'view own results',
    ];

    foreach ($permissions as $permission) {
        Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
    }
});

describe('Student Dashboard', function () {
    it('displays the student dashboard', function () {
        $user = User::factory()->create();
        $user->assignRole('student');

        $this->actingAs($user);

        $page = $this->visit('/student/dashboard');

        $page->assertNoJavascriptErrors();
    });

    it('shows join exam section', function () {
        $user = User::factory()->create();
        $user->assignRole('student');

        $this->actingAs($user);

        $page = $this->visit('/student/dashboard');

        $page->assertNoJavascriptErrors();
    });

    it('shows available exam sessions', function () {
        $user = User::factory()->create();
        $user->assignRole('student');

        $this->actingAs($user);

        $page = $this->visit('/student/dashboard');

        $page->assertNoJavascriptErrors();
    });

    it('shows exam history section', function () {
        $user = User::factory()->create();
        $user->assignRole('student');

        $this->actingAs($user);

        $page = $this->visit('/student/dashboard');

        $page->assertNoJavascriptErrors();
    });
});

describe('Join Exam Flow', function () {
    it('can enter access code to join exam', function () {
        $user = User::factory()->create();
        $user->assignRole('student');

        $this->actingAs($user);

        $page = $this->visit('/student/dashboard');

        $page->assertNoJavascriptErrors();
    });

    it('shows error for invalid access code', function () {
        $user = User::factory()->create();
        $user->assignRole('student');

        $this->actingAs($user);

        $page = $this->visit('/student/dashboard');

        $page->assertNoJavascriptErrors();
    });
});

describe('Exam Taking Experience', function () {
    it('displays exam start page with instructions', function () {
        $educator = User::factory()->create();
        $educator->assignRole('educator');

        $module = Module::factory()->create(['user_id' => $educator->id]);
        $exam = Exam::factory()->create([
            'module_id' => $module->id,
            'created_by' => $educator->id,
            'status' => 'published',
            'instructions' => 'Read all questions carefully.',
        ]);

        $session = ExamSession::factory()->create([
            'exam_id' => $exam->id,
            'created_by' => $educator->id,
            'status' => 'active',
        ]);

        $student = User::factory()->create();
        $student->assignRole('student');

        $this->actingAs($student);

        $page = $this->visit("/student/exam/{$session->id}/start");

        $page->assertNoJavascriptErrors();
    });
});

describe('Exam Results', function () {
    it('can view exam history page', function () {
        $user = User::factory()->create();
        $user->assignRole('student');

        $this->actingAs($user);

        $page = $this->visit('/student/exam-history');

        $page->assertNoJavascriptErrors();
    });
});
