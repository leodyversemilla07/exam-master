<?php

namespace Tests\Feature;

use App\Models\ExamTemplate;
use App\Models\Module;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Route;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;
use Tests\TestCase;

class ExamTemplateTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Create required permissions
        $permissions = [
            'view templates',
            'create templates',
            'edit templates',
            'delete templates',
        ];

        foreach ($permissions as $permission) {
            Permission::findOrCreate($permission, 'web');
        }
    }

    public function test_show_route_is_not_registered_without_a_controller_action()
    {
        $this->assertFalse(Route::has('exam-templates.show'));
    }

    public function test_user_can_view_exam_templates()
    {
        $user = User::factory()->create();
        $user->givePermissionTo('view templates');
        $this->actingAs($user);

        $response = $this->get(route('exam-templates.index'));

        $response->assertStatus(200);
    }

    public function test_user_cannot_view_exam_templates_without_permission()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $response = $this->get(route('exam-templates.index'));

        $response->assertStatus(403);
    }

    public function test_user_can_create_exam_template()
    {
        $user = User::factory()->create();
        $user->givePermissionTo('create templates');
        $this->actingAs($user);

        $data = [
            'name' => 'My Custom Template',
            'header_content' => '<h1>Header</h1>',
            'footer_content' => '<p>Footer</p>',
            'custom_styles' => 'body { color: red; }',
        ];

        $response = $this->post(route('exam-templates.store'), $data);

        $response->assertRedirect(route('exam-templates.index'));
        $this->assertDatabaseHas('exam_templates', [
            'name' => 'My Custom Template',
            'user_id' => $user->id,
        ]);
    }

    public function test_user_can_update_exam_template()
    {
        $user = User::factory()->create();
        $user->givePermissionTo('edit templates');
        $this->actingAs($user);

        $template = ExamTemplate::create([
            'user_id' => $user->id,
            'name' => 'Old Name',
            'header_content' => 'Old Header',
        ]);

        $response = $this->put(route('exam-templates.update', $template), [
            'name' => 'New Name',
            'header_content' => 'New Header',
            'footer_content' => 'New Footer',
        ]);

        $response->assertRedirect(route('exam-templates.index'));
        $this->assertDatabaseHas('exam_templates', [
            'id' => $template->id,
            'name' => 'New Name',
        ]);
    }

    public function test_user_can_delete_exam_template()
    {
        $user = User::factory()->create();
        $user->givePermissionTo('delete templates');
        $this->actingAs($user);

        $template = ExamTemplate::create([
            'user_id' => $user->id,
            'name' => 'To Delete',
        ]);

        $response = $this->from(route('exam-templates.index'))
            ->delete(route('exam-templates.destroy', $template));

        $response->assertRedirect(route('exam-templates.index'));
        $this->assertDatabaseMissing('exam_templates', ['id' => $template->id]);
    }

    public function test_user_can_assign_template_to_exam()
    {
        $user = User::factory()->create();

        // Ensure permissions exist with correct guard
        $permissions = [
            'create exams',
            'view exams',
            'view modules',
        ];

        foreach ($permissions as $permission) {
            Permission::findOrCreate($permission, 'web');
        }

        // Reset cached roles and permissions
        $this->app->make(PermissionRegistrar::class)->forgetCachedPermissions();

        $user->givePermissionTo($permissions);
        $this->actingAs($user);

        $module = Module::factory()->create(['created_by' => $user->id]);
        $template = ExamTemplate::create([
            'user_id' => $user->id,
            'name' => 'My Template',
        ]);

        $data = [
            'module_id' => $module->id,
            'title' => 'Test Exam',
            'exam_type' => 'formative',
            'passing_score' => 70,
            'exam_template_id' => $template->id,
        ];

        $response = $this->post(route('exam-builder.store'), $data);

        $response->assertStatus(302); // Redirects to show
        $this->assertDatabaseHas('exams', [
            'title' => 'Test Exam',
            'exam_template_id' => $template->id,
        ]);
    }
}
