<?php

namespace App\Services\AI;

use App\Models\Module;
use App\Models\TosGenerate;
use Illuminate\Support\Facades\Log;
use Prism\Prism\Facades\Prism;
use Prism\Prism\Schema\ArraySchema;
use Prism\Prism\Schema\ObjectSchema;
use Prism\Prism\Schema\StringSchema;

class QuestionGeneratorService
{
    protected string $provider;

    protected string $model;

    public function __construct()
    {
        $this->provider = config('app.env') === 'production' ? 'openai' : 'gemini';
        $this->model = $this->provider === 'openai' ? 'gpt-4o-mini' : 'gemini-3-flash-preview';
    }

    /**
     * Generate exam questions based on TOS specifications.
     */
    public function generateQuestions(TosGenerate $tos): array
    {
        // Allow up to 5 minutes for generation (job handles overall timeout)
        set_time_limit(300);

        try {
            $module = $tos->module;

            $prompt = $this->buildPrompt($tos, $module);

            $response = Prism::structured()
                ->using($this->provider, $this->model)
                ->withPrompt($prompt)
                ->withSchema($this->getQuestionSchema())
                ->withMaxTokens(4096)
                ->withTimeout(180) // 3 minutes for API call
                ->asStructured();

            return $response->structured;
        } catch (\Exception $e) {
            Log::error('Question generation failed', [
                'tos_id' => $tos->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }

    /**
     * Build the AI prompt from TOS data.
     */
    protected function buildPrompt(TosGenerate $tos, Module $module): string
    {
        $objectives = collect($tos->learning_objectives)
            ->map(fn ($obj) => "- {$obj['code']}: {$obj['description']}")
            ->join("\n");

        $cognitiveDistribution = collect($tos->cognitive_levels)
            ->map(fn ($count, $level) => "- {$level}: {$count} items")
            ->join("\n");

        return <<<PROMPT
You are an expert educational assessment creator for Filipino students in {$tos->grade_level}.

**Subject:** {$tos->subject}
**Module:** {$module->name} ({$module->code})
**Quarter:** {$tos->quarter}
**Total Items:** {$tos->total_items}

**Learning Objectives:**
{$objectives}

**Cognitive Level Distribution (Bloom's Taxonomy):**
{$cognitiveDistribution}

**Instructions:**
- Generate exactly {$tos->total_items} {$tos->question_type} questions
- Follow the cognitive level distribution strictly
- Difficulty: {$tos->difficulty_level}
- Ensure questions are culturally appropriate for Filipino students
- Use clear, simple language appropriate for {$tos->grade_level}
- Each question must align with one of the learning objectives
".($tos->additional_instructions ? "\n- Additional Requirements: {$tos->additional_instructions}" : '')."

Generate the questions now.
PROMPT;
    }

    /**
     * Define the structured output schema for questions.
     */
    protected function getQuestionSchema(): ObjectSchema
    {
        return new ObjectSchema(
            name: 'exam_questions',
            description: 'Generated exam questions based on TOS',
            properties: [
                new ArraySchema(
                    name: 'questions',
                    description: 'Array of generated questions',
                    items: new ObjectSchema(
                        name: 'question',
                        description: 'Individual question with metadata',
                        properties: [
                            new StringSchema(
                                name: 'question',
                                description: 'The question text'
                            ),
                            new ArraySchema(
                                name: 'options',
                                description: 'Multiple choice options (if applicable)',
                                items: new ObjectSchema(
                                    name: 'option',
                                    description: 'Answer option',
                                    properties: [
                                        new StringSchema('key', 'Option key (A, B, C, D)'),
                                        new StringSchema('text', 'Option text'),
                                    ],
                                    requiredFields: ['key', 'text']
                                )
                            ),
                            new StringSchema(
                                name: 'correct_answer',
                                description: 'Correct answer key or text'
                            ),
                            new StringSchema(
                                name: 'explanation',
                                description: 'Explanation of the correct answer'
                            ),
                            new StringSchema(
                                name: 'cognitive_level',
                                description: "Bloom's taxonomy level: remember, understand, apply, analyze, evaluate, create"
                            ),
                            new StringSchema(
                                name: 'difficulty',
                                description: 'Difficulty level: easy, medium, hard'
                            ),
                            new StringSchema(
                                name: 'learning_objective_code',
                                description: 'Learning objective code this question addresses'
                            ),
                        ],
                        requiredFields: ['question', 'correct_answer', 'cognitive_level', 'difficulty', 'learning_objective_code']
                    )
                ),
            ],
            requiredFields: ['questions']
        );
    }

    /**
     * Switch to a specific provider and model.
     */
    public function useProvider(string $provider, string $model): self
    {
        $this->provider = $provider;
        $this->model = $model;

        return $this;
    }
}
