<?php

use App\Models\Module;
use App\Models\TosGenerate;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->artisan('db:seed', ['--class' => 'RolePermissionSeeder']);

    $this->user = User::factory()->create();
    $this->user->assignRole('super-admin');

    $this->module = Module::factory()->create();
    $this->actingAs($this->user);
});

test('can view TOS index', function () {
    TosGenerate::factory()->count(3)->create([
        'module_id' => $this->module->id,
        'created_by' => $this->user->id,
    ]);

    $response = $this->get(route('tos-generates.index'));

    $response->assertSuccessful();
    $response->assertInertia(fn ($page) => $page
        ->component('tos-generates/index')
        ->has('tosGenerates.data', 3)
    );
});

test('can create a TOS', function () {
    $data = [
        'module_id' => $this->module->id,
        'grade_level' => 'Grade 10',
        'subject' => 'Mathematics',
        'quarter' => '1st Quarter',
        'total_items' => 10,
        'learning_objectives' => [
            ['code' => 'LO1', 'topic' => 'Topic 1', 'description' => 'First Objective'],
            ['code' => 'LO2', 'topic' => 'Topic 2', 'description' => 'Second Objective'],
        ],
        'cognitive_levels' => [
            'remember' => 5,
            'understand' => 5,
            'apply' => 0,
            'analyze' => 0,
            'evaluate' => 0,
            'create' => 0,
        ],
        'question_types' => [
            'multiple_choice' => 10,
            'true_false' => 0,
            'essay' => 0,
            'identification' => 0,
        ],
        'difficulty_level' => 'mixed',
        'language' => 'english',
    ];

    $response = $this->post(route('tos-generates.store'), $data);

    $response->assertRedirect();
    $this->assertDatabaseHas('tos_generates', [
        'subject' => 'Mathematics',
        'module_id' => $this->module->id,
    ]);
});

test('can update a TOS', function () {
    $tos = TosGenerate::factory()->create([
        'module_id' => $this->module->id,
        'created_by' => $this->user->id,
        'subject' => 'Old Subject',
    ]);

    $data = [
        'module_id' => $this->module->id,
        'grade_level' => $tos->grade_level,
        'subject' => 'Updated Subject',
        'total_items' => $tos->total_items,
        'learning_objectives' => $tos->learning_objectives,
        'cognitive_levels' => $tos->cognitive_levels,
        'question_types' => $tos->question_types,
        'difficulty_level' => $tos->difficulty_level,
    ];

    $response = $this->put(route('tos-generates.update', $tos), $data);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect();
    $this->assertDatabaseHas('tos_generates', [
        'id' => $tos->id,
        'subject' => 'Updated Subject',
    ]);
});

test('can delete a TOS', function () {
    $tos = TosGenerate::factory()->create([
        'module_id' => $this->module->id,
        'created_by' => $this->user->id,
    ]);

    $response = $this->delete(route('tos-generates.destroy', $tos));

    $response->assertRedirect();
    $this->assertDatabaseMissing('tos_generates', [
        'id' => $tos->id,
    ]);
});

test('can duplicate a TOS', function () {
    $tos = TosGenerate::factory()->create([
        'module_id' => $this->module->id,
        'created_by' => $this->user->id,
        'subject' => 'Original TOS',
    ]);

    $response = $this->post(route('tos-generates.duplicate', $tos));

    $response->assertRedirect();
    $this->assertDatabaseHas('tos_generates', [
        'subject' => 'Original TOS (Copy)',
    ]);
});

test('can view TOS matrix', function () {
    $tos = TosGenerate::factory()->create([
        'module_id' => $this->module->id,
    ]);

    $response = $this->get(route('tos-generates.matrix', $tos));

    $response->assertSuccessful();
    $response->assertJsonStructure(['matrix']);
});

test('can view TOS distribution', function () {
    $tos = TosGenerate::factory()->create([
        'module_id' => $this->module->id,
    ]);

    $response = $this->get(route('tos-generates.distribution', $tos));

    $response->assertSuccessful();
    $response->assertJsonStructure(['cognitive', 'topics', 'difficulty']);
});
