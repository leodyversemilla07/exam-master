<?php

namespace App\Ai\Agents;

use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Attributes\MaxTokens;
use Laravel\Ai\Attributes\Timeout;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\HasStructuredOutput;
use Laravel\Ai\Promptable;

#[MaxTokens(30000)]
#[Timeout(180)]
class QuestionGenerator implements Agent, HasStructuredOutput
{
    use Promptable;

    public function instructions(): string
    {
        return 'You are an expert educational assessment creator for Filipino students.';
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
