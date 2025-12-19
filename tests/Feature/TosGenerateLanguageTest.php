<?php

use App\Models\Module;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->artisan('db:seed', ['--class' => 'RolePermissionSeeder']);

    $this->user = User::factory()->create();
    $this->user->assignRole('super-admin');

    $this->actingAs($this->user);
});

it('persists selected language when creating a TOS', function () {
    $module = Module::factory()->create();

    $payload = [
        'module_id' => $module->id,
        'grade_level' => 'Grade 9',
        'subject' => 'Science',
        'quarter' => '1st Quarter',
        'total_items' => 5,
        'learning_objectives' => [
            ['code' => 'SCI-9-01', 'description' => 'Describe ecosystems and interactions'],
        ],
        'cognitive_levels' => [
            'remember' => 5,
            'understand' => 0,
            'apply' => 0,
            'analyze' => 0,
            'evaluate' => 0,
            'create' => 0,
        ],
        'difficulty_level' => 'mixed',
        'question_type' => 'multiple_choice',
        'language' => 'filipino',
        'additional_instructions' => null,
    ];

    $response = $this->post(route('tos-generates.store'), $payload);

    $response->assertRedirect();

    $this->assertDatabaseHas('tos_generates', [
        'module_id' => $module->id,
        'created_by' => $this->user->id,
        'language' => 'filipino',
    ]);
});

it('validates language is within the allowed values', function () {
    $module = Module::factory()->create();

    $payload = [
        'module_id' => $module->id,
        'grade_level' => 'Grade 9',
        'subject' => 'Science',
        'quarter' => '1st Quarter',
        'total_items' => 5,
        'learning_objectives' => [
            ['code' => 'SCI-9-01', 'description' => 'Describe ecosystems and interactions'],
        ],
        'cognitive_levels' => [
            'remember' => 5,
            'understand' => 0,
            'apply' => 0,
            'analyze' => 0,
            'evaluate' => 0,
            'create' => 0,
        ],
        'difficulty_level' => 'mixed',
        'question_type' => 'multiple_choice',
        'language' => 'spanish',
        'additional_instructions' => null,
    ];

    $this->post(route('tos-generates.store'), $payload)
        ->assertSessionHasErrors(['language']);
});
