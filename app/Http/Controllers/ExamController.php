<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreExamQuestionRequest;
use App\Models\ExamQuestion;
use App\Models\Module;
use App\Services\AI\FeedbackService;
use App\Services\Analytics\AnalyticsCacheService;
use App\Services\QuestionDuplicateDetector;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ExamController extends Controller
{
    public function __construct(
        protected QuestionDuplicateDetector $duplicateDetector
    ) {}

    /**
     * Display a listing of exam questions.
     */
    public function index(Request $request): Response
    {
        $query = $this->applyQuestionAccessScope(ExamQuestion::query())
            ->with(['module', 'creator', 'tosGenerate'])
            ->latest();

        // Filter by module
        if ($request->filled('module_id')) {
            $query->where('module_id', $request->module_id);
        }

        // Filter by TOS
        if ($request->filled('tos_generate_id')) {
            $query->where('tos_generate_id', $request->tos_generate_id);
        }

        // Filter by question type
        if ($request->filled('question_type')) {
            $query->where('question_type', $request->question_type);
        }

        // Filter by cognitive level
        if ($request->filled('cognitive_level')) {
            $query->where('cognitive_level', $request->cognitive_level);
        }

        // Filter by difficulty
        if ($request->filled('difficulty')) {
            $query->where('difficulty', $request->difficulty);
        }

        // Filter by approval status
        if ($request->filled('is_approved')) {
            $query->where('is_approved', $request->boolean('is_approved'));
        }

        // Search with sanitized input to prevent LIKE wildcard injection
        if ($request->filled('search')) {
            $search = preg_replace('/[%_]/', '\\\\$0', $request->search);
            $query->where('question', 'like', '%'.$search.'%');
        }

        // Get paginated questions
        $questions = $query->paginate(20)->withQueryString();

        return Inertia::render('question-bank/index', [
            'questions' => $questions,
            'modules' => $this->accessibleModules()->get(['id', 'code', 'name']),
            'filters' => $request->only(['module_id', 'tos_generate_id', 'question_type', 'cognitive_level', 'difficulty', 'is_approved', 'search']),
        ]);
    }

    /**
     * Get a descriptive name for the group.
     */
    private function getGroupName($question): string
    {
        if ($question->tosGenerate) {
            return $question->tosGenerate->subject.' - '.$question->tosGenerate->grade_level.' (TOS #'.$question->tos_generate_id.')';
        }
        if ($question->module) {
            return $question->module->code.' - '.$question->module->name;
        }

        return 'Ungrouped Questions';
    }

    /**
     * Show the form for creating a new question.
     */
    public function create(): Response
    {
        return Inertia::render('question-bank/create', [
            'modules' => $this->accessibleModules()->get(['id', 'code', 'name']),
        ]);
    }

    /**
     * Store a newly created question.
     */
    public function store(StoreExamQuestionRequest $request): RedirectResponse
    {
        abort_unless(auth()->user()->can('create exams'), 403);

        $validated = $request->validated();
        $module = Module::query()->findOrFail($validated['module_id']);

        abort_unless($this->canAccessModule($module), 403);

        $question = ExamQuestion::create([
            ...$validated,
            'created_by' => auth()->id(),
            'is_ai_generated' => false,
        ]);

        // Clear analytics cache when new question is added
        AnalyticsCacheService::clearUsageCache();

        return redirect()
            ->route('question-bank.show', $question)
            ->with('success', 'Question created successfully.');
    }

    /**
     * Display the specified question.
     */
    public function show(ExamQuestion $exam): Response
    {
        abort_unless(auth()->user()->can('view exams') && $this->canAccessQuestion($exam), 403);

        $exam->load(['module', 'creator', 'tosGenerate']);

        return Inertia::render('question-bank/show', [
            'question' => $exam,
            'performance' => $exam->getPerformanceStats(),
        ]);
    }

    /**
     * Calibrate question difficulty based on student performance.
     */
    public function calibrate(ExamQuestion $exam): RedirectResponse
    {
        abort_unless(auth()->user()->can('edit exams') && $this->canAccessQuestion($exam), 403);

        $stats = $exam->getPerformanceStats();

        if ($stats['suggested_difficulty']) {
            $exam->update(['difficulty' => $stats['suggested_difficulty']]);

            return back()->with('success', "Difficulty calibrated to {$stats['suggested_difficulty']} based on student performance.");
        }

        return back()->with('error', 'Not enough student data to calibrate difficulty.');
    }

    /**
     * Show the form for editing the specified question.
     */
    public function edit(ExamQuestion $exam): Response
    {
        abort_unless($this->canAccessQuestion($exam), 403);

        return Inertia::render('question-bank/edit', [
            'question' => $exam,
            'modules' => $this->accessibleModules()->get(['id', 'code', 'name']),
        ]);
    }

    /**
     * Update the specified question.
     */
    public function update(StoreExamQuestionRequest $request, ExamQuestion $exam): RedirectResponse
    {
        abort_unless(auth()->user()->can('edit exams') && $this->canAccessQuestion($exam), 403);

        $exam->update($request->validated());

        return redirect()
            ->route('question-bank.show', $exam)
            ->with('success', 'Question updated successfully.');
    }

    /**
     * Remove the specified question.
     */
    public function destroy(ExamQuestion $exam): RedirectResponse
    {
        abort_unless(auth()->user()->can('delete exams') && $this->canAccessQuestion($exam), 403);
        $exam->delete();

        return redirect()
            ->route('question-bank.index')
            ->with('success', 'Question deleted successfully.');
    }

    /**
     * Approve a question.
     */
    public function approve(ExamQuestion $exam): RedirectResponse
    {
        abort_unless(auth()->user()->can('approve questions') && $this->canAccessQuestion($exam), 403);

        $exam->update(['is_approved' => true]);

        return back()->with('success', 'Question approved successfully.');
    }

    /**
     * Polish a question using AI.
     */
    public function polish(ExamQuestion $exam, FeedbackService $feedbackService): RedirectResponse
    {
        abort_unless(auth()->user()->can('edit exams') && $this->canAccessQuestion($exam), 403);

        try {
            $polished = $feedbackService->polishQuestion($exam);

            $exam->update([
                'question' => $polished['question'],
                'explanation' => $polished['explanation'],
                'ai_metadata' => array_merge($exam->ai_metadata ?? [], [
                    'polished_at' => now()->toIso8601String(),
                    'polish_rationale' => $polished['rationale'],
                ]),
            ]);

            return back()->with('success', 'Question polished successfully.');
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to polish question: '.$e->getMessage());
        }
    }

    /**
     * Bulk delete questions.
     */
    public function bulkDestroy(Request $request): RedirectResponse
    {
        abort_unless(auth()->user()->can('bulk delete questions'), 403);
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:exam_questions,id',
        ]);

        $query = $this->applyQuestionAccessScope(ExamQuestion::query())
            ->whereIn('id', $request->ids);

        abort_unless($query->count() === count($request->ids), 403);

        $query->delete();

        return back()->with('success', count($request->ids).' questions deleted successfully.');
    }

    /**
     * Check for duplicate questions
     */
    public function checkDuplicates(ExamQuestion $question, Request $request): JsonResponse
    {
        abort_unless($this->canAccessQuestion($question), 403);

        $threshold = $request->get('threshold', 0.85);

        $duplicates = $this->duplicateDetector->findDuplicates($question, (float) $threshold);

        return response()->json([
            'question' => $question,
            'duplicates' => $duplicates,
            'is_exact_duplicate' => $this->duplicateDetector->isExactDuplicate($question),
        ]);
    }

    /**
     * Get duplicate statistics for a module
     */
    public function getModuleDuplicates(Module $module): JsonResponse
    {
        abort_unless($this->canAccessModule($module), 403);

        $statistics = $this->duplicateDetector->getModuleStatistics($module->id);

        return response()->json($statistics);
    }

    /**
     * Bulk check for similar questions before storing
     */
    public function bulkCheckDuplicates(Request $request): JsonResponse
    {
        abort_unless(auth()->user()->can('create questions'), 403);

        $request->validate([
            'question_text' => 'required|string',
            'module_id' => 'required|exists:modules,id',
        ]);

        $module = Module::query()->findOrFail($request->module_id);

        abort_unless($this->canAccessModule($module), 403);

        // Create temporary question for comparison
        $tempQuestion = new ExamQuestion([
            'question_text' => $request->question_text,
            'module_id' => $request->module_id,
        ]);

        $similarQuestions = $this->duplicateDetector->findDuplicates($tempQuestion, 0.85);

        return response()->json([
            'has_duplicates' => $similarQuestions->isNotEmpty(),
            'similar_questions' => $similarQuestions,
        ]);
    }

    private function canAccessQuestion(ExamQuestion $question): bool
    {
        return auth()->user()->isAdmin()
            || $question->created_by === auth()->id()
            || $question->module?->created_by === auth()->id();
    }

    private function canAccessModule(Module $module): bool
    {
        return auth()->user()->isAdmin() || $module->created_by === auth()->id();
    }

    private function applyQuestionAccessScope($query)
    {
        return $query->when(! auth()->user()->isAdmin(), fn ($query) => $query->where(fn ($ownedQuery) => $ownedQuery
            ->where('created_by', auth()->id())
            ->orWhereHas('module', fn ($moduleQuery) => $moduleQuery->where('created_by', auth()->id()))));
    }

    private function accessibleModules()
    {
        return Module::query()
            ->where('is_active', true)
            ->when(! auth()->user()->isAdmin(), fn ($query) => $query->where('created_by', auth()->id()));
    }
}
