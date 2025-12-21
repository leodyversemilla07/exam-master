<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreExamRequest;
use App\Models\Exam;
use App\Models\ExamQuestion;
use App\Models\Module;
use App\Models\TosGenerate;
use App\Services\ExamPdfExporter;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

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

        // Search
        if ($request->filled('search')) {
            $query->where('title', 'like', '%'.$request->search.'%');
        }

        $exams = $query->paginate(15)->withQueryString();

        return Inertia::render('exam-builder/index', [
            'exams' => $exams,
            'modules' => Module::where('is_active', true)->get(['id', 'code', 'name']),
            'filters' => $request->only(['module_id', 'status', 'exam_type', 'search']),
        ]);
    }

    /**
     * Show the form for creating a new exam.
     */
    public function create(): Response
    {
        return Inertia::render('exam-builder/create', [
            'modules' => Module::where('is_active', true)->get(['id', 'code', 'name']),
            'tosTemplates' => TosGenerate::where('status', 'completed')
                ->with('module')
                ->latest()
                ->get(),
        ]);
    }

    /**
     * Store a newly created exam.
     */
    public function store(StoreExamRequest $request): RedirectResponse
    {
        abort_unless(auth()->user()->can('create exams'), 403);

        $exam = Exam::create([
            ...$request->validated(),
            'created_by' => auth()->id(),
            'status' => 'draft',
        ]);

        return redirect()
            ->route('exam-builder.show', $exam)
            ->with('success', 'Exam created successfully. Add questions to continue.');
    }

    /**
     * Display the specified exam.
     */
    public function show(Exam $examBuilder): Response
    {
        $examBuilder->load(['module', 'creator', 'tosGenerate', 'questions.module']);

        return Inertia::render('exam-builder/show', [
            'exam' => $examBuilder,
            'availableQuestions' => ExamQuestion::where('module_id', $examBuilder->module_id)
                ->where('is_approved', true)
                ->whereNotIn('id', $examBuilder->questions->pluck('id'))
                ->with('module')
                ->get(),
        ]);
    }

    /**
     * Show the form for editing the specified exam.
     */
    public function edit(Exam $examBuilder): Response
    {
        return Inertia::render('exam-builder/edit', [
            'exam' => $examBuilder->load('module'),
            'modules' => Module::where('is_active', true)->get(['id', 'code', 'name']),
            'tosTemplates' => TosGenerate::where('status', 'completed')
                ->with('module')
                ->latest()
                ->get(),
        ]);
    }

    /**
     * Update the specified exam.
     */
    public function update(StoreExamRequest $request, Exam $examBuilder): RedirectResponse
    {
        abort_unless(auth()->user()->can('edit exams'), 403);

        $examBuilder->update($request->validated());

        return redirect()
            ->route('exam-builder.show', $examBuilder)
            ->with('success', 'Exam updated successfully.');
    }

    /**
     * Remove the specified exam.
     */
    public function destroy(Exam $examBuilder): RedirectResponse
    {
        abort_unless(auth()->user()->can('delete exams'), 403);

        $examBuilder->delete();

        return redirect()
            ->route('exam-builder.index')
            ->with('success', 'Exam deleted successfully.');
    }

    /**
     * Add questions to exam.
     */
    public function addQuestions(Request $request, Exam $exam): RedirectResponse
    {
        abort_unless(auth()->user()->can('edit exams'), 403);

        $request->validate([
            'question_ids' => ['required', 'array'],
            'question_ids.*' => ['exists:exam_questions,id'],
        ]);

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
    public function removeQuestion(Exam $exam, ExamQuestion $question): RedirectResponse
    {
        abort_unless(auth()->user()->can('edit exams'), 403);

        $exam->questions()->detach($question->id);
        $exam->calculateTotals();

        return back()->with('success', 'Question removed successfully.');
    }

    /**
     * Reorder questions in exam.
     */
    public function reorderQuestions(Request $request, Exam $exam): RedirectResponse
    {
        abort_unless(auth()->user()->can('edit exams'), 403);

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
    public function updateQuestionPoints(Request $request, Exam $exam, ExamQuestion $question): RedirectResponse
    {
        abort_unless(auth()->user()->can('edit exams'), 403);

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
    public function publish(Exam $exam): RedirectResponse
    {
        abort_unless(auth()->user()->can('approve questions'), 403);

        if ($exam->questions()->count() === 0) {
            return back()->with('error', 'Cannot publish an exam with no questions.');
        }

        $exam->update(['status' => 'published']);

        return back()->with('success', 'Exam published successfully.');
    }

    /**
     * Duplicate an exam.
     */
    public function duplicate(Exam $exam): RedirectResponse
    {
        abort_unless(auth()->user()->can('create exams'), 403);

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
            ->route('exam-builder.show', $newExam)
            ->with('success', 'Exam duplicated successfully.');
    }

    /**
     * Export exam to PDF.
     */
    public function exportPdf(Exam $exam, ExamPdfExporter $exporter): HttpResponse
    {
        abort_unless(auth()->user()->can('view exams'), 403);

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
    public function exportPdfWithAnswers(Exam $exam, ExamPdfExporter $exporter): HttpResponse
    {
        abort_unless(auth()->user()->can('view exams'), 403);

        if ($exam->questions()->count() === 0) {
            abort(400, 'Cannot export an exam with no questions.');
        }

        $pdf = $exporter->exportWithAnswerKey($exam);
        $filename = $exporter->getFilename($exam, true);

        return $pdf->download($filename);
    }
}
