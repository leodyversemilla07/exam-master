<?php

namespace App\Http\Controllers;

use App\Models\Module;
use App\Models\Topic;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TopicController extends Controller
{
    /**
     * Display a listing of topics for a module
     */
    public function index(Module $module): Response
    {
        $topics = $module->topics()
            ->with(['parent', 'children', 'learningObjectives'])
            ->get();

        return Inertia::render('topics/index', [
            'module' => $module,
            'topics' => $topics,
        ]);
    }

    /**
     * Show the form for creating a new topic
     */
    public function create(Module $module): Response
    {
        $topics = $module->topics()->get();

        return Inertia::render('topics/form', [
            'module' => $module,
            'topics' => $topics,
        ]);
    }

    /**
     * Store a newly created topic
     */
    public function store(Request $request, Module $module): RedirectResponse
    {
        $validated = $request->validate([
            'code' => 'required|string|max:50',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'parent_id' => 'nullable|exists:topics,id',
            'order' => 'nullable|integer|min:0',
            'hours_allocated' => 'nullable|numeric|min:0',
            'weight_percentage' => 'nullable|numeric|min:0|max:100',
            'is_active' => 'boolean',
        ]);

        $validated['module_id'] = $module->id;

        if (! isset($validated['order'])) {
            $validated['order'] = $module->topics()->max('order') + 1;
        }

        $topic = Topic::create($validated);

        return redirect()
            ->route('modules.topics.index', $module)
            ->with('success', 'Topic created successfully.');
    }

    /**
     * Display the specified topic
     */
    public function show(Module $module, Topic $topic): Response
    {
        abort_unless($topic->module_id === $module->id, 404);

        $topic->load([
            'parent',
            'children.learningObjectives',
            'learningObjectives',
        ]);

        return Inertia::render('topics/show', [
            'module' => $module,
            'topic' => $topic,
        ]);
    }

    /**
     * Show the form for editing the specified topic
     */
    public function edit(Module $module, Topic $topic): Response
    {
        abort_unless($topic->module_id === $module->id, 404);

        $availableParents = $module->topics()
            ->where('id', '!=', $topic->id)
            ->get();

        return Inertia::render('topics/form', [
            'module' => $module,
            'topic' => $topic,
            'topics' => $availableParents,
        ]);
    }

    /**
     * Update the specified topic
     */
    public function update(Request $request, Module $module, Topic $topic): RedirectResponse
    {
        abort_unless($topic->module_id === $module->id, 404);

        $validated = $request->validate([
            'code' => 'required|string|max:50',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'parent_id' => 'nullable|exists:topics,id',
            'order' => 'nullable|integer|min:0',
            'hours_allocated' => 'nullable|numeric|min:0',
            'weight_percentage' => 'nullable|numeric|min:0|max:100',
            'is_active' => 'boolean',
        ]);

        $topic->update($validated);

        return redirect()
            ->route('modules.topics.show', [$module, $topic])
            ->with('success', 'Topic updated successfully.');
    }

    /**
     * Remove the specified topic
     */
    public function destroy(Module $module, Topic $topic): RedirectResponse
    {
        abort_unless($topic->module_id === $module->id, 404);

        $topic->delete();

        return redirect()
            ->route('modules.topics.index', $module)
            ->with('success', 'Topic deleted successfully.');
    }

    /**
     * Reorder topics
     */
    public function reorder(Request $request, Module $module): RedirectResponse
    {
        $validated = $request->validate([
            'topics' => 'required|array',
            'topics.*.id' => 'required|exists:topics,id',
            'topics.*.order' => 'required|integer|min:0',
        ]);

        foreach ($validated['topics'] as $topicData) {
            Topic::where('id', $topicData['id'])
                ->where('module_id', $module->id)
                ->update(['order' => $topicData['order']]);
        }

        return back()->with('success', 'Topics reordered successfully.');
    }
}
