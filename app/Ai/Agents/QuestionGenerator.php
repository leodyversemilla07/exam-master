<?php

namespace App\Ai\Agents;

use App\Ai\Tools\TavilyWebSearch;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Attributes\MaxTokens;
use Laravel\Ai\Attributes\Provider;
use Laravel\Ai\Attributes\Temperature;
use Laravel\Ai\Attributes\Timeout;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\HasStructuredOutput;
use Laravel\Ai\Contracts\HasTools;
use Laravel\Ai\Enums\Lab;
use Laravel\Ai\Promptable;

// Use default OpenAI provider
#[Provider(Lab::OpenAI)]
#[MaxTokens(50000)]
#[Timeout(300)]
#[Temperature(0.3)]
class QuestionGenerator implements Agent, HasStructuredOutput, HasTools
{
    use Promptable;

    public function instructions(): string
    {
        return 'You are an expert educational assessment creator for Filipino students. You have access to web search tools to find current curriculum requirements, teaching standards, and educational resources.';
    }

    public function tools(): iterable
    {
        return [
            (new TavilyWebSearch)->max(3)->allow(['*.edu.ph', '*.gov.ph', '*.org']),
        ];
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'questions' => $schema->array()->items(
                $s = $schema->object(fn ($q) => [
                    'question' => $q->string()->required(),
                    'options' => $q->array()->items(
                        $schema->object(fn ($o) => [
                            'key' => $o->string()->required(),
                            'text' => $o->string()->required(),
                        ])
                    ),
                    'correct_answer' => $q->string()->required(),
                    'explanation' => $q->string(),
                    'cognitive_level' => $q->string()->required(),
                    'difficulty' => $q->string()->required(),
                    'learning_objective_code' => $q->string()->required(),
                    'question_type' => $q->string()->required(),
                ])
            )->required(),
        ];
    }
}
