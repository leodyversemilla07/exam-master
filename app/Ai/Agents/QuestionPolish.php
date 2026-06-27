<?php

namespace App\Ai\Agents;

use App\Ai\Tools\TavilyWebSearch;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Attributes\Provider;
use Laravel\Ai\Attributes\Temperature;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\HasStructuredOutput;
use Laravel\Ai\Contracts\HasTools;
use Laravel\Ai\Enums\Lab;
use Laravel\Ai\Promptable;

// Use default OpenAI provider
#[Provider(Lab::OpenAI)]
#[Temperature(0.2)]
class QuestionPolish implements Agent, HasStructuredOutput, HasTools
{
    use Promptable;

    public function instructions(): string
    {
        return 'You are an expert curriculum designer. Polish exam questions for better grammar, clarity, and educational effectiveness. Maintain the original meaning and correct answer. You have access to web search tools to verify current educational standards and terminology.';
    }

    public function tools(): iterable
    {
        return [
            (new TavilyWebSearch)->max(2)->allow(['*.edu.ph', '*.gov.ph', '*.org']),
        ];
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
