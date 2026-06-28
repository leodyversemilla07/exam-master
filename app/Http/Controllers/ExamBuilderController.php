<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreExamRequest;
use App\Models\Exam;
use App\Models\ExamQuestion;
use App\Models\Module;
use App\Services\Analytics\AnalyticsCacheService;
use App\Services\ExamPdfExporter;
use App\Services\ExamWordExporter;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class ExamBuilderController extends Controller
{
    /**
     * Display a listing of exams.
     */
    public function index(Request $request): Response
    {
        $query = Exam::query()
            ->with(['module', 'creator', 'tosGenerate'])
            ->withCount('questions')
            ->when(! auth()->user()->isAdmin(), fn ($query) => $query->where(fn ($ownedQuery) => $ownedQuery
                ->where('created_by', auth()->id())
                ->orWhereHas('collaborators', fn ($collaborators) => $collaborators->where('user_id', auth()->id()))))
            ->latest();

        // Filter by module
        if ($request->filled('module_id')) {
            $query->where('module_id', $request->module_id);
        }

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter by exam type
        if ($request->filled('exam_type')) {
            $query->where('exam_type', $request->exam_type);
        }

        // Search with sanitized input to prevent LIKE wildcard injection
        if ($request->filled('search')) {
            $search = preg_replace('/[%_]/', '\\\\$0', $request->search);
            $query->where('title', 'like', '%'.$search.'%');
        }

        $exams = $query->paginate(15)->withQueryString();

        return Inertia::render('exam-builder/index', [
            'exams' => $exams,
            'modules' => Module::query()
                ->where('is_active', true)
                ->when(! auth()->user()->isAdmin(), fn ($query) => $query->where('created_by', auth()->id()))
                ->get(['id', 'code', 'name']),
            'filters' => $request->only(['module_id', 'status', 'exam_type', 'search']),
        ]);
    }

    /**
     * Store a newly created exam.
     */
    public function store(StoreExamRequest $request): RedirectResponse
    {
        abort_unless(auth()->user()->can('create exams'), 403);

        $validated = $request->validated();
        $module = Module::query()->findOrFail($validated['module_id']);

        abort_unless($this->canAccessModule($module), 403);

        $exam = Exam::create([
            ...$validated,
            'created_by' => auth()->id(),
            'status' => 'draft',
        ]);

        // Clear analytics cache when new exam is created
        AnalyticsCacheService::clearExamsCache();
        AnalyticsCacheService::clearEducatorCache();

        return redirect()
            ->route('modules.show', $exam->module_id)
            ->with('success', 'Exam created successfully. Add questions to continue.');
    }

    /**
     * Update the specified exam.
     */
    public function update(StoreExamRequest $request, Exam $examBuilder): RedirectResponse
    {
        abort_unless(
            auth()->user()->isAdmin() || $this->canEditExam($examBuilder),
            403
        );

        $examBuilder->update($request->validated());

        return redirect()
            ->route('modules.show', $examBuilder->module_id)
            ->with('success', 'Exam updated successfully.');
    }

    /**
     * Check if user can access exam as owner or collaborator
     */
    private function canAccessExam(Exam $exam): bool
    {
        $userId = auth()->id();

        // Owner can always access
        if ($userId === $exam->created_by) {
            return true;
        }

        // Check if user is a collaborator
        return $exam->collaborators()->where('user_id', $userId)->exists();
    }

    /**
     * Check if user can edit exam as owner or editor collaborator
     */
    private function canEditExam(Exam $exam): bool
    {
        $userId = auth()->id();

        // Owner can always edit
        if ($userId === $exam->created_by) {
            return true;
        }

        // Check if user is an editor collaborator
        return $exam->collaborators()
            ->where('user_id', $userId)
            ->where('exam_collaborators.role', 'editor')
            ->exists();
    }

    private function canAccessModule(Module $module): bool
    {
        return auth()->user()->isAdmin() || $module->created_by === auth()->id();
    }

    /**
     * Remove the specified exam.
     */
    public function destroy(Exam $examBuilder): RedirectResponse
    {
        // Allow deletion if user has permission, is the creator, OR has delete permission as collaborator
        $isCollaborator = $examBuilder->collaborators()
            ->where('user_id', auth()->id())
            ->where('can_delete', true)
            ->exists();

        abort_unless(
            auth()->user()->isAdmin() ||
            auth()->id() === $examBuilder->created_by ||
            $isCollaborator,
            403
        );

        $examBuilder->delete();

        return redirect()
            ->route('exam-builder.index')
            ->with('success', 'Exam deleted successfully.');
    }

    /**
     * Add questions to exam.
     */
    public function addQuestions(Request $request, $examId): RedirectResponse
    {
        $exam = Exam::findOrFail($examId);

        abort_unless(
            auth()->user()->isAdmin() || $this->canEditExam($exam),
            403
        );

        $request->validate([
            'question_ids' => ['required', 'array'],
            'question_ids.*' => ['exists:exam_questions,id'],
        ]);

        $validQuestionCount = ExamQuestion::query()
            ->whereIn('id', $request->question_ids)
            ->where('module_id', $exam->module_id)
            ->count();

        abort_unless($validQuestionCount === count($request->question_ids), 422);

        $order = $exam->questions()->max('order') ?? 0;

        foreach ($request->question_ids as $questionId) {
            $order++;
            $question = ExamQuestion::find($questionId);

            $exam->questions()->attach($questionId, [
                'order' => $order,
                'points' => $question->points ?? 1,
            ]);
        }

        $exam->calculateTotals();

        return back()->with('success', 'Questions added successfully.');
    }

    /**
     * Remove question from exam.
     */
    public function removeQuestion($examId, $questionId): RedirectResponse
    {
        $exam = Exam::findOrFail($examId);
        $question = ExamQuestion::findOrFail($questionId);

        abort_unless(
            (auth()->user()->isAdmin() || $this->canEditExam($exam)) && $question->module_id === $exam->module_id,
            403
        );

        $exam->questions()->detach($question->id);
        $exam->calculateTotals();

        return back()->with('success', 'Question removed successfully.');
    }

    /**
     * Reorder questions in exam.
     */
    public function reorderQuestions(Request $request, $examId): RedirectResponse
    {
        $exam = Exam::findOrFail($examId);

        abort_unless(
            auth()->user()->isAdmin() || $this->canEditExam($exam),
            403
        );

        $request->validate([
            'questions' => ['required', 'array'],
            'questions.*.id' => ['required', 'exists:exam_questions,id'],
            'questions.*.order' => ['required', 'integer', 'min:1'],
        ]);

        DB::transaction(function () use ($request, $exam) {
            foreach ($request->questions as $question) {
                $exam->questions()->updateExistingPivot($question['id'], [
                    'order' => $question['order'],
                ]);
            }
        });

        return back()->with('success', 'Questions reordered successfully.');
    }

    /**
     * Update question points in exam.
     */
    public function updateQuestionPoints(Request $request, $examId, $questionId): RedirectResponse
    {
        $exam = Exam::findOrFail($examId);
        $question = ExamQuestion::findOrFail($questionId);

        abort_unless(
            (auth()->user()->isAdmin() || $this->canEditExam($exam)) && $question->module_id === $exam->module_id,
            403
        );

        $request->validate([
            'points' => ['required', 'integer', 'min:1'],
        ]);

        $exam->questions()->updateExistingPivot($question->id, [
            'points' => $request->points,
        ]);

        $exam->calculateTotals();

        return back()->with('success', 'Question points updated successfully.');
    }

    /**
     * Publish exam (change status to published).
     */
    public function publish($examId): RedirectResponse
    {
        $exam = Exam::findOrFail($examId);

        abort_unless(auth()->user()->can('publish exams') && (auth()->user()->isAdmin() || $this->canEditExam($exam)), 403);

        if ($exam->questions()->count() === 0) {
            return back()->with('error', 'Cannot publish an exam with no questions.');
        }

        $exam->update(['status' => 'published']);

        return back()->with('success', 'Exam published successfully.');
    }

    /**
     * Duplicate an exam.
     */
    public function duplicate($examId): RedirectResponse
    {
        $exam = Exam::findOrFail($examId);

        abort_unless(auth()->user()->can('create exams') && (auth()->user()->isAdmin() || $this->canAccessExam($exam)), 403);

        $newExam = $exam->replicate();
        $newExam->title = $exam->title.' (Copy)';
        $newExam->status = 'draft';
        $newExam->created_by = auth()->id();
        $newExam->save();

        // Copy questions with their pivot data
        foreach ($exam->questions as $question) {
            $newExam->questions()->attach($question->id, [
                'order' => $question->pivot->order,
                'points' => $question->pivot->points,
                'section' => $question->pivot->section,
            ]);
        }

        $newExam->calculateTotals();

        return redirect()
            ->route('modules.show', $newExam->module_id)
            ->with('success', 'Exam duplicated successfully.');
    }

    /**
     * Export exam to PDF.
     */
    public function exportPdf($examId, ExamPdfExporter $exporter): HttpResponse
    {
        $exam = Exam::findOrFail($examId);

        abort_unless(auth()->user()->can('view exams') && (auth()->user()->isAdmin() || $this->canAccessExam($exam)), 403);

        if ($exam->questions()->count() === 0) {
            abort(400, 'Cannot export an exam with no questions.');
        }

        $pdf = $exporter->export($exam, false);
        $filename = $exporter->getFilename($exam, false);

        return $pdf->download($filename);
    }

    /**
     * Export exam to PDF with answer key.
     */
    public function exportPdfWithAnswers($examId, ExamPdfExporter $exporter): HttpResponse
    {
        $exam = Exam::findOrFail($examId);

        abort_unless(auth()->user()->can('view exams') && (auth()->user()->isAdmin() || $this->canAccessExam($exam)), 403);

        if ($exam->questions()->count() === 0) {
            abort(400, 'Cannot export an exam with no questions.');
        }

        $pdf = $exporter->exportWithAnswerKey($exam);
        $filename = $exporter->getFilename($exam, true);

        return $pdf->download($filename);
    }

    /**
     * Export exam to Word (.docx) format.
     */
    public function exportDocx($examId, ExamWordExporter $exporter): BinaryFileResponse
    {
        $exam = Exam::findOrFail($examId);
        abort_unless(auth()->user()->can('view exams') && (auth()->user()->isAdmin() || $this->canAccessExam($exam)), 403);

        if ($exam->questions()->count() === 0) {
            abort(400, 'Cannot export an exam with no questions.');
        }

        $path = $exporter->export($exam);

        return response()->download($path, $exporter->getFilename($exam))->deleteFileAfterSend();
    }

    /**
     * Export exam with answer key to Word (.docx) format.
     */
    public function exportDocxWithAnswers($examId, ExamWordExporter $exporter): BinaryFileResponse
    {
        $exam = Exam::findOrFail($examId);
        abort_unless(auth()->user()->can('view exams') && (auth()->user()->isAdmin() || $this->canAccessExam($exam)), 403);

        if ($exam->questions()->count() === 0) {
            abort(400, 'Cannot export an exam with no questions.');
        }

        $path = $exporter->export($exam, true);

        return response()->download($path, $exporter->getFilename($exam, true))->deleteFileAfterSend();
    }

    /**
     * Archive an exam.
     */
    public function archive($examId): RedirectResponse
    {
        $exam = Exam::findOrFail($examId);

        abort_unless(auth()->user()->can('edit exams') && (auth()->user()->isAdmin() || $this->canEditExam($exam)), 403);

        $exam->update(['status' => 'archived']);

        return back()->with('success', 'Exam archived successfully.');
    }

    /**
     * Unarchive an exam.
     */
    public function unarchive($examId): RedirectResponse
    {
        $exam = Exam::findOrFail($examId);

        abort_unless(auth()->user()->can('edit exams') && (auth()->user()->isAdmin() || $this->canEditExam($exam)), 403);

        $exam->update(['status' => 'draft']);

        return back()->with('success', 'Exam unarchived successfully.');
    }

    /**
     * Preview the exam in web format.
     */
    public function preview($examId): Response
    {
        $exam = Exam::with(['module', 'examTemplate', 'questions' => function ($query) {
            $query->orderBy('exam_items.order');
        }])->findOrFail($examId);

        abort_unless(auth()->user()->can('view exams') && (auth()->user()->isAdmin() || $this->canAccessExam($exam)), 403);

        $template = null;
        if ($exam->examTemplate) {
            $placeholders = [
                '{{school_name}}' => 'Your School Name',
                '{{exam_title}}' => $exam->title,
                '{{student_name}}' => '____________________',
                '{{date}}' => now()->format('F j, Y'),
                '{{score}}' => '___ / '.($exam->total_points ?? 0),
            ];

            $header = $exam->examTemplate->header_content;
            $footer = $exam->examTemplate->footer_content;

            foreach ($placeholders as $key => $value) {
                $header = str_replace($key, $value, $header ?? '');
                $footer = str_replace($key, $value, $footer ?? '');
            }

            $template = [
                'header' => $header,
                'footer' => $footer,
                'styles' => $exam->examTemplate->custom_styles,
            ];
        }

        return Inertia::render('exam-builder/preview', [
            'exam' => $exam,
            'template' => $template,
        ]);
    }
}
