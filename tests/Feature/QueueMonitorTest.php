<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->artisan('db:seed', ['--class' => 'RolePermissionSeeder']);
    $this->admin = User::factory()->create();
    $this->admin->assignRole('super-admin');
    $this->actingAs($this->admin);

    // Ensure failed_jobs table exists (usually handled by migrations)
});

test('can view queue monitor index', function () {
    $response = $this->get(route('queue-monitor.index'));
    $response->assertSuccessful();
});

test('can get queue stats', function () {
    DB::table('failed_jobs')->insert([
        'uuid' => (string) Str::uuid(),
        'connection' => 'sync',
        'queue' => 'default',
        'payload' => '{}',
        'exception' => 'Test exception',
        'failed_at' => now(),
    ]);

    $response = $this->getJson(route('queue-monitor.stats'));

    $response->assertSuccessful();
    $response->assertJsonStructure([
        'stats' => ['failed_jobs', 'pending_jobs', 'total_jobs'],
        'recent_failed',
    ]);
    $response->assertJsonPath('stats.failed_jobs', 1);
});

test('can delete a failed job', function () {
    $id = DB::table('failed_jobs')->insertGetId([
        'uuid' => (string) Str::uuid(),
        'connection' => 'sync',
        'queue' => 'default',
        'payload' => '{}',
        'exception' => 'Test exception',
        'failed_at' => now(),
    ]);

    $response = $this->deleteJson(route('queue-monitor.delete'), ['id' => $id]);

    $response->assertSuccessful();
    $this->assertEquals(0, DB::table('failed_jobs')->count());
});

test('can clear all failed jobs', function () {
    DB::table('failed_jobs')->insert([
        'uuid' => (string) Str::uuid(),
        'connection' => 'sync',
        'queue' => 'default',
        'payload' => '{}',
        'exception' => 'Test exception',
        'failed_at' => now(),
    ]);

    $response = $this->postJson(route('queue-monitor.clear'));

    $response->assertSuccessful();
    $this->assertEquals(0, DB::table('failed_jobs')->count());
});
