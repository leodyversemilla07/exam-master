<?php

use App\Models\Exam;
use App\Models\ExamQuestion;
use App\Models\ExamSession;
use App\Models\Module;
use App\Models\Topic;
use App\Models\TosGenerate;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);

    $this->educator = User::factory()->create();
    $this->educator->assignRole('educator');

    $this->actingAs($this->educator);
});

it('prevents educators from viewing another educators question', function () {
    $question = ExamQuestion::factory()->create();

    $this->get(route('question-bank.show', $question))
        ->assertForbidden();
});

it('prevents educators from previewing another educators exam', function () {
    $exam = Exam::factory()->create();

    $this->get(route('exam-builder.preview', $exam))
        ->assertForbidden();
});

it('prevents educators from reading another educators tos summary', function () {
    $tos = TosGenerate::factory()->create();

    $this->getJson(route('tos-generates.summary', $tos))
        ->assertForbidden();
});

it('prevents educators from viewing another educators exam session', function () {
    $session = ExamSession::factory()->create();

    $this->get(route('exam-sessions.show', $session))
        ->assertForbidden();
});

it('allows educators to create exams only for their own modules', function () {
    $ownModule = Module::factory()->create(['created_by' => $this->educator->id]);
    $otherModule = Module::factory()->create();

    $payload = [
        'title' => 'Ownership Check Exam',
        'exam_type' => 'formative',
        'passing_score' => 70,
    ];

    $this->post(route('exam-builder.store'), [
        ...$payload,
        'module_id' => $otherModule->id,
    ])->assertForbidden();

    $this->post(route('exam-builder.store'), [
        ...$payload,
        'module_id' => $ownModule->id,
    ])->assertRedirect();
});

it('prevents educators from managing another educators topics', function () {
    $module = Module::factory()->create();

    $this->get(route('modules.topics.index', $module))
        ->assertForbidden();
});

it('prevents cross-module parent topics', function () {
    $ownModule = Module::factory()->create(['created_by' => $this->educator->id]);
    $otherTopic = Topic::factory()->create();

    $this->post(route('modules.topics.store', $ownModule), [
        'code' => 'CROSS-PARENT',
        'title' => 'Cross Parent',
        'parent_id' => $otherTopic->id,
    ])->assertStatus(422);
});

it('prevents educators from managing another educators objectives', function () {
    $module = Module::factory()->create();
    $topic = Topic::factory()->create(['module_id' => $module->id]);

    $this->get(route('modules.topics.objectives.index', [$module, $topic]))
        ->assertForbidden();
});

it('prevents non owners from adding exam collaborators', function () {
    $exam = Exam::factory()->create();
    $collaborator = User::factory()->create();

    $this->post(route('exam-builder.collaborators.store', $exam), [
        'user_id' => $collaborator->id,
        'role' => 'editor',
    ])->assertForbidden();
});

it('prevents educators from using another educators tos calculator', function () {
    $module = Module::factory()->create();

    $this->get(route('modules.tos-calculator', $module))
        ->assertForbidden();
});

it('prevents educators from viewing duplicate detection for another educators module', function () {
    $module = Module::factory()->create();

    $this->get(route('modules.duplicate-detection', $module))
        ->assertForbidden();
});
