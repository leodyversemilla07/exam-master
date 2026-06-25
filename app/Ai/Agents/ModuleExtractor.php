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
class ModuleExtractor implements Agent, HasStructuredOutput
{
    use Promptable;

    public function instructions(): string
    {
        return 'You are an expert at analyzing educational curriculum documents.';
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
