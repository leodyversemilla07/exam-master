<?php

use App\Models\Module;
use App\Models\Topic;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    // Seed roles and permissions
    $this->artisan('db:seed', ['--class' => 'RolePermissionSeeder']);

    $this->admin = User::factory()->create();
    $this->admin->assignRole('admin');

    $this->module = Module::factory()->create([
        'created_by' => $this->admin->id,
    ]);
});

test('authenticated user can view topics list', function () {
    $topics = Topic::factory(3)->create([
        'module_id' => $this->module->id,
    ]);

    $response = $this->actingAs($this->admin)
        ->get(route('modules.topics.index', $this->module));

    $response->assertSuccessful();
    $response->assertInertia(fn ($page) => $page
        ->component('topics/index')
        ->has('topics', 3)
    );
});

test('authenticated user can create a topic', function () {
    $topicData = [
        'code' => 'TOPIC-001',
        'title' => 'Introduction to Testing',
        'description' => 'Basic testing concepts',
        'hours_allocated' => 10,
        'weight_percentage' => 20,
        'is_active' => true,
    ];

    $response = $this->actingAs($this->admin)
        ->post(route('modules.topics.store', $this->module), $topicData);

    $response->assertRedirect(route('modules.topics.index', $this->module));

    $this->assertDatabaseHas('topics', [
        'module_id' => $this->module->id,
        'code' => 'TOPIC-001',
        'title' => 'Introduction to Testing',
    ]);
});

test('authenticated user can create a child topic', function () {
    $parentTopic = Topic::factory()->create([
        'module_id' => $this->module->id,
    ]);

    $childTopicData = [
        'code' => 'TOPIC-001-A',
        'title' => 'Subtopic',
        'parent_id' => $parentTopic->id,
        'is_active' => true,
    ];

    $response = $this->actingAs($this->admin)
        ->post(route('modules.topics.store', $this->module), $childTopicData);

    $response->assertRedirect();

    $this->assertDatabaseHas('topics', [
        'module_id' => $this->module->id,
        'parent_id' => $parentTopic->id,
        'code' => 'TOPIC-001-A',
    ]);
});

test('authenticated user can update a topic', function () {
    $topic = Topic::factory()->create([
        'module_id' => $this->module->id,
        'title' => 'Original Title',
    ]);

    $updateData = [
        'code' => $topic->code,
        'title' => 'Updated Title',
        'description' => 'Updated description',
        'is_active' => true,
    ];

    $response = $this->actingAs($this->admin)
        ->put(route('modules.topics.update', [$this->module, $topic]), $updateData);

    $response->assertRedirect();

    $this->assertDatabaseHas('topics', [
        'id' => $topic->id,
        'title' => 'Updated Title',
    ]);
});

test('authenticated user can delete a topic', function () {
    $topic = Topic::factory()->create([
        'module_id' => $this->module->id,
    ]);

    $response = $this->actingAs($this->admin)
        ->delete(route('modules.topics.destroy', [$this->module, $topic]));

    $response->assertRedirect();

    $this->assertSoftDeleted('topics', [
        'id' => $topic->id,
    ]);
});

test('authenticated user can reorder topics', function () {
    $topic1 = Topic::factory()->create([
        'module_id' => $this->module->id,
        'order' => 1,
    ]);

    $topic2 = Topic::factory()->create([
        'module_id' => $this->module->id,
        'order' => 2,
    ]);

    $reorderData = [
        'topics' => [
            ['id' => $topic1->id, 'order' => 2],
            ['id' => $topic2->id, 'order' => 1],
        ],
    ];

    $response = $this->actingAs($this->admin)
        ->patch(route('modules.topics.reorder', $this->module), $reorderData);

    $response->assertRedirect();
    $response->assertSessionHas('success');

    $this->assertDatabaseHas('topics', [
        'id' => $topic1->id,
        'order' => 2,
    ]);

    $this->assertDatabaseHas('topics', [
        'id' => $topic2->id,
        'order' => 1,
    ]);
});

test('topic scope filters active topics', function () {
    Topic::factory()->create([
        'module_id' => $this->module->id,
        'is_active' => true,
    ]);

    Topic::factory()->create([
        'module_id' => $this->module->id,
        'is_active' => false,
    ]);

    $activeTopics = Topic::active()->get();

    expect($activeTopics)->toHaveCount(1);
});

test('topic scope filters root topics', function () {
    $rootTopic = Topic::factory()->create([
        'module_id' => $this->module->id,
        'parent_id' => null,
    ]);

    Topic::factory()->create([
        'module_id' => $this->module->id,
        'parent_id' => $rootTopic->id,
    ]);

    $rootTopics = Topic::root()->get();

    expect($rootTopics)->toHaveCount(1);
    expect($rootTopics->first()->id)->toBe($rootTopic->id);
});
