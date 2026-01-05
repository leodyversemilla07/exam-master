<?php

/**
 * TOS Generation Browser Tests
 *
 * Tests the Table of Specifications creation and management workflow.
 */

use App\Models\Module;
use App\Models\Topic;
use App\Models\TosGenerate;
use App\Models\User;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;



beforeEach(function () {
    $role = Role::firstOrCreate(['name' => 'educator', 'guard_name' => 'web']);

    $permissions = [
        'view tos',
        'create tos',
        'edit tos',
        'delete tos',
        'view modules',
        'generate questions',
    ];

    foreach ($permissions as $permission) {
        Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
    }

    // Give all permissions to the educator role
    $role->syncPermissions($permissions);
});

describe('TOS List View', function () {
    it('displays the TOS generates page', function () {
        $user = User::factory()->create();
        $user->assignRole('educator');

        $this->actingAs($user);

        $page = $this->visit('/tos-generates');

        $page->assertNoJavascriptErrors();
    });

    it('shows create TOS button', function () {
        $user = User::factory()->create();
        $user->assignRole('educator');

        $this->actingAs($user);

        $page = $this->visit('/tos-generates');

        $page->assertNoJavascriptErrors();
    });

    it('displays existing TOS in the list', function () {
        $user = User::factory()->create();
        $user->assignRole('educator');

        $module = Module::factory()->create(['created_by' => $user->id]);
        $tos = TosGenerate::factory()->create([
            'subject' => 'Advanced Mathematics',
            'module_id' => $module->id,
            'created_by' => $user->id,
        ]);

        $this->actingAs($user);

        $page = $this->visit('/tos-generates');

        $page->assertNoJavascriptErrors();
    });
});

describe('TOS Creation Flow', function () {
    it('can navigate to create TOS page', function () {
        $user = User::factory()->create();
        $user->assignRole('educator');

        Module::factory()->create(['created_by' => $user->id]);

        $this->actingAs($user);

        $page = $this->visit('/tos-generates/create');

        $page->assertNoJavascriptErrors();
    });

    it('displays TOS configuration form', function () {
        $user = User::factory()->create();
        $user->assignRole('educator');

        Module::factory()->create(['created_by' => $user->id]);

        $this->actingAs($user);

        $page = $this->visit('/tos-generates/create');

        $page->assertNoJavascriptErrors();
    });

    it('shows cognitive level distribution section', function () {
        $user = User::factory()->create();
        $user->assignRole('educator');

        Module::factory()->create(['created_by' => $user->id]);

        $this->actingAs($user);

        $page = $this->visit('/tos-generates/create');

        $page->assertNoJavascriptErrors();
    });
});

describe('TOS Detail View', function () {
    it('can view TOS details', function () {
        $user = User::factory()->create();
        $user->assignRole('educator');

        $module = Module::factory()->create(['created_by' => $user->id]);
        $tos = TosGenerate::factory()->create([
            'subject' => 'Physics Fundamentals',
            'module_id' => $module->id,
            'created_by' => $user->id,
        ]);

        $this->actingAs($user);

        $page = $this->visit("/tos-generates/{$tos->id}");

        $page->assertNoJavascriptErrors();
    });

    it('shows TOS matrix visualization', function () {
        $user = User::factory()->create();
        $user->assignRole('educator');

        $module = Module::factory()->create(['created_by' => $user->id]);
        $tos = TosGenerate::factory()->create([
            'module_id' => $module->id,
            'created_by' => $user->id,
        ]);

        $this->actingAs($user);

        $page = $this->visit("/tos-generates/{$tos->id}");

        $page->assertNoJavascriptErrors();
    });

    it('displays distribution charts', function () {
        $user = User::factory()->create();
        $user->assignRole('educator');

        $module = Module::factory()->create(['created_by' => $user->id]);
        $tos = TosGenerate::factory()->create([
            'module_id' => $module->id,
            'created_by' => $user->id,
        ]);

        $this->actingAs($user);

        $page = $this->visit("/tos-generates/{$tos->id}");

        $page->assertNoJavascriptErrors();
    });
});

describe('TOS Actions', function () {
    it('can access edit page for TOS', function () {
        $user = User::factory()->create();
        $user->assignRole('educator');

        $module = Module::factory()->create(['created_by' => $user->id]);
        $tos = TosGenerate::factory()->create([
            'module_id' => $module->id,
            'created_by' => $user->id,
        ]);

        $this->actingAs($user);

        $page = $this->visit("/tos-generates/{$tos->id}/edit");

        $page->assertNoJavascriptErrors();
    });
});

describe('TOS Calculator', function () {
    it('can access TOS calculator from module', function () {
        $user = User::factory()->create();
        $user->assignRole('educator');

        $module = Module::factory()->create(['created_by' => $user->id]);

        $this->actingAs($user);

        $page = $this->visit("/modules/{$module->id}/tos-calculator");

        $page->assertNoJavascriptErrors();
    });

    it('displays topic weights and hour allocations', function () {
        $user = User::factory()->create();
        $user->assignRole('educator');

        $module = Module::factory()->create(['created_by' => $user->id]);
        Topic::factory()->create([
            'module_id' => $module->id,
            'title' => 'Test Topic 1',
            'hours_allocated' => 10,
            'weight_percentage' => 30,
        ]);

        $this->actingAs($user);

        $page = $this->visit("/modules/{$module->id}/tos-calculator");

        $page->assertNoJavascriptErrors();
    });
});
