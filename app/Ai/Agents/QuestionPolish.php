<?php

namespace App\Ai\Agents;

use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\HasStructuredOutput;
use Laravel\Ai\Promptable;

class QuestionPolish implements Agent, HasStructuredOutput
{
    use Promptable;

    public function instructions(): string
    {
        return 'You are an expert curriculum designer. Polish exam questions for better grammar, clarity, and educational effectiveness. Maintain the original meaning and correct answer.';
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'question' => $schema->string()->required(),
            'explanation' => $schema->string()->required(),
            'rationale' => $schema->string()->required(),
        ];
    }
}
