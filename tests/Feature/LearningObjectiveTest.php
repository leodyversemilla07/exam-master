<?php

use App\Models\LearningObjective;
use App\Models\Module;
use App\Models\Topic;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->artisan('db:seed', ['--class' => 'RolePermissionSeeder']);

    $this->user = User::factory()->create();
    $this->user->assignRole('super-admin');
    $this->actingAs($this->user);

    $this->module = Module::factory()->create();
    $this->topic = Topic::create([
        'module_id' => $this->module->id,
        'title' => 'Topic 1',
        'order' => 1,
    ]);
});

test('can view learning objectives index', function () {
    LearningObjective::factory()->count(3)->create([
        'topic_id' => $this->topic->id,
    ]);

    $response = $this->get(route('modules.topics.objectives.index', [$this->module, $this->topic]));

    $response->assertSuccessful();
    $response->assertInertia(fn ($page) => $page
        ->component('learning-objectives/index')
        ->has('objectives', 3)
    );
});

test('can create a learning objective', function () {
    $data = [
        'code' => 'LO-TEST-1',
        'objective' => 'This is a test objective',
        'cognitive_level' => 'applying',
        'order' => 1,
        'is_active' => true,
    ];

    $response = $this->post(route('modules.topics.objectives.store', [$this->module, $this->topic]), $data);

    $response->assertRedirect();
    $this->assertDatabaseHas('learning_objectives', [
        'code' => 'LO-TEST-1',
        'topic_id' => $this->topic->id,
    ]);
});

test('can update a learning objective', function () {
    $objective = LearningObjective::factory()->create([
        'topic_id' => $this->topic->id,
        'objective' => 'Old Objective',
    ]);

    $data = [
        'code' => $objective->code,
        'objective' => 'Updated Objective',
        'cognitive_level' => 'analyzing',
        'order' => 2,
        'is_active' => true,
    ];

    $response = $this->put(route('modules.topics.objectives.update', [$this->module, $this->topic, $objective]), $data);

    $response->assertRedirect();
    $this->assertDatabaseHas('learning_objectives', [
        'id' => $objective->id,
        'objective' => 'Updated Objective',
    ]);
});

test('can delete a learning objective', function () {
    $objective = LearningObjective::factory()->create([
        'topic_id' => $this->topic->id,
    ]);

    $response = $this->delete(route('modules.topics.objectives.destroy', [$this->module, $this->topic, $objective]));

    $response->assertRedirect();
    $this->assertSoftDeleted('learning_objectives', ['id' => $objective->id]);
});

test('can reorder learning objectives', function () {
    $lo1 = LearningObjective::factory()->create(['topic_id' => $this->topic->id, 'order' => 1]);
    $lo2 = LearningObjective::factory()->create(['topic_id' => $this->topic->id, 'order' => 2]);

    $data = [
        'objectives' => [
            ['id' => $lo1->id, 'order' => 2],
            ['id' => $lo2->id, 'order' => 1],
        ],
    ];

    $response = $this->patch(route('modules.topics.objectives.reorder', [$this->module, $this->topic]), $data);

    $response->assertRedirect();
    $this->assertEquals(2, $lo1->fresh()->order);
    $this->assertEquals(1, $lo2->fresh()->order);
});
