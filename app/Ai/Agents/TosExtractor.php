<?php

namespace App\Ai\Agents;

use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Attributes\MaxTokens;
use Laravel\Ai\Attributes\Timeout;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\HasStructuredOutput;
use Laravel\Ai\Promptable;

#[MaxTokens(4000)]
#[Timeout(60)]
class TosExtractor implements Agent, HasStructuredOutput
{
    use Promptable;

    public function instructions(): string
    {
        return 'You are an expert at analyzing educational curriculum documents to create Table of Specifications (TOS) for exam generation.';
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
