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
#[Timeout(180)]
#[Temperature(0.2)]
class TosExtractor implements Agent, HasStructuredOutput, HasTools
{
    use Promptable;

    public function instructions(): string
    {
        return 'You are an expert at analyzing educational curriculum documents to create Table of Specifications (TOS) for exam generation. You have access to web search tools to verify current curriculum standards and educational requirements.';
    }

    public function tools(): iterable
    {
        return [
            (new TavilyWebSearch)->max(2)->allow(['*.edu.ph', '*.gov.ph']),
        ];
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'tos_data' => $schema->object(fn ($s) => [
                'learning_objectives' => $s->array()->items(
                    $s->object(fn ($o) => [
                        'code' => $s->string()->required(),
                        'description' => $s->string()->required(),
                    ])
                )->required(),
                'cognitive_levels' => $s->object(fn ($c) => [
                    'remembering' => $c->integer()->required(),
                    'understanding' => $c->integer()->required(),
                    'applying' => $c->integer()->required(),
                    'analyzing' => $c->integer()->required(),
                    'evaluating' => $c->integer()->required(),
                    'creating' => $c->integer()->required(),
                ])->required(),
                'question_types' => $s->object(fn ($q) => [
                    'multiple_choice' => $q->integer()->required(),
                    'true_false' => $q->integer()->required(),
                    'essay' => $q->integer()->required(),
                    'identification' => $q->integer()->required(),
                ])->required(),
                'recommended_total_items' => $s->integer()->required(),
                'difficulty_level' => $s->string()->required(),
                'suggested_quarter' => $s->string(),
            ])->required(),
        ];
    }
}
