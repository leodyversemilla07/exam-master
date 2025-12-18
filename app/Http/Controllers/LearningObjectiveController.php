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
        abort_unless($topic->module_id === $module->id, 404);

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
        abort_unless($topic->module_id === $module->id, 404);

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
        abort_unless($topic->module_id === $module->id, 404);
        abort_unless($objective->topic_id === $topic->id, 404);

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
        abort_unless($topic->module_id === $module->id, 404);
        abort_unless($objective->topic_id === $topic->id, 404);

        $objective->delete();

        return back()->with('success', 'Learning objective deleted successfully.');
    }

    /**
     * Reorder learning objectives
     */
    public function reorder(Request $request, Module $module, Topic $topic): RedirectResponse
    {
        abort_unless($topic->module_id === $module->id, 404);

        $validated = $request->validate([
            'objectives' => 'required|array',
            'objectives.*.id' => 'required|exists:learning_objectives,id',
            'objectives.*.order' => 'required|integer|min:0',
        ]);

        foreach ($validated['objectives'] as $objectiveData) {
            LearningObjective::where('id', $objectiveData['id'])
                ->where('topic_id', $topic->id)
                ->update(['order' => $objectiveData['order']]);
        }

        return back()->with('success', 'Learning objectives reordered successfully.');
    }
}
