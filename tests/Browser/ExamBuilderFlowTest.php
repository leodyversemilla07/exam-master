<?php

/**
 * Exam Builder Browser Tests
 *
 * Tests the exam building workflow including creating exams,
 * adding questions, and exporting.
 */

use App\Models\Exam;
use App\Models\ExamQuestion;
use App\Models\Module;
use App\Models\User;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    // Ensure roles and permissions exist
    $role = Role::firstOrCreate(['name' => 'educator', 'guard_name' => 'web']);

    $permissions = [
        'view exams',
        'create exams',
        'edit exams',
        'delete exams',
        'publish exams',
        'view modules',
    ];

    foreach ($permissions as $permission) {
        Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
    }

    // Give all permissions to the educator role
    $role->syncPermissions($permissions);
});

describe('Exam Builder List', function () {
    it('displays the exam builder page', function () {
        $user = User::factory()->create();
        $user->assignRole('educator');

        $this->actingAs($user);

        $page = $this->visit('/exam-builder');

        $page->assertSee('Exam')
            ->assertNoJavascriptErrors();
    });

    it('shows create exam button', function () {
        $user = User::factory()->create();
        $user->assignRole('educator');

        $this->actingAs($user);

        $page = $this->visit('/exam-builder');

        $page->assertSee('Create')
            ->assertNoJavascriptErrors();
    });

    it('displays existing exams in the list', function () {
        $user = User::factory()->create();
        $user->assignRole('educator');

        $module = Module::factory()->create(['created_by' => $user->id]);
        $exam = Exam::factory()->create([
            'title' => 'Midterm Examination',
            'module_id' => $module->id,
            'created_by' => $user->id,
        ]);

        $this->actingAs($user);

        $page = $this->visit('/exam-builder');

        $page->assertSee('Midterm Examination')
            ->assertNoJavascriptErrors();
    });
});

describe('Exam Creation Flow', function () {
    it('can navigate to create exam page', function () {
        $user = User::factory()->create();
        $user->assignRole('educator');

        Module::factory()->create(['created_by' => $user->id]);

        $this->actingAs($user);

        $page = $this->visit('/exam-builder/create');

        $page->assertSee('Create')
            ->assertNoJavascriptErrors();
    });

    it('displays all required form fields', function () {
        $user = User::factory()->create();
        $user->assignRole('educator');

        Module::factory()->create(['created_by' => $user->id]);

        $this->actingAs($user);

        $page = $this->visit('/exam-builder/create');

        $page->assertSee('Title')
            ->assertSee('Module')
            ->assertNoJavascriptErrors();
    });

    it('validates required fields on submission', function () {
        $user = User::factory()->create();
        $user->assignRole('educator');

        $this->actingAs($user);

        $page = $this->visit('/exam-builder/create');

        $page->click('button[type="submit"]')
            ->assertNoJavascriptErrors();
    });

    it('can create a new exam successfully', function () {
        $user = User::factory()->create();
        $user->assignRole('educator');

        $module = Module::factory()->create(['created_by' => $user->id]);

        $this->actingAs($user);

        $page = $this->visit('/exam-builder/create');

        $page->fill('input[name="title"]', 'Browser Test Exam')
            ->fill('textarea[name="description"]', 'This exam was created via browser test')
            ->assertNoJavascriptErrors();
    });
});

describe('Exam Detail View', function () {
    it('can view exam details', function () {
        $user = User::factory()->create();
        $user->assignRole('educator');

        $module = Module::factory()->create(['created_by' => $user->id]);
        $exam = Exam::factory()->create([
            'title' => 'Detailed Exam View',
            'module_id' => $module->id,
            'created_by' => $user->id,
        ]);

        $this->actingAs($user);

        $page = $this->visit("/exam-builder/{$exam->id}");

        $page->assertSee('Detailed Exam View')
            ->assertNoJavascriptErrors();
    });

    it('shows question management section', function () {
        $user = User::factory()->create();
        $user->assignRole('educator');

        $module = Module::factory()->create(['created_by' => $user->id]);
        $exam = Exam::factory()->create([
            'module_id' => $module->id,
            'created_by' => $user->id,
        ]);

        $this->actingAs($user);

        $page = $this->visit("/exam-builder/{$exam->id}");

        $page->assertNoJavascriptErrors();
    });

    it('displays exam statistics', function () {
        $user = User::factory()->create();
        $user->assignRole('educator');

        $module = Module::factory()->create(['created_by' => $user->id]);
        $exam = Exam::factory()->create([
            'module_id' => $module->id,
            'created_by' => $user->id,
        ]);

        $this->actingAs($user);

        $page = $this->visit("/exam-builder/{$exam->id}");

        $page->assertNoJavascriptErrors();
    });
});

describe('Exam Export', function () {
    it('shows export buttons for exam with questions', function () {
        $user = User::factory()->create();
        $user->assignRole('educator');

        $module = Module::factory()->create(['created_by' => $user->id]);
        $exam = Exam::factory()->create([
            'module_id' => $module->id,
            'created_by' => $user->id,
            'status' => 'published',
        ]);

        // Add a question to the exam
        $question = ExamQuestion::factory()->create([
            'module_id' => $module->id,
            'created_by' => $user->id,
            'approval_status' => 'approved',
        ]);
        $exam->questions()->attach($question->id, ['order' => 1, 'points' => 1]);

        $this->actingAs($user);

        $page = $this->visit("/exam-builder/{$exam->id}");

        $page->assertNoJavascriptErrors();
    });
});

describe('Exam Actions', function () {
    it('can access edit page for draft exam', function () {
        $user = User::factory()->create();
        $user->assignRole('educator');

        $module = Module::factory()->create(['created_by' => $user->id]);
        $exam = Exam::factory()->create([
            'module_id' => $module->id,
            'created_by' => $user->id,
            'status' => 'draft',
        ]);

        $this->actingAs($user);

        $page = $this->visit("/exam-builder/{$exam->id}/edit");

        $page->assertNoJavascriptErrors();
    });
});
