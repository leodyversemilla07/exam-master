<?php

namespace App\Http\Controllers;

use App\Models\ExamAttempt;
use App\Models\ExamSession;
use App\Models\StudentAnswer;
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

        if ($session->time_limit_minutes && $attempt->getTimeRemainingSeconds() <= 0) {
            $attempt->submit();

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

        $request->validate([
            'answer_id' => ['required', 'exists:student_answers,id'],
            'answer' => ['nullable', 'string'],
            'answer_data' => ['nullable', 'array'],
        ]);

        $answer = StudentAnswer::where('id', $request->answer_id)
            ->where('exam_attempt_id', $attempt->id)
            ->firstOrFail();

        $answer->update([
            'answer' => $request->answer,
            'answer_data' => $request->answer_data,
        ]);

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

        foreach ($attempt->answers as $answer) {
            $answer->autoGrade();
        }

        $attempt->submit();

        return redirect()->route('student.exam.results', $attempt);
    }

    public function results(ExamAttempt $attempt): Response
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

        $showCorrectAnswers = $session->show_correct_answers
            || $session->isExpired();

        $answers = $attempt->answers->map(function ($answer) use ($showCorrectAnswers) {
            $question = $answer->question;

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
                'feedback' => $answer->feedback,
                'explanation' => $showCorrectAnswers ? $question->explanation : null,
            ];
        });

        return Inertia::render('student/exam/results', [
            'attempt' => $attempt,
            'answers' => $answers,
            'showCorrectAnswers' => $showCorrectAnswers,
            'canReview' => $session->allow_review,
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
}
