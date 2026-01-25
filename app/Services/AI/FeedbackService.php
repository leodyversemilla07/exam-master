<?php

namespace App\Services\AI;

use App\Models\ExamAttempt;
use App\Models\ExamQuestion;
use App\Models\StudentAnswer;
use Illuminate\Support\Facades\Log;
use Prism\Prism\Facades\Prism;
use Prism\Prism\Schema\ObjectSchema;
use Prism\Prism\Schema\StringSchema;

class FeedbackService
{
    protected string $provider;

    protected string $model;

    public function __construct()
    {
        $this->provider = config('app.env') === 'production' ? 'openai' : 'gemini';
        $this->model = $this->provider === 'openai' ? 'gpt-4o-mini' : 'gemini-3-flash-preview';
    }

    /**
     * Generate AI feedback for an entire exam attempt.
     */
    public function generateAttemptFeedback(ExamAttempt $attempt): string
    {
        try {
            $attempt->load(['examSession.exam.module', 'answers.question']);

            $prompt = $this->buildAttemptFeedbackPrompt($attempt);

            $response = Prism::text()
                ->using($this->provider, $this->model)
                ->withPrompt($prompt)
                ->generate();

            $feedback = $response->text;

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

            $response = Prism::text()
                ->using($this->provider, $this->model)
                ->withPrompt($prompt)
                ->generate();

            $feedback = $response->text;

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
            $schema = new ObjectSchema(
                'polished_question',
                'Polished question details',
                [
                    new StringSchema('question', 'The polished question text'),
                    new StringSchema('explanation', 'A clearer explanation'),
                    new StringSchema('rationale', 'Briefly explain the changes made'),
                ],
                ['question', 'explanation', 'rationale']
            );

            $prompt = <<<PROMPT
You are an expert curriculum designer. Polish the following exam question for better grammar, clarity, and educational effectiveness.
Maintain the original meaning and correct answer.

**Current Question:** {$question->question}
**Question Type:** {$question->question_type}
**Explanation:** {$question->explanation}
PROMPT;

            $response = Prism::structured()
                ->using($this->provider, $this->model)
                ->withSchema($schema)
                ->withPrompt($prompt)
                ->generate();

            return $response->structured;
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

    public function useProvider(string $provider, string $model): self
    {
        $this->provider = $provider;
        $this->model = $model;

        return $this;
    }
}
