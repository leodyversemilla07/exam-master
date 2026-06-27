<?php

namespace App\Services\AI;

use App\Ai\Agents\AnswerFeedback;
use App\Ai\Agents\AttemptFeedback;
use App\Ai\Agents\QuestionPolish;
use App\Models\ExamAttempt;
use App\Models\ExamQuestion;
use App\Models\StudentAnswer;
use Illuminate\Support\Facades\Log;

class FeedbackService
{
    /**
     * Generate AI feedback for an entire exam attempt.
     */
    public function generateAttemptFeedback(ExamAttempt $attempt): string
    {
        try {
            $attempt->load(['examSession.exam.module', 'answers.question']);

            $prompt = $this->buildAttemptFeedbackPrompt($attempt);

            $response = (new AttemptFeedback)->prompt($prompt);

            $feedback = (string) $response;

            $metadata = $attempt->metadata ?? [];
            $metadata['ai_feedback'] = $feedback;
            $attempt->update(['metadata' => $metadata]);

            return $feedback;
        } catch (\Exception $e) {
            Log::error('Failed to generate attempt feedback', [
                'attempt_id' => $attempt->id,
                'error' => $e->getMessage(),
            ]);

            return 'Unable to generate AI feedback at this time.';
        }
    }

    /**
     * Generate specific AI feedback for an incorrect answer.
     */
    public function generateAnswerFeedback(StudentAnswer $answer): string
    {
        try {
            $answer->load('question');

            $prompt = $this->buildAnswerFeedbackPrompt($answer);

            $response = (new AnswerFeedback)->prompt($prompt);

            $feedback = (string) $response;

            $answer->update(['feedback' => $feedback]);

            return $feedback;
        } catch (\Exception $e) {
            Log::error('Failed to generate answer feedback', [
                'answer_id' => $answer->id,
                'error' => $e->getMessage(),
            ]);

            return 'Think about the core concept again.';
        }
    }

    /**
     * Polish a question for better grammar and clarity.
     */
    public function polishQuestion(ExamQuestion $question): array
    {
        try {
            $prompt = <<<PROMPT
**Current Question:** {$question->question}
**Question Type:** {$question->question_type}
**Explanation:** {$question->explanation}
PROMPT;

            $response = (new QuestionPolish)->prompt($prompt);

            return [
                'question' => $response['question'],
                'explanation' => $response['explanation'],
                'rationale' => $response['rationale'],
            ];
        } catch (\Exception $e) {
            Log::error('Failed to polish question', [
                'question_id' => $question->id,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    protected function buildAttemptFeedbackPrompt(ExamAttempt $attempt): string
    {
        $exam = $attempt->examSession->exam;
        $module = $exam->module;
        $score = $attempt->score;
        $total = $attempt->total_questions;
        $percentage = $attempt->percentage;

        $summary = $attempt->answers->map(function ($a) {
            return "- Question: {$a->question->question}\n  Correct: ".($a->is_correct ? 'Yes' : 'No')."\n  Student Answer: {$a->answer}";
        })->join("\n\n");

        return <<<PROMPT
You are an encouraging Filipino educator. Provide a brief, constructive summary of the student's performance on the exam "{$exam->title}" for the module "{$module->name}".

**Performance Data:**
- Score: {$score}/{$total} ({$percentage}%)
- Summary of Answers:
{$summary}

**Instructions:**
- Keep it under 150 words.
- Be encouraging but honest.
- Identify one or two key areas for improvement based on the incorrect answers.
- Use a friendly, mentor-like tone typical of a Filipino teacher (English language).
PROMPT;
    }

    protected function buildAnswerFeedbackPrompt(StudentAnswer $answer): string
    {
        $question = $answer->question;

        return <<<PROMPT
You are a helpful tutor. Provide brief, specific feedback to a student who got this question wrong.

**Question:** {$question->question}
**Question Type:** {$question->question_type}
**Correct Answer:** {$question->correct_answer}
**Student's Incorrect Answer:** {$answer->answer}
**Explanation:** {$question->explanation}

**Instructions:**
- Keep it very brief (1-2 sentences).
- Do not just give the correct answer (they already see it).
- Explain *why* their answer might be wrong or guide them toward the correct logic.
- Tone: Supportive and educational.
PROMPT;
    }
}
