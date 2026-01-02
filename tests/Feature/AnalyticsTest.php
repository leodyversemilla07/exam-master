<?php

use App\Models\Exam;
use App\Models\Module;
use App\Models\Topic;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->artisan('db:seed', ['--class' => 'RolePermissionSeeder']);
    $this->admin = User::factory()->create();
    $this->admin->assignRole('super-admin');
    $this->actingAs($this->admin);
});

test('can view analytics index', function () {
    $response = $this->get(route('analytics.index'));
    $response->assertSuccessful();
});

test('can get exams created per period', function () {
    Exam::factory()->count(5)->create(['created_at' => now()->subDays(2)]);

    $response = $this->getJson(route('analytics.exams-created', ['period' => 'day']));

    $response->assertSuccessful();
    $response->assertJsonCount(1, 'data');
    $response->assertJsonPath('total', 5);
});

test('can get most used modules and topics', function () {
    $module = Module::factory()->create(['name' => 'Test Module']);
    $topic = Topic::create([
        'module_id' => $module->id,
        'title' => 'Test Topic',
        'code' => 'T1',
        'order' => 1,
    ]);

    $response = $this->getJson(route('analytics.modules-topics'));

    $response->assertSuccessful();
    $response->assertJsonStructure([
        'modules',
        'topics',
    ]);
});
