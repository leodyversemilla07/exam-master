<?php

namespace App\Http\Controllers;

use App\Models\ExamAttempt;
use App\Models\ExamSession;
use App\Models\StudentAnswer;
use App\Services\AI\FeedbackService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StudentExamController extends Controller
{
    public function joinByCode(Request $request): RedirectResponse
    {
        $request->validate([
            'access_code' => ['required', 'string', 'size:8'],
        ]);

        $session = ExamSession::where('access_code', strtoupper($request->access_code))
            ->where('status', 'active')
            ->first();

        if (! $session) {
            return back()->withErrors([
                'access_code' => 'Invalid or inactive exam code.',
            ]);
        }

        if (! $session->isActive()) {
            return back()->withErrors([
                'access_code' => 'This exam is not currently available.',
            ]);
        }

        if (! $session->canUserAttempt(auth()->user())) {
            return back()->withErrors([
                'access_code' => 'You have reached the maximum number of attempts for this exam.',
            ]);
        }

        return redirect()->route('student.exam.start', $session);
    }

    public function showStart(ExamSession $session): Response|RedirectResponse
    {
        $user = auth()->user();

        if (! $session->isActive()) {
            return redirect()->route('dashboard')
                ->with('error', 'This exam is not currently available.');
        }

        if (! $session->canUserAttempt($user)) {
            return redirect()->route('dashboard')
                ->with('error', 'You cannot attempt this exam.');
        }

        $inProgressAttempt = $session->attempts()
            ->where('user_id', $user->id)
            ->where('status', 'in_progress')
            ->first();

        if ($inProgressAttempt) {
            return redirect()->route('student.exam.take', $inProgressAttempt);
        }

        $session->load(['exam.module', 'exam.creator']);
        $previousAttempts = $session->getUserAttempts($user);

        return Inertia::render('student/exam/start', [
            'session' => $session,
            'previousAttempts' => $previousAttempts,
            'canAttempt' => $session->canUserAttempt($user),
        ]);
    }

    public function startAttempt(ExamSession $session): RedirectResponse
    {
        $user = auth()->user();

        if (! $session->canUserAttempt($user)) {
            return back()->withErrors([
                'error' => 'You cannot start a new attempt for this exam.',
            ]);
        }

        $existingInProgress = $session->attempts()
            ->where('user_id', $user->id)
            ->where('status', 'in_progress')
            ->first();

        if ($existingInProgress) {
            return redirect()->route('student.exam.take', $existingInProgress);
        }

        $attemptNumber = $session->attempts()
            ->where('user_id', $user->id)
            ->count() + 1;

        $attempt = ExamAttempt::create([
            'exam_session_id' => $session->id,
            'user_id' => $user->id,
            'attempt_number' => $attemptNumber,
            'started_at' => now(),
            'status' => 'in_progress',
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'total_questions' => $session->exam->questions()->count(),
        ]);

        $questions = $session->exam->questions;
        if ($session->shuffle_questions) {
            $questions = $questions->shuffle();
        }

        foreach ($questions as $question) {
            $pivotData = $question->pivot;
            StudentAnswer::create([
                'exam_attempt_id' => $attempt->id,
                'exam_question_id' => $question->id,
                'max_points' => $pivotData->points ?? $question->points ?? 1,
            ]);
        }

        return redirect()->route('student.exam.take', $attempt);
    }

    public function take(ExamAttempt $attempt): Response|RedirectResponse
    {
        $user = auth()->user();

        if ($attempt->user_id !== $user->id) {
            abort(403);
        }

        if (! $attempt->isInProgress()) {
            return redirect()->route('student.exam.results', $attempt);
        }

        $session = $attempt->examSession;

        if ($this->attemptHasExpired($attempt)) {
            $this->submitAttempt($attempt);

            return redirect()->route('student.exam.results', $attempt);
        }

        $attempt->load([
            'examSession.exam.module',
            'answers.question',
        ]);

        $questions = $attempt->answers->map(function ($answer) use ($session) {
            $question = $answer->question;
            $options = $question->options ?? [];

            if ($session->shuffle_options && in_array($question->question_type, ['multiple_choice', 'matching'])) {
                shuffle($options);
            }

            return [
                'id' => $question->id,
                'question' => $question->question,
                'question_type' => $question->question_type,
                'options' => $options,
                'points' => $answer->max_points,
                'answer_id' => $answer->id,
                'current_answer' => $answer->answer,
                'current_answer_data' => $answer->answer_data,
            ];
        });

        return Inertia::render('student/exam/take', [
            'attempt' => $attempt,
            'questions' => $questions,
            'timeRemaining' => $session->time_limit_minutes ? $attempt->getTimeRemainingSeconds() : null,
        ]);
    }

    public function saveAnswer(Request $request, ExamAttempt $attempt): JsonResponse
    {
        $user = auth()->user();

        if ($attempt->user_id !== $user->id) {
            abort(403);
        }

        if (! $attempt->isInProgress()) {
            return response()->json(['error' => 'Exam already submitted'], 400);
        }

        if ($this->attemptHasExpired($attempt)) {
            $this->submitAttempt($attempt);

            return response()->json([
                'error' => 'Exam time has expired.',
                'redirect_url' => route('student.exam.results', $attempt),
            ], 409);
        }

        $request->validate([
            'answer_id' => ['nullable', 'exists:student_answers,id'],
            'answer' => ['nullable', 'string'],
            'answer_data' => ['nullable', 'array'],
            'is_flagged' => ['nullable', 'boolean'],
            'question_id' => ['nullable', 'exists:exam_questions,id'],
        ]);

        if ($request->has('is_flagged') && $request->has('question_id')) {
            abort_unless($attempt->answers()->where('exam_question_id', $request->integer('question_id'))->exists(), 422);

            $metadata = $attempt->metadata ?? [];
            $flags = $metadata['flagged_questions'] ?? [];

            if ($request->is_flagged) {
                if (! in_array($request->question_id, $flags)) {
                    $flags[] = $request->question_id;
                }
            } else {
                $flags = array_values(array_diff($flags, [$request->question_id]));
            }

            $metadata['flagged_questions'] = $flags;
            $attempt->update(['metadata' => $metadata]);
        }

        if ($request->filled('answer_id')) {
            $answer = StudentAnswer::where('id', $request->answer_id)
                ->where('exam_attempt_id', $attempt->id)
                ->firstOrFail();

            $answer->update([
                'answer' => $request->answer,
                'answer_data' => $request->answer_data,
            ]);
        }

        return response()->json(['success' => true]);
    }

    public function submit(ExamAttempt $attempt): RedirectResponse
    {
        $user = auth()->user();

        if ($attempt->user_id !== $user->id) {
            abort(403);
        }

        if (! $attempt->isInProgress()) {
            return redirect()->route('student.exam.results', $attempt);
        }

        $this->submitAttempt($attempt);

        return redirect()->route('student.exam.results', $attempt);
    }

    public function results(ExamAttempt $attempt, FeedbackService $feedbackService): Response
    {
        $user = auth()->user();

        if ($attempt->user_id !== $user->id) {
            abort(403);
        }

        $session = $attempt->examSession;

        $attempt->load([
            'examSession.exam.module',
            'answers.question',
        ]);

        // Generate AI feedback if it doesn't exist yet
        $aiFeedback = $attempt->metadata['ai_feedback'] ?? null;
        if (! $aiFeedback && ($attempt->isSubmitted() || $attempt->isGraded())) {
            $aiFeedback = $feedbackService->generateAttemptFeedback($attempt);
        }

        $showCorrectAnswers = $session->show_correct_answers
            || $session->isExpired();

        $answers = $attempt->answers->map(function ($answer) use ($showCorrectAnswers, $feedbackService) {
            $question = $answer->question;

            // Generate per-answer feedback for incorrect ones if it doesn't exist
            $feedback = $answer->feedback;
            if (! $feedback && $answer->is_correct === false) {
                $feedback = $feedbackService->generateAnswerFeedback($answer);
            }

            return [
                'id' => $answer->id,
                'question' => $question->question,
                'question_type' => $question->question_type,
                'options' => $question->options,
                'student_answer' => $answer->answer,
                'student_answer_data' => $answer->answer_data,
                'correct_answer' => $showCorrectAnswers ? $question->correct_answer : null,
                'is_correct' => $answer->is_correct,
                'points_earned' => $answer->points_earned,
                'max_points' => $answer->max_points,
                'feedback' => $feedback,
                'explanation' => $showCorrectAnswers ? $question->explanation : null,
            ];
        });

        return Inertia::render('student/exam/results', [
            'attempt' => $attempt,
            'answers' => $answers,
            'showCorrectAnswers' => $showCorrectAnswers,
            'canReview' => $session->allow_review,
            'aiFeedback' => $aiFeedback,
        ]);
    }

    public function history(): Response
    {
        $user = auth()->user();

        $attempts = ExamAttempt::with(['examSession.exam.module'])
            ->where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->paginate(20);

        return Inertia::render('student/exam/history', [
            'attempts' => $attempts,
        ]);
    }

    private function attemptHasExpired(ExamAttempt $attempt): bool
    {
        $session = $attempt->examSession;

        return $session->isExpired()
            || ($session->time_limit_minutes && $attempt->getTimeRemainingSeconds() <= 0);
    }

    private function submitAttempt(ExamAttempt $attempt): void
    {
        if (! $attempt->isInProgress()) {
            return;
        }

        $attempt->loadMissing('answers.question');

        foreach ($attempt->answers as $answer) {
            $answer->autoGrade();
        }

        $attempt->submit();
    }
}
