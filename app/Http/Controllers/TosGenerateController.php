<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTosGenerateRequest;
use App\Jobs\GenerateQuestionsJob;
use App\Models\Module;
use App\Models\TosGenerate;
use App\Services\AI\QuestionGeneratorService;
use App\Services\TosCalculator;
use App\Services\TosPdfExporter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Response as HttpResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class TosGenerateController extends Controller
{
    public function __construct(
        protected QuestionGeneratorService $questionGenerator,
        protected TosCalculator $tosCalculator
    ) {}

    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        $tosGenerates = TosGenerate::query()
            ->with(['module', 'creator'])
            ->when(! auth()->user()->isAdmin(), fn ($query) => $query->where('created_by', auth()->id()))
            ->latest()
            ->paginate(15);

        return Inertia::render('tos-generates/index', [
            'tosGenerates' => $tosGenerates,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreTosGenerateRequest $request): RedirectResponse
    {
        abort_unless(auth()->user()->can('create tos'), 403);

        $validated = $request->validated();
        $module = Module::query()->findOrFail($validated['module_id']);

        abort_unless($this->canAccessModule($module), 403);

        $tos = DB::transaction(function () use ($validated) {
            $tos = TosGenerate::create([
                ...$validated,
                'created_by' => auth()->id(),
                'status' => 'draft',
                'item_distribution' => [],
            ]);

            return $tos;
        });

        return redirect()
            ->route('modules.show', $tos->module_id)
            ->with('success', 'TOS created successfully. Ready to generate questions.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(StoreTosGenerateRequest $request, TosGenerate $tosGenerate): RedirectResponse
    {
        abort_unless(auth()->user()->can('edit tos') && $this->canAccessTos($tosGenerate), 403);
        $tosGenerate->update($request->validated());

        return redirect()
            ->route('modules.show', $tosGenerate->module_id)
            ->with('success', 'TOS updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(TosGenerate $tosGenerate): RedirectResponse
    {
        abort_unless(auth()->user()->can('delete tos') && $this->canAccessTos($tosGenerate), 403);
        $tosGenerate->delete();

        return redirect()
            ->route('tos-generates.index')
            ->with('success', 'TOS deleted successfully.');
    }

    /**
     * Generate AI-powered questions based on TOS (dispatches async job).
     */
    public function generateQuestions(TosGenerate $tosGenerate): RedirectResponse
    {
        abort_unless(auth()->user()->can('generate questions') && $this->canAccessTos($tosGenerate), 403);

        if ($tosGenerate->status === 'generating') {
            return back()->with('error', 'Questions are already being generated.');
        }

        try {
            // Mark as generating immediately
            $tosGenerate->markAsGenerating();

            // Dispatch job to queue for async processing
            GenerateQuestionsJob::dispatch($tosGenerate, auth()->id());

            return redirect()
                ->route('modules.show', $tosGenerate->module_id)
                ->with('success', 'Question generation started! This may take a few minutes. Refresh the page to see progress.');
        } catch (\Exception $e) {
            $tosGenerate->markAsFailed($e->getMessage());

            return back()->with('error', 'Failed to start question generation: '.$e->getMessage());
        }
    }

    /**
     * Display TOS matrix with topic and cognitive level distribution
     */
    public function showMatrix(TosGenerate $tosGenerate): JsonResponse
    {
        abort_unless($this->canAccessTos($tosGenerate), 403);

        $matrix = $this->tosCalculator->generateMatrix($tosGenerate);

        return response()->json([
            'matrix' => $matrix,
            'tos' => $tosGenerate->load(['module.topics.learningObjectives']),
        ]);
    }

    /**
     * Validate TOS balance and distribution
     */
    public function validateTos(TosGenerate $tosGenerate): JsonResponse
    {
        abort_unless($this->canAccessTos($tosGenerate), 403);

        $validation = $this->tosCalculator->validateBalance($tosGenerate);

        return response()->json($validation);
    }

    /**
     * Get TOS distribution statistics
     */
    public function getDistribution(TosGenerate $tosGenerate): JsonResponse
    {
        abort_unless($this->canAccessTos($tosGenerate), 403);

        $cognitiveDistribution = $this->tosCalculator->calculateDistribution($tosGenerate);
        $topicDistribution = $this->tosCalculator->calculateTopicDistribution($tosGenerate);
        $difficultyDistribution = $this->tosCalculator->calculateDifficultyDistribution($tosGenerate);

        return response()->json([
            'cognitive' => $cognitiveDistribution,
            'topics' => $topicDistribution,
            'difficulty' => $difficultyDistribution,
        ]);
    }

    /**
     * Get comprehensive TOS summary
     */
    public function getSummary(TosGenerate $tosGenerate): JsonResponse
    {
        abort_unless($this->canAccessTos($tosGenerate), 403);

        $summary = $this->tosCalculator->generateSummary($tosGenerate);

        return response()->json($summary);
    }

    /**
     * Export TOS to PDF.
     */
    public function exportPdf(TosGenerate $tosGenerate, TosPdfExporter $exporter): HttpResponse
    {
        abort_unless(auth()->user()->can('view tos') && $this->canAccessTos($tosGenerate), 403);

        $pdf = $exporter->export($tosGenerate);
        $filename = $exporter->getFilename($tosGenerate);

        return $pdf->download($filename);
    }

    /**
     * Duplicate a TOS.
     */
    public function duplicate(TosGenerate $tosGenerate): RedirectResponse
    {
        abort_unless(auth()->user()->can('create tos') && $this->canAccessTos($tosGenerate), 403);

        $duplicate = DB::transaction(function () use ($tosGenerate) {
            $newTos = $tosGenerate->replicate();
            $newTos->created_by = auth()->id();
            $newTos->status = 'draft';
            $newTos->subject = $tosGenerate->subject.' (Copy)';
            $newTos->save();

            return $newTos;
        });

        return redirect()
            ->route('modules.show', $duplicate->module_id)
            ->with('success', 'TOS duplicated successfully.');
    }

    private function canAccessTos(TosGenerate $tosGenerate): bool
    {
        return auth()->user()->isAdmin()
            || $tosGenerate->created_by === auth()->id()
            || $tosGenerate->module?->created_by === auth()->id();
    }

    private function canAccessModule(Module $module): bool
    {
        return auth()->user()->isAdmin() || $module->created_by === auth()->id();
    }
}
