<?php

use App\Models\Exam;
use App\Models\ExamQuestion;
use App\Models\Module;
use App\Models\TosGenerate;
use App\Models\User;
use Spatie\Permission\Models\Permission;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\get;

beforeEach(function () {
    $this->user = User::factory()->create();

    // Create required permissions
    Permission::firstOrCreate(['name' => 'view modules']);
    Permission::firstOrCreate(['name' => 'view tos']);
    Permission::firstOrCreate(['name' => 'view exams']);

    $this->user->givePermissionTo(['view modules', 'view tos', 'view exams']);

    actingAs($this->user);
});

it('displays the dashboard page for authenticated users', function () {
    get(route('dashboard'))
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->component('dashboard')
            ->has('stats')
            ->has('recentExams')
        );
});

it('shows correct statistics on dashboard', function () {
    // Create test data
    $module = Module::factory()->create(['is_active' => true]);
    Module::factory()->create(['is_active' => false]);

    $tosGenerate = TosGenerate::factory()->create([
        'module_id' => $module->id,
        'status' => 'completed',
    ]);

    ExamQuestion::factory()->count(5)->create([
        'module_id' => $module->id,
        'tos_generate_id' => $tosGenerate->id,
        'is_approved' => true,
        'is_ai_generated' => true,
    ]);

    ExamQuestion::factory()->count(3)->create([
        'module_id' => $module->id,
        'tos_generate_id' => $tosGenerate->id,
        'is_approved' => false,
        'is_ai_generated' => false,
    ]);

    get(route('dashboard'))
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->component('dashboard')
            ->where('stats.total_modules', 2)
            ->where('stats.active_modules', 1)
            ->where('stats.total_questions', 8)
            ->where('stats.approved_questions', 5)
            ->where('stats.pending_questions', 3)
            ->where('stats.ai_generated_questions', 5)
        );
});

it('shows recent exams on dashboard', function () {
    $module = Module::factory()->create();

    Exam::factory()->count(5)->create([
        'module_id' => $module->id,
        'created_by' => $this->user->id,
    ]);

    get(route('dashboard'))
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->component('dashboard')
            ->has('recentExams', 5)
        );
});

it('limits recent exams to 20', function () {
    $module = Module::factory()->create();

    Exam::factory()->count(25)->create([
        'module_id' => $module->id,
        'created_by' => $this->user->id,
    ]);

    get(route('dashboard'))
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->component('dashboard')
            ->has('recentExams', 20)
        );
});

it('requires authentication for dashboard', function () {
    auth()->logout();

    get(route('dashboard'))
        ->assertRedirect(route('login'));
});
