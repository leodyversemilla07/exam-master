<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->artisan('db:seed', ['--class' => 'RolePermissionSeeder']);

    $this->admin = User::factory()->create();
    $this->admin->assignRole('super-admin');
    $this->actingAs($this->admin);
});

test('can view users index', function () {
    User::factory()->count(5)->create();

    $response = $this->get(route('users.index'));

    $response->assertSuccessful();
    $response->assertInertia(fn ($page) => $page
        ->component('users/index')
        ->has('users.data', 7) // 5 new + 1 admin + 1 default student from seeder
    );
});

test('can create a user', function () {
    $data = [
        'name' => 'John Doe',
        'email' => 'john@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
        'role' => 'educator',
    ];

    $response = $this->post(route('users.store'), $data);

    $response->assertRedirect();
    $this->assertDatabaseHas('users', [
        'email' => 'john@example.com',
        'name' => 'John Doe',
    ]);

    $user = User::where('email', 'john@example.com')->first();
    $this->assertTrue($user->hasRole('educator'));
    expect($user->hasVerifiedEmail())->toBeTrue();
});

test('super admin can assign super admin role', function () {
    $response = $this->post(route('users.store'), [
        'name' => 'Jane Doe',
        'email' => 'jane@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
        'role' => 'super-admin',
    ]);

    $response->assertRedirect();

    $user = User::where('email', 'jane@example.com')->first();

    expect($user)->not->toBeNull();
    expect($user->hasRole('super-admin'))->toBeTrue();
});

test('admin cannot assign super admin role', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $this->actingAs($admin)
        ->post(route('users.store'), [
            'name' => 'Privilege Escalation',
            'email' => 'escalation@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'super-admin',
        ])
        ->assertSessionHasErrors('role');

    $createdUser = User::where('email', 'escalation@example.com')->first();

    expect($createdUser)->toBeNull();
});

test('admin cannot update super admin users', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $this->actingAs($admin)
        ->put(route('users.update', $this->admin), [
            'name' => 'Updated Super Admin',
            'email' => $this->admin->email,
            'role' => 'admin',
        ])
        ->assertForbidden();
});

test('seeded default student is verified and active', function () {
    $student = User::where('email', 'student@example.com')->first();

    expect($student)->not->toBeNull();
    expect($student->hasVerifiedEmail())->toBeTrue();
    expect($student->is_active)->toBeTrue();
});

test('can update a user', function () {
    $user = User::factory()->create(['name' => 'Old Name']);

    $data = [
        'name' => 'New Name',
        'email' => $user->email,
        'role' => 'admin',
    ];

    $response = $this->put(route('users.update', $user), $data);

    $response->assertRedirect();
    $this->assertDatabaseHas('users', [
        'id' => $user->id,
        'name' => 'New Name',
    ]);
    $this->assertTrue($user->fresh()->hasRole('admin'));
});

test('can delete a user', function () {
    $user = User::factory()->create();

    $response = $this->delete(route('users.destroy', $user));

    $response->assertRedirect();
    $this->assertDatabaseMissing('users', ['id' => $user->id]);
});

test('cannot delete self', function () {
    $response = $this->delete(route('users.destroy', $this->admin));

    $response->assertSessionHas('error', 'You cannot delete your own account.');
    $this->assertDatabaseHas('users', ['id' => $this->admin->id]);
});

test('can toggle user active status', function () {
    $user = User::factory()->create(['is_active' => true]);

    $response = $this->post(route('users.toggle', $user));

    $response->assertRedirect();
    $this->assertFalse($user->fresh()->is_active);

    $this->post(route('users.toggle', $user));
    $this->assertTrue($user->fresh()->is_active);
});
