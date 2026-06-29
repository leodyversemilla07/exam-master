<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\File;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->artisan('db:seed', ['--class' => 'RolePermissionSeeder']);
    $this->admin = User::factory()->create();
    $this->admin->assignRole('super-admin');
    $this->actingAs($this->admin);

    $this->logPath = storage_path('logs/laravel.log');
    if (! File::exists(dirname($this->logPath))) {
        File::makeDirectory(dirname($this->logPath), 0755, true);
    }
});

test('can view logs index', function () {
    $response = $this->get(route('system-logs.index'));
    $response->assertSuccessful();
});

test('can get logs', function () {
    $logContent = "[2026-01-01 10:00:00] local.INFO: Test log message\n";
    File::put($this->logPath, $logContent);

    $response = $this->getJson(route('system-logs.logs'));

    $response->assertSuccessful();
    $response->assertJsonCount(1, 'logs');
    $response->assertJsonPath('logs.0.message', 'Test log message');
});

test('can clear logs', function () {
    File::put($this->logPath, 'some logs');

    $response = $this->postJson(route('system-logs.clear'));

    $response->assertSuccessful();
    $this->assertEquals('', File::get($this->logPath));
});

test('can download logs', function () {
    File::put($this->logPath, 'some logs');

    $response = $this->get(route('system-logs.download'));

    $response->assertSuccessful();
    $response->assertHeader('Content-Disposition');
    $this->assertStringContainsString('attachment; filename=laravel-', $response->headers->get('Content-Disposition'));
});

test('admin without system log permissions cannot access logs', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $this->actingAs($admin)
        ->get(route('system-logs.index'))
        ->assertForbidden();

    $this->actingAs($admin)
        ->postJson(route('system-logs.clear'))
        ->assertForbidden();
});
