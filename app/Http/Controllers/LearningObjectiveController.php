<?php

namespace App\Http\Controllers;

use App\Models\LearningObjective;
use App\Models\Module;
use App\Models\Topic;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LearningObjectiveController extends Controller
{
    /**
     * Display a listing of learning objectives for a topic
     */
    public function index(Module $module, Topic $topic): Response
    {
        $this->authorizeTopic($module, $topic);

        $objectives = $topic->learningObjectives()
            ->orderBy('order')
            ->get();

        return Inertia::render('learning-objectives/index', [
            'module' => $module,
            'topic' => $topic,
            'objectives' => $objectives,
        ]);
    }

    /**
     * Store a newly created learning objective
     */
    public function store(Request $request, Module $module, Topic $topic): RedirectResponse
    {
        $this->authorizeTopic($module, $topic);

        $validated = $request->validate([
            'code' => 'required|string|max:50|unique:learning_objectives,code',
            'objective' => 'required|string',
            'cognitive_level' => 'required|in:remembering,understanding,applying,analyzing,evaluating,creating',
            'order' => 'nullable|integer|min:0',
            'assessment_criteria' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $validated['topic_id'] = $topic->id;

        if (! isset($validated['order'])) {
            $validated['order'] = $topic->learningObjectives()->max('order') + 1;
        }

        LearningObjective::create($validated);

        return back()->with('success', 'Learning objective created successfully.');
    }

    /**
     * Update the specified learning objective
     */
    public function update(Request $request, Module $module, Topic $topic, LearningObjective $objective): RedirectResponse
    {
        $this->authorizeObjective($module, $topic, $objective);

        $validated = $request->validate([
            'code' => 'required|string|max:50|unique:learning_objectives,code,'.$objective->id,
            'objective' => 'required|string',
            'cognitive_level' => 'required|in:remembering,understanding,applying,analyzing,evaluating,creating',
            'order' => 'nullable|integer|min:0',
            'assessment_criteria' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $objective->update($validated);

        return back()->with('success', 'Learning objective updated successfully.');
    }

    /**
     * Remove the specified learning objective
     */
    public function destroy(Module $module, Topic $topic, LearningObjective $objective): RedirectResponse
    {
        $this->authorizeObjective($module, $topic, $objective);

        $objective->delete();

        return back()->with('success', 'Learning objective deleted successfully.');
    }

    /**
     * Reorder learning objectives
     */
    public function reorder(Request $request, Module $module, Topic $topic): RedirectResponse
    {
        $this->authorizeTopic($module, $topic);

        $validated = $request->validate([
            'objectives' => 'required|array',
            'objectives.*.id' => 'required|exists:learning_objectives,id',
            'objectives.*.order' => 'required|integer|min:0',
        ]);

        $objectiveIds = collect($validated['objectives'])->pluck('id');

        abort_unless($topic->learningObjectives()->whereIn('id', $objectiveIds)->count() === $objectiveIds->count(), 422);

        foreach ($validated['objectives'] as $objectiveData) {
            LearningObjective::where('id', $objectiveData['id'])
                ->where('topic_id', $topic->id)
                ->update(['order' => $objectiveData['order']]);
        }

        return back()->with('success', 'Learning objectives reordered successfully.');
    }

    private function authorizeTopic(Module $module, Topic $topic): void
    {
        abort_unless($this->canAccessModule($module), 403);
        abort_unless($topic->module_id === $module->id, 404);
    }

    private function authorizeObjective(Module $module, Topic $topic, LearningObjective $objective): void
    {
        $this->authorizeTopic($module, $topic);
        abort_unless($objective->topic_id === $topic->id, 404);
    }

    private function canAccessModule(Module $module): bool
    {
        return auth()->user()->isAdmin() || $module->created_by === auth()->id();
    }
}
