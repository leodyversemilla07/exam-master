<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreModuleRequest;
use App\Models\Module;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ModuleController extends Controller
{
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

        $module = Module::create([
            ...$request->validated(),
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

        $module->update($request->validated());

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
