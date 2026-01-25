<?php

use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->artisan('db:seed', ['--class' => 'RolePermissionSeeder']);
});

test('registration screen can be rendered', function () {
    $response = $this->get('/register');

    $response->assertStatus(200);
});

test('new users can register', function () {
    $email = 'test'.uniqid().'@example.com';
    $response = $this->post('/register', [
        'name' => 'Test User',
        'email' => $email,
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ]);

    $this->assertDatabaseHas('users', [
        'email' => $email,
    ]);

    $response->assertRedirect('/dashboard');
});
