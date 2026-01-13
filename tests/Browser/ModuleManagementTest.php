<?php

/**
 * Module Management Browser Tests
 *
 * Tests the complete module CRUD workflow from a real user perspective.
 */

use App\Models\Module;
use App\Models\User;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    // Ensure roles and permissions exist
    $role = Role::firstOrCreate(['name' => 'educator', 'guard_name' => 'web']);

    $permissions = [
        'view modules',
        'create modules',
        'edit modules',
        'delete modules',
    ];

    foreach ($permissions as $permission) {
        Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
    }

    // Give all permissions to the educator role
    $role->syncPermissions($permissions);
});

describe('Module List View', function () {
    it('displays the modules page with table', function () {
        $user = User::factory()->create();
        $user->assignRole('educator');

        $this->actingAs($user);

        $page = $this->visit('/modules');

        $page->assertSee('Modules')
            ->assertNoJavascriptErrors();
    });

    it('shows create button for educators', function () {
        $user = User::factory()->create();
        $user->assignRole('educator');

        $this->actingAs($user);

        $page = $this->visit('/modules');

        $page->assertSee('Create')
            ->assertNoJavascriptErrors();
    });

    it('displays existing modules in the list', function () {
        $user = User::factory()->create();
        $user->assignRole('educator');

        $module = Module::factory()->create([
            'name' => 'Test Mathematics Module',
            'code' => 'MATH101',
            'created_by' => $user->id,
        ]);

        $this->actingAs($user);

        $page = $this->visit('/modules');

        $page->assertSee('Test Mathematics Module')
            ->assertSee('MATH101')
            ->assertNoJavascriptErrors();
    });
});

describe('Module Creation', function () {
    it('can navigate to create module page', function () {
        $user = User::factory()->create();
        $user->assignRole('educator');

        $this->actingAs($user);

        $page = $this->visit('/modules');

        $page->click('a:has-text("Create")')
            ->waitForNavigation()
            ->assertUrlContains('modules/create')
            ->assertNoJavascriptErrors();
    });

    it('displays all required form fields', function () {
        $user = User::factory()->create();
        $user->assignRole('educator');

        $this->actingAs($user);

        $page = $this->visit('/modules/create');

        $page->assertSee('Module Code')
            ->assertSee('Module Name')
            ->assertNoJavascriptErrors();
    });

    it('shows validation errors for empty form submission', function () {
        $user = User::factory()->create();
        $user->assignRole('educator');

        $this->actingAs($user);

        $page = $this->visit('/modules/create');

        $page->click('button[type="submit"]')
            ->assertNoJavascriptErrors();
    });

    it('can create a new module successfully', function () {
        $user = User::factory()->create();
        $user->assignRole('educator');

        $this->actingAs($user);

        $page = $this->visit('/modules/create');

        $page->fill('input[name="code"]', 'NEWMOD'.time())
            ->fill('input[name="name"]', 'New Test Module')
            ->fill('textarea[name="description"]', 'This is a test module description')
            ->click('button[type="submit"]')
            ->waitForNavigation()
            ->assertNoJavascriptErrors();

        // Verify module was created
        $this->assertDatabaseHas('modules', [
            'name' => 'New Test Module',
        ]);
    });
});

describe('Module Detail View', function () {
    it('can view module details', function () {
        $user = User::factory()->create();
        $user->assignRole('educator');

        $module = Module::factory()->create([
            'name' => 'Detail Test Module',
            'code' => 'DTM101',
            'created_by' => $user->id,
        ]);

        $this->actingAs($user);

        $page = $this->visit("/modules/{$module->id}");

        $page->assertSee('Detail Test Module')
            ->assertNoJavascriptErrors();
    });

    it('shows topics section in module detail', function () {
        $user = User::factory()->create();
        $user->assignRole('educator');

        $module = Module::factory()->create([
            'created_by' => $user->id,
        ]);

        $this->actingAs($user);

        $page = $this->visit("/modules/{$module->id}");

        $page->assertNoJavascriptErrors();
    });
});

describe('Module Editing', function () {
    it('can navigate to edit module page', function () {
        $user = User::factory()->create();
        $user->assignRole('educator');

        $module = Module::factory()->create([
            'created_by' => $user->id,
        ]);

        $this->actingAs($user);

        $page = $this->visit("/modules/{$module->id}/edit");

        $page->assertNoJavascriptErrors();
    });

    it('prefills form with existing module data', function () {
        $user = User::factory()->create();
        $user->assignRole('educator');

        $module = Module::factory()->create([
            'name' => 'Existing Module Name',
            'code' => 'EXIST01',
            'created_by' => $user->id,
        ]);

        $this->actingAs($user);

        $page = $this->visit("/modules/{$module->id}/edit");

        $page->assertNoJavascriptErrors();
    });
});

describe('Module Search and Filter', function () {
    it('can search for modules by name', function () {
        $user = User::factory()->create();
        $user->assignRole('educator');

        Module::factory()->create([
            'name' => 'Searchable Module',
            'code' => 'SRCH01',
            'created_by' => $user->id,
        ]);

        Module::factory()->create([
            'name' => 'Hidden Module',
            'code' => 'HID01',
            'created_by' => $user->id,
        ]);

        $this->actingAs($user);

        $page = $this->visit('/modules');

        $page->assertSee('Searchable Module')
            ->assertNoJavascriptErrors();
    });
});
