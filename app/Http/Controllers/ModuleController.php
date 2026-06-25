<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreModuleRequest;
use App\Models\ExamQuestion;
use App\Models\ExamSession;
use App\Models\Module;
use App\Services\AI\ModuleExtractorService;
use App\Services\AI\TosExtractorService;
use App\Services\QuestionDuplicateDetector;
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
    public function extractTosFromModule(Module $module, TosExtractorService $extractor): RedirectResponse
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
     * Display the module workspace.
     */
    public function show(Module $module, QuestionDuplicateDetector $duplicateDetector): Response
    {
        $module->load(['creator', 'tosGenerates']);
        $module->loadCount(['questions', 'exams']);

        $questions = $module->questions()
            ->with('module')
            ->latest()
            ->paginate(15);

        $exams = $module->exams()
            ->with('creator')
            ->withCount('questions')
            ->latest()
            ->get();

        // Full flat topics list (for Topics tab & parent selects)
        $allTopics = $module->topics()
            ->with(['learningObjectives' => fn ($q) => $q->where('is_active', true)->orderBy('order'), 'parent'])
            ->withCount('learningObjectives')
            ->orderBy('order')
            ->get();

        // Sidebar tree (root topics with children + objective counts only)
        $topics = $module->rootTopics()
            ->with(['children' => fn ($q) => $q->withCount('learningObjectives')])
            ->withCount('learningObjectives')
            ->get();

        // Workflow state: latest TOS (any status) with its generated questions
        $latestTos = $module->tosGenerates()
            ->with('questions')
            ->latest()
            ->first();

        // Workflow state: latest exam linked to this module with its questions
        $latestExam = $module->exams()
            ->with(['questions' => fn ($q) => $q->select('exam_questions.id', 'exam_questions.question', 'exam_questions.question_type', 'exam_questions.difficulty', 'exam_questions.cognitive_level', 'exam_questions.points', 'exam_questions.is_approved', 'exam_questions.module_id')])
            ->latest()
            ->first();

        // Available (approved) questions for exam assembly step
        $availableQuestions = $module->questions()
            ->where('is_approved', true)
            ->select('id', 'question', 'question_type', 'difficulty', 'cognitive_level', 'points', 'is_approved', 'module_id')
            ->get();

        // Exam sessions scoped to this module's exams
        $examIds = $module->exams()->pluck('id');
        $sessions = ExamSession::whereIn('exam_id', $examIds)
            ->with(['exam', 'creator'])
            ->withCount('attempts')
            ->latest()
            ->get();

        // TOS Calculator data
        $tosMatrix = [];
        $tosDistributionRaw = [
            'remembering' => 0, 'understanding' => 0, 'applying' => 0,
            'analyzing' => 0, 'evaluating' => 0, 'creating' => 0,
        ];

        foreach ($allTopics->whereNull('parent_id') as $topic) {
            $row = [
                'topic_id' => $topic->id, 'topic_code' => $topic->code,
                'topic_title' => $topic->title, 'remembering' => 0, 'understanding' => 0,
                'applying' => 0, 'analyzing' => 0, 'evaluating' => 0, 'creating' => 0,
                'total' => 0, 'percentage' => 0,
            ];
            foreach ($topic->learningObjectives as $objective) {
                $row[$objective->cognitive_level]++;
                $row['total']++;
                $tosDistributionRaw[$objective->cognitive_level]++;
            }
            $tosMatrix[] = $row;
        }

        $tosTotalObjectives = array_sum($tosDistributionRaw);

        if ($tosTotalObjectives > 0) {
            foreach ($tosMatrix as &$row) {
                $row['percentage'] = ($row['total'] / $tosTotalObjectives) * 100;
            }
        }

        $tosDistribution = array_map(fn ($level, $count) => [
            'cognitive_level' => $level,
            'count' => $count,
            'percentage' => $tosTotalObjectives > 0 ? ($count / $tosTotalObjectives) * 100 : 0,
        ], array_keys($tosDistributionRaw), $tosDistributionRaw);

        $tosStatistics = [
            'total_objectives' => $tosTotalObjectives,
            'total_topics' => count($tosMatrix),
            'average_per_topic' => count($tosMatrix) > 0 ? $tosTotalObjectives / count($tosMatrix) : 0,
        ];

        $tosBalance = array_map(fn ($level, $count) => [
            'level' => $level, 'count' => $count, 'ideal_min' => 10, 'ideal_max' => 25,
            'status' => $tosTotalObjectives > 0
                ? (($count / $tosTotalObjectives * 100) < 10 ? 'under' : (($count / $tosTotalObjectives * 100) > 25 ? 'over' : 'balanced'))
                : 'under',
        ], array_keys($tosDistributionRaw), $tosDistributionRaw);

        // Duplicate detection data
        $moduleQuestions = ExamQuestion::where('module_id', $module->id)
            ->where('is_approved', true)
            ->get();

        $duplicates = [];
        $duplicateStats = [
            'total_questions' => $moduleQuestions->count(),
            'duplicate_groups' => 0,
            'highest_similarity' => 0,
            'questions_with_duplicates' => 0,
        ];
        $processedPairs = [];

        foreach ($moduleQuestions as $question) {
            $matches = $duplicateDetector->findDuplicates($question, 60.0);
            if ($matches->isNotEmpty()) {
                $duplicateGroup = ['question' => $question, 'matches' => []];
                foreach ($matches as $match) {
                    $pairKey = implode('-', [min($question->id, $match['question']->id), max($question->id, $match['question']->id)]);
                    if (in_array($pairKey, $processedPairs)) {
                        continue;
                    }
                    $processedPairs[] = $pairKey;
                    $duplicateGroup['matches'][] = [
                        'question' => $match['question'],
                        'similarity_score' => $match['similarity_score'],
                        'matching_aspects' => $match['matching_aspects'],
                    ];
                    if ($match['similarity_score'] > $duplicateStats['highest_similarity']) {
                        $duplicateStats['highest_similarity'] = $match['similarity_score'];
                    }
                }
                if (! empty($duplicateGroup['matches'])) {
                    $duplicates[] = $duplicateGroup;
                    $duplicateStats['questions_with_duplicates']++;
                }
            }
        }

        $duplicateStats['duplicate_groups'] = count($duplicates);

        return Inertia::render('modules/show', [
            'module' => $module,
            'questions' => $questions,
            'exams' => $exams,
            'topics' => $topics,
            'allTopics' => $allTopics,
            'latestTos' => $latestTos,
            'latestExam' => $latestExam,
            'availableQuestions' => $availableQuestions,
            'sessions' => $sessions,
            'tosMatrix' => $tosMatrix,
            'tosDistribution' => $tosDistribution,
            'tosStatistics' => $tosStatistics,
            'tosBalance' => $tosBalance,
            'duplicates' => $duplicates,
            'duplicateStats' => $duplicateStats,
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
