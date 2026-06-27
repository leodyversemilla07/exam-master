<?php

namespace App\Ai\Agents;

use App\Ai\Tools\TavilyWebSearch;
use Laravel\Ai\Attributes\Provider;
use Laravel\Ai\Attributes\Temperature;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\HasTools;
use Laravel\Ai\Enums\Lab;
use Laravel\Ai\Promptable;

// Use default OpenAI provider
#[Provider(Lab::OpenAI)]
#[Temperature(0.3)]
class AnswerFeedback implements Agent, HasTools
{
    use Promptable;

    public function instructions(): string
    {
        return 'You are a helpful tutor providing brief feedback to students. You have access to web search tools to find additional explanations and examples when needed.';
    }

    public function tools(): iterable
    {
        return [
            (new TavilyWebSearch)->max(2)->allow(['*.edu.ph', '*.gov.ph', '*.org']),
        ];
    }
}
