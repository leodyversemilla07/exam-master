<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreModuleRequest;
use App\Models\Module;
use App\Services\AI\ModuleExtractorService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ModuleController extends Controller
{
    /**
     * Extract module information from uploaded PDF using AI.
     */
    public function extractFromPdf(Request $request, ModuleExtractorService $extractor): JsonResponse
    {
        abort_unless(auth()->user()->can('create modules'), 403);

        $request->validate([
            'pdf' => 'required|file|mimes:pdf|max:10240', // Max 10MB
        ]);

        $result = $extractor->extractFromPdf($request->file('pdf'));

        return response()->json($result);
    }

    /**
     * Extract TOS data from a module's already-uploaded PDF.
     */
    public function extractTosFromModule(Module $module, \App\Services\AI\TosExtractorService $extractor): RedirectResponse
    {
        abort_unless(auth()->user()->can('create tos'), 403);

        $result = $extractor->extractFromModule($module);

        // Return data via Inertia flash session so frontend can use router.post
        return back()->with('tosExtraction', $result);
    }

    /**
     * Display a listing of modules.
     */
    public function index(): Response
    {
        $modules = Module::query()
            ->with('creator')
            ->withCount('tosGenerates', 'questions')
            ->latest()
            ->paginate(15);

        return Inertia::render('modules/index', [
            'modules' => $modules,
        ]);
    }

    /**
     * Show the form for creating a new module.
     */
    public function create(): Response
    {
        return Inertia::render('modules/form');
    }

    /**
     * Store a newly created module.
     */
    public function store(StoreModuleRequest $request): RedirectResponse
    {
        abort_unless(auth()->user()->can('create modules'), 403);

        $data = $request->validated();

        // Handle PDF file upload
        if ($request->hasFile('pdf_file')) {
            $data['pdf_file'] = $request->file('pdf_file')->store('modules/pdfs', 'public');
        }

        $module = Module::create([
            ...$data,
            'created_by' => auth()->id(),
        ]);

        return redirect()
            ->route('modules.show', $module)
            ->with('success', 'Module created successfully.');
    }

    /**
     * Display the specified module.
     */
    public function show(Module $module): Response
    {
        $module->load(['creator', 'tosGenerates.questions']);

        return Inertia::render('modules/show', [
            'module' => $module,
        ]);
    }

    /**
     * Show the form for editing the specified module.
     */
    public function edit(Module $module): Response
    {
        return Inertia::render('modules/form', [
            'module' => $module,
        ]);
    }

    /**
     * Update the specified module.
     */
    public function update(StoreModuleRequest $request, Module $module): RedirectResponse
    {
        abort_unless(auth()->user()->can('edit modules'), 403);

        $data = $request->validated();

        // Handle PDF file upload
        if ($request->hasFile('pdf_file')) {
            // Delete old file if exists
            if ($module->pdf_file) {
                \Storage::disk('public')->delete($module->pdf_file);
            }
            $data['pdf_file'] = $request->file('pdf_file')->store('modules/pdfs', 'public');
        }

        $module->update($data);

        return redirect()
            ->route('modules.show', $module)
            ->with('success', 'Module updated successfully.');
    }

    /**
     * Remove the specified module.
     */
    public function destroy(Module $module): RedirectResponse
    {
        abort_unless(auth()->user()->can('delete modules'), 403);

        // Delete PDF file if exists
        if ($module->pdf_file) {
            \Storage::disk('public')->delete($module->pdf_file);
        }

        $module->delete();

        return redirect()
            ->route('modules.index')
            ->with('success', 'Module deleted successfully.');
    }

    /**
     * Toggle module active status.
     */
    public function toggleStatus(Module $module): RedirectResponse
    {
        abort_unless(auth()->user()->can('edit modules'), 403);

        $module->update(['is_active' => ! $module->is_active]);

        return back()->with(
            'success',
            $module->is_active ? 'Module activated.' : 'Module deactivated.'
        );
    }
}
