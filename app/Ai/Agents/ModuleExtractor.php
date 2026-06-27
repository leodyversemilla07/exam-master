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
class ModuleExtractor implements Agent, HasStructuredOutput, HasTools
{
    use Promptable;

    public function instructions(): string
    {
        return 'You are an expert at analyzing educational curriculum documents. You have access to web search tools to verify current curriculum standards and educational requirements.';
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
            'module_info' => $schema->object(fn ($m) => [
                'name' => $m->string()->required(),
                'code' => $m->string()->required(),
                'description' => $m->string()->required(),
                'subject_area' => $m->string()->required(),
                'grade_level' => $m->string()->required(),
                'curriculum_year' => $m->string(),
                'topics' => $m->array()->items(
                    $schema->object(fn ($t) => [
                        'title' => $t->string()->required(),
                        'description' => $t->string(),
                        'learning_objectives' => $t->array()->items(
                            $schema->string()
                        ),
                    ])
                ),
            ])->required(),
        ];
    }
}
