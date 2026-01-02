<?php

namespace App\Http\Controllers;

use App\Models\ExamTemplate;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ExamTemplateController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        abort_unless(auth()->user()->can('view templates'), 403);

        $templates = ExamTemplate::where('user_id', auth()->id())
            ->latest()
            ->get();

        return Inertia::render('exam-templates/index', [
            'templates' => $templates,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        abort_unless(auth()->user()->can('create templates'), 403);

        return Inertia::render('exam-templates/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        abort_unless(auth()->user()->can('create templates'), 403);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'header_content' => 'nullable|string',
            'footer_content' => 'nullable|string',
            'custom_styles' => 'nullable|string',
        ]);

        $request->user()->examTemplates()->create($validated);

        return redirect()->route('exam-templates.index')
            ->with('success', 'Template created successfully.');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(ExamTemplate $examTemplate): Response
    {
        abort_unless(auth()->user()->can('edit templates'), 403);
        abort_unless($examTemplate->user_id === auth()->id(), 403);

        return Inertia::render('exam-templates/edit', [
            'template' => $examTemplate,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, ExamTemplate $examTemplate): RedirectResponse
    {
        abort_unless(auth()->user()->can('edit templates'), 403);
        abort_unless($examTemplate->user_id === auth()->id(), 403);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'header_content' => 'nullable|string',
            'footer_content' => 'nullable|string',
            'custom_styles' => 'nullable|string',
        ]);

        $examTemplate->update($validated);

        return redirect()->route('exam-templates.index')
            ->with('success', 'Template updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ExamTemplate $examTemplate): RedirectResponse
    {
        abort_unless(auth()->user()->can('delete templates'), 403);
        abort_unless($examTemplate->user_id === auth()->id(), 403);

        $examTemplate->delete();

        return back()->with('success', 'Template deleted successfully.');
    }
}
