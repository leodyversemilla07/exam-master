<?php

use App\Models\Exam;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    Role::create(['name' => 'educator']);
    Permission::create(['name' => 'manage collaborators']);
    Permission::create(['name' => 'view exams']);
    $role = Role::findByName('educator');
    $role->givePermissionTo('view exams');
});

test('exam owner can view collaborators page', function () {
    $exam = Exam::factory()->create();
    $owner = User::factory()->create()->assignRole('educator');
    $exam->update(['created_by' => $owner->id]);

    $response = $this->actingAs($owner)
        ->get(route('exam-builder.collaborators', $exam));

    $response->assertInertia(fn (Assert $page) => $page
        ->component('exam-collaborators/index')
        ->has('exam')
    );
});

test('non-owner cannot view collaborators page', function () {
    $exam = Exam::factory()->create();
    $user = User::factory()->create()->assignRole('educator');

    $this->actingAs($user)
        ->get(route('exam-builder.collaborators', $exam))
        ->assertStatus(403);
});

test('owner can add collaborator', function () {
    $exam = Exam::factory()->create();
    $owner = User::factory()->create()->assignRole('educator');
    $collaborator = User::factory()->create()->assignRole('educator');
    $exam->update(['created_by' => $owner->id]);

    $this->actingAs($owner)
        ->post(route('exam-builder.collaborators.store', $exam), [
            'user_id' => $collaborator->id,
            'role' => 'editor',
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    $this->assertDatabaseHas('exam_collaborators', [
        'exam_id' => $exam->id,
        'user_id' => $collaborator->id,
        'role' => 'editor',
    ]);
});

test('cannot add owner as collaborator', function () {
    $exam = Exam::factory()->create();
    $owner = User::factory()->create()->assignRole('educator');
    $owner->givePermissionTo('manage collaborators');
    $exam->update(['created_by' => $owner->id]);

    $this->actingAs($owner)
        ->post(route('exam-builder.collaborators.store', $exam), [
            'user_id' => $owner->id,
            'role' => 'editor',
        ])
        ->assertSessionHasErrors('user_id');

    $this->assertDatabaseMissing('exam_collaborators', [
        'exam_id' => $exam->id,
        'user_id' => $owner->id,
    ]);
});

test('cannot add duplicate collaborator', function () {
    $exam = Exam::factory()->create();
    $owner = User::factory()->create()->assignRole('educator');
    $collaborator = User::factory()->create()->assignRole('educator');
    $owner->givePermissionTo('manage collaborators');
    $exam->update(['created_by' => $owner->id]);

    $this->actingAs($owner)
        ->post(route('exam-builder.collaborators.store', $exam), [
            'user_id' => $collaborator->id,
            'role' => 'editor',
        ]);

    $this->actingAs($owner)
        ->post(route('exam-builder.collaborators.store', $exam), [
            'user_id' => $collaborator->id,
            'role' => 'viewer',
        ])
        ->assertSessionHas('error');
});

test('owner can update collaborator role', function () {
    $exam = Exam::factory()->create();
    $owner = User::factory()->create()->assignRole('educator');
    $collaborator = User::factory()->create()->assignRole('educator');
    $owner->givePermissionTo('manage collaborators');
    $exam->update(['created_by' => $owner->id]);
    $exam->collaborators()->attach($collaborator->id, ['role' => 'editor']);

    $this->actingAs($owner)
        ->patch(route('exam-builder.collaborators.update', [$exam, $collaborator]), [
            'role' => 'viewer',
            'can_delete' => true,
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    $this->assertDatabaseHas('exam_collaborators', [
        'exam_id' => $exam->id,
        'user_id' => $collaborator->id,
        'role' => 'viewer',
        'can_delete' => true,
    ]);
});

test('non-owner cannot update collaborator', function () {
    $exam = Exam::factory()->create();
    $owner = User::factory()->create()->assignRole('educator');
    $collaborator = User::factory()->create()->assignRole('educator');
    $user = User::factory()->create()->assignRole('educator');
    $owner->givePermissionTo('manage collaborators');
    $exam->update(['created_by' => $owner->id]);
    $exam->collaborators()->attach($collaborator->id, ['role' => 'editor']);

    $this->actingAs($user)
        ->patch(route('exam-builder.collaborators.update', [$exam, $collaborator]), [
            'role' => 'viewer',
        ])
        ->assertStatus(403);
});

test('owner can remove collaborator', function () {
    $exam = Exam::factory()->create();
    $owner = User::factory()->create()->assignRole('educator');
    $collaborator = User::factory()->create()->assignRole('educator');
    $owner->givePermissionTo('manage collaborators');
    $exam->update(['created_by' => $owner->id]);
    $exam->collaborators()->attach($collaborator->id);

    $this->actingAs($owner)
        ->delete(route('exam-builder.collaborators.destroy', [$exam, $collaborator]))
        ->assertRedirect()
        ->assertSessionHas('success');

    $this->assertDatabaseMissing('exam_collaborators', [
        'exam_id' => $exam->id,
        'user_id' => $collaborator->id,
    ]);
});

test('collaborator can leave exam', function () {
    $exam = Exam::factory()->create();
    $owner = User::factory()->create()->assignRole('educator');
    $collaborator = User::factory()->create()->assignRole('educator');
    $owner->givePermissionTo('manage collaborators');
    $exam->update(['created_by' => $owner->id]);
    $exam->collaborators()->attach($collaborator->id, ['role' => 'editor']);

    $this->actingAs($collaborator)
        ->post(route('exam-builder.collaborators.leave', $exam))
        ->assertRedirect()
        ->assertSessionHas('success');

    $this->assertDatabaseMissing('exam_collaborators', [
        'exam_id' => $exam->id,
        'user_id' => $collaborator->id,
    ]);
});

test('search users endpoint returns available users', function () {
    $owner = User::factory()->create()->assignRole('educator');
    $owner->givePermissionTo('manage collaborators');
    $module = \App\Models\Module::factory()->create(['created_by' => $owner->id]);
    $exam = Exam::factory()->create(['created_by' => $owner->id, 'module_id' => $module->id]);

    // Create a user who is NOT a collaborator
    $userToFind = User::factory()->create(['name' => 'John Doe', 'email' => 'john@example.com']);

    $response = $this->actingAs($owner)
        ->get(route('exam-builder.collaborators.search', [
            'exam_id' => $exam->id,
            'query' => 'john',
        ]));

    $response->assertStatus(200);
    $response->assertJsonCount(1);
    $response->assertJsonFragment(['email' => 'john@example.com']);
});

test('collaborators are excluded from search results', function () {
    $owner = User::factory()->create()->assignRole('educator');
    $owner->givePermissionTo('manage collaborators');
    $module = \App\Models\Module::factory()->create(['created_by' => $owner->id]);
    $exam = Exam::factory()->create(['created_by' => $owner->id, 'module_id' => $module->id]);

    $user1 = User::factory()->create(['name' => 'Alice', 'email' => 'alice@test.com']);
    $user2 = User::factory()->create(['name' => 'Bob', 'email' => 'bob@test.com']);
    $exam->collaborators()->attach([$user1->id, $user2->id]);

    $response = $this->actingAs($owner)
        ->get(route('exam-builder.collaborators.search', [
            'exam_id' => $exam->id,
            'query' => 'a',
        ]));

    $response->assertStatus(200);
    $response->assertJsonCount(0);
});

test('editor collaborator can edit exam', function () {
    $exam = Exam::factory()->create();
    $owner = User::factory()->create()->assignRole('educator');
    $editor = User::factory()->create()->assignRole('educator');
    $owner->givePermissionTo('manage collaborators');
    $exam->update(['created_by' => $owner->id]);
    $exam->collaborators()->attach($editor->id, ['role' => 'editor']);

    $this->actingAs($editor)
        ->get(route('exam-builder.edit', $exam))
        ->assertStatus(200);
});

test('viewer collaborator cannot edit exam', function () {
    $exam = Exam::factory()->create();
    $owner = User::factory()->create()->assignRole('educator');
    $viewer = User::factory()->create()->assignRole('educator');
    $owner->givePermissionTo('manage collaborators');
    $exam->update(['created_by' => $owner->id]);
    $exam->collaborators()->attach($viewer->id, ['role' => 'viewer']);

    $this->actingAs($viewer)
        ->get(route('exam-builder.edit', $exam))
        ->assertStatus(403);
});
