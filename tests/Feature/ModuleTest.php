<?php

use App\Models\Module;
use App\Models\User;
use Spatie\Permission\Models\Permission;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\assertDatabaseHas;
use function Pest\Laravel\delete;
use function Pest\Laravel\get;
use function Pest\Laravel\patch;
use function Pest\Laravel\post;

beforeEach(function () {
    $this->user = User::factory()->create();

    // Create permissions if they don't exist
    Permission::firstOrCreate(['name' => 'view modules']);
    Permission::firstOrCreate(['name' => 'create modules']);
    Permission::firstOrCreate(['name' => 'edit modules']);
    Permission::firstOrCreate(['name' => 'delete modules']);

    // Give user all module permissions
    $this->user->givePermissionTo(['view modules', 'create modules', 'edit modules', 'delete modules']);

    actingAs($this->user);
});

it('displays modules index page', function () {
    Module::factory()->count(3)->create();

    get(route('modules.index'))
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->component('modules/index')
            ->has('modules.data', 3)
        );
});

it('displays create module page', function () {
    get(route('modules.create'))
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->component('modules/form')
        );
});

it('creates a new module', function () {
    $data = [
        'code' => 'SCI-101',
        'name' => 'Science 101',
        'description' => 'Introduction to Science',
        'subject_area' => 'Science',
        'grade_level' => 'Grade 8',
        'curriculum_year' => 2024,
        'is_active' => true,
    ];

    post(route('modules.store'), $data)
        ->assertRedirect()
        ->assertSessionHas('success');

    assertDatabaseHas('modules', [
        'code' => 'SCI-101',
        'name' => 'Science 101',
        'created_by' => $this->user->id,
    ]);
});

it('validates required fields when creating module', function () {
    post(route('modules.store'), [])
        ->assertSessionHasErrors(['code', 'name', 'subject_area', 'grade_level', 'curriculum_year']);
});

it('validates unique module code', function () {
    $module = Module::factory()->create(['code' => 'MATH-101']);

    post(route('modules.store'), [
        'code' => 'MATH-101',
        'name' => 'Math 101',
        'subject_area' => 'Mathematics',
        'grade_level' => 'Grade 7',
        'curriculum_year' => 2024,
    ])->assertSessionHasErrors('code');
});

it('displays module detail page', function () {
    $module = Module::factory()->create();

    get(route('modules.show', $module))
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->component('modules/show')
            ->has('module')
        );
});

it('displays edit module page', function () {
    $module = Module::factory()->create();

    get(route('modules.edit', $module))
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->component('modules/form')
            ->has('module')
        );
});

it('updates an existing module', function () {
    $module = Module::factory()->create(['code' => 'OLD-CODE']);

    patch(route('modules.update', $module), [
        'code' => 'NEW-CODE',
        'name' => 'Updated Module',
        'subject_area' => 'Updated Subject',
        'grade_level' => 'Grade 10',
        'curriculum_year' => 2025,
    ])->assertRedirect()
        ->assertSessionHas('success');

    assertDatabaseHas('modules', [
        'id' => $module->id,
        'code' => 'NEW-CODE',
        'name' => 'Updated Module',
    ]);
});

it('deletes a module', function () {
    $module = Module::factory()->create();

    delete(route('modules.destroy', $module))
        ->assertRedirect()
        ->assertSessionHas('success');

    expect($module->fresh()->trashed())->toBeTrue();
});

it('toggles module active status', function () {
    $module = Module::factory()->create(['is_active' => true]);

    post(route('modules.toggle', $module))
        ->assertRedirect()
        ->assertSessionHas('success');

    expect($module->fresh()->is_active)->toBeFalse();
});
