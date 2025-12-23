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
            ->latest()
            ->paginate(15);

        return Inertia::render('tos-generates/index', [
            'tosGenerates' => $tosGenerates,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        $modules = Module::query()
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'code', 'name', 'subject_area', 'grade_level', 'pdf_file']);

        return Inertia::render('tos-generates/create', [
            'modules' => $modules,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreTosGenerateRequest $request): RedirectResponse
    {
        abort_unless(auth()->user()->can('create tos'), 403);

        $tos = DB::transaction(function () use ($request) {
            $tos = TosGenerate::create([
                ...$request->validated(),
                'created_by' => auth()->id(),
                'status' => 'draft',
                'item_distribution' => [],
            ]);

            return $tos;
        });

        return redirect()
            ->route('tos-generates.show', $tos)
            ->with('success', 'TOS created successfully. Ready to generate questions.');
    }

    /**
     * Display the specified resource.
     */
    public function show(TosGenerate $tosGenerate): Response
    {
        $tosGenerate->load(['module', 'creator', 'questions' => function ($query) {
            $query->latest();
        }]);

        return Inertia::render('tos-generates/show', [
            'tosGenerate' => $tosGenerate,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(TosGenerate $tosGenerate): Response
    {
        $modules = Module::query()
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'code', 'name', 'subject_area', 'grade_level']);

        return Inertia::render('tos-generates/edit', [
            'tosGenerate' => $tosGenerate->load('module'),
            'modules' => $modules,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(StoreTosGenerateRequest $request, TosGenerate $tosGenerate): RedirectResponse
    {
        abort_unless(auth()->user()->can('edit tos'), 403);
        $tosGenerate->update($request->validated());

        return redirect()
            ->route('tos-generates.show', $tosGenerate)
            ->with('success', 'TOS updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(TosGenerate $tosGenerate): RedirectResponse
    {
        abort_unless(auth()->user()->can('delete tos'), 403);
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
        abort_unless(auth()->user()->can('generate questions'), 403);

        if ($tosGenerate->status === 'generating') {
            return back()->with('error', 'Questions are already being generated.');
        }

        try {
            // Mark as generating immediately
            $tosGenerate->markAsGenerating();

            // Dispatch job to queue for async processing
            GenerateQuestionsJob::dispatch($tosGenerate, auth()->id());

            return redirect()
                ->route('tos-generates.show', $tosGenerate)
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
        $validation = $this->tosCalculator->validateBalance($tosGenerate);

        return response()->json($validation);
    }

    /**
     * Get TOS distribution statistics
     */
    public function getDistribution(TosGenerate $tosGenerate): JsonResponse
    {
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
        $summary = $this->tosCalculator->generateSummary($tosGenerate);

        return response()->json($summary);
    }

    /**
     * Export TOS to PDF.
     */
    public function exportPdf(TosGenerate $tosGenerate, TosPdfExporter $exporter): HttpResponse
    {
        abort_unless(auth()->user()->can('view tos'), 403);

        $pdf = $exporter->export($tosGenerate);
        $filename = $exporter->getFilename($tosGenerate);

        return $pdf->download($filename);
    }

    /**
     * Duplicate a TOS.
     */
    public function duplicate(TosGenerate $tosGenerate): RedirectResponse
    {
        abort_unless(auth()->user()->can('create tos'), 403);

        $duplicate = DB::transaction(function () use ($tosGenerate) {
            $newTos = $tosGenerate->replicate();
            $newTos->created_by = auth()->id();
            $newTos->status = 'draft';
            $newTos->subject = $tosGenerate->subject.' (Copy)';
            $newTos->save();

            return $newTos;
        });

        return redirect()
            ->route('tos-generates.show', $duplicate)
            ->with('success', 'TOS duplicated successfully.');
    }
}
