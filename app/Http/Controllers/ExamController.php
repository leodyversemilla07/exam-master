<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreExamQuestionRequest;
use App\Models\ExamQuestion;
use App\Models\Module;
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
        $query = ExamQuestion::query()
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

        // Search
        if ($request->filled('search')) {
            $query->where('question', 'like', '%'.$request->search.'%');
        }

        // Get all questions matching filters (no pagination for grouping)
        $allQuestions = $query->get();

        // Group questions by module or TOS
        $groupedQuestions = $allQuestions->groupBy(function ($question) {
            // Prefer grouping by TOS if available, otherwise by module
            if ($question->tosGenerate) {
                return 'tos_'.$question->tos_generate_id;
            }
            if ($question->module) {
                return 'module_'.$question->module_id;
            }
            return 'ungrouped';
        })->map(function ($questions, $key) {
            $firstQuestion = $questions->first();
            
            return [
                'key' => $key,
                'type' => str_starts_with($key, 'tos_') ? 'tos' : (str_starts_with($key, 'module_') ? 'module' : 'ungrouped'),
                'group_name' => $this->getGroupName($firstQuestion),
                'module' => $firstQuestion->module,
                'tos' => $firstQuestion->tosGenerate,
                'count' => $questions->count(),
                'questions' => $questions->values(),
            ];
        })->values();

        return Inertia::render('exams/index', [
            'groupedQuestions' => $groupedQuestions,
            'totalQuestions' => $allQuestions->count(),
            'modules' => Module::where('is_active', true)->get(['id', 'code', 'name']),
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
     * Display questions for a specific TOS.
     */
    public function byTos(Request $request, $tosGenerateId): Response
    {
        $tosGenerate = \App\Models\TosGenerate::findOrFail($tosGenerateId);
        
        $query = ExamQuestion::query()
            ->with(['module', 'creator', 'tosGenerate'])
            ->where('tos_generate_id', $tosGenerateId)
            ->latest();

        // Apply additional filters
        if ($request->filled('question_type')) {
            $query->where('question_type', $request->question_type);
        }

        if ($request->filled('cognitive_level')) {
            $query->where('cognitive_level', $request->cognitive_level);
        }

        if ($request->filled('difficulty')) {
            $query->where('difficulty', $request->difficulty);
        }

        if ($request->filled('search')) {
            $query->where('question', 'like', '%'.$request->search.'%');
        }

        $questions = $query->paginate(20)->withQueryString();

        return Inertia::render('exams/by-group', [
            'questions' => $questions,
            'groupType' => 'tos',
            'groupInfo' => [
                'id' => $tosGenerate->id,
                'name' => $tosGenerate->subject.' - '.$tosGenerate->grade_level,
                'subject' => $tosGenerate->subject,
                'grade_level' => $tosGenerate->grade_level,
            ],
            'filters' => $request->only(['question_type', 'cognitive_level', 'difficulty', 'search']),
        ]);
    }

    /**
     * Display questions for a specific module.
     */
    public function byModule(Request $request, $moduleId): Response
    {
        $module = Module::findOrFail($moduleId);
        
        $query = ExamQuestion::query()
            ->with(['module', 'creator', 'tosGenerate'])
            ->where('module_id', $moduleId)
            ->latest();

        // Apply additional filters
        if ($request->filled('question_type')) {
            $query->where('question_type', $request->question_type);
        }

        if ($request->filled('cognitive_level')) {
            $query->where('cognitive_level', $request->cognitive_level);
        }

        if ($request->filled('difficulty')) {
            $query->where('difficulty', $request->difficulty);
        }

        if ($request->filled('search')) {
            $query->where('question', 'like', '%'.$request->search.'%');
        }

        $questions = $query->paginate(20)->withQueryString();

        return Inertia::render('exams/by-group', [
            'questions' => $questions,
            'groupType' => 'module',
            'groupInfo' => [
                'id' => $module->id,
                'name' => $module->name,
                'code' => $module->code,
            ],
            'filters' => $request->only(['question_type', 'cognitive_level', 'difficulty', 'search']),
        ]);
    }

    /**
     * Show the form for creating a new question.
     */
    public function create(): Response
    {
        return Inertia::render('exams/create', [
            'modules' => Module::where('is_active', true)->get(['id', 'code', 'name']),
        ]);
    }

    /**
     * Show the form for creating a new question from a specific TOS.
     */
    public function createFromTos($tosGenerateId): Response
    {
        $tosGenerate = \App\Models\TosGenerate::with('module')->findOrFail($tosGenerateId);
        
        return Inertia::render('exams/create', [
            'modules' => Module::where('is_active', true)->get(['id', 'code', 'name']),
            'from_group' => 'tos',
            'from_group_id' => $tosGenerate->id,
            'from_group_name' => $tosGenerate->title,
            'from_tos' => [
                'id' => $tosGenerate->id,
                'title' => $tosGenerate->title,
                'module' => [
                    'id' => $tosGenerate->module->id,
                    'code' => $tosGenerate->module->code,
                    'name' => $tosGenerate->module->name,
                ],
            ],
        ]);
    }

    /**
     * Store a newly created question.
     */
    public function store(StoreExamQuestionRequest $request): RedirectResponse
    {
        abort_unless(auth()->user()->can('create exams'), 403);

        $question = ExamQuestion::create([
            ...$request->validated(),
            'created_by' => auth()->id(),
            'is_ai_generated' => false,
        ]);

        return redirect()
            ->route('exams.show', $question)
            ->with('success', 'Question created successfully.');
    }

    /**
     * Display the specified question.
     */
    public function show(ExamQuestion $exam): Response
    {
        $exam->load(['module', 'creator', 'tosGenerate']);

        return Inertia::render('exams/show', [
            'question' => $exam,
        ]);
    }

    /**
     * Show the form for editing the specified question.
     */
    public function edit(ExamQuestion $exam): Response
    {
        return Inertia::render('exams/edit', [
            'question' => $exam,
            'modules' => Module::where('is_active', true)->get(['id', 'code', 'name']),
        ]);
    }

    /**
     * Update the specified question.
     */
    public function update(StoreExamQuestionRequest $request, ExamQuestion $exam): RedirectResponse
    {
        abort_unless(auth()->user()->can('edit exams'), 403);

        $exam->update($request->validated());

        return redirect()
            ->route('exams.show', $exam)
            ->with('success', 'Question updated successfully.');
    }

    /**
     * Remove the specified question.
     */
    public function destroy(ExamQuestion $exam): RedirectResponse
    {
        abort_unless(auth()->user()->can('delete exams'), 403);
        $exam->delete();

        return redirect()
            ->route('exams.index')
            ->with('success', 'Question deleted successfully.');
    }

    /**
     * Approve a question.
     */
    public function approve(ExamQuestion $exam): RedirectResponse
    {
        abort_unless(auth()->user()->can('approve questions'), 403);

        $exam->update(['is_approved' => true]);

        return back()->with('success', 'Question approved successfully.');
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

        ExamQuestion::whereIn('id', $request->ids)->delete();

        return back()->with('success', count($request->ids).' questions deleted successfully.');
    }

    /**
     * Check for duplicate questions
     */
    public function checkDuplicates(ExamQuestion $question, Request $request): JsonResponse
    {
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
}
