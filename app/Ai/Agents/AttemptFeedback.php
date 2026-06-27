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
#[Temperature(0.4)]
class AttemptFeedback implements Agent, HasTools
{
    use Promptable;

    public function instructions(): string
    {
        return 'You are an encouraging Filipino educator providing constructive feedback. You have access to web search tools to find additional examples and explanations when needed.';
    }

    public function tools(): iterable
    {
        return [
            (new TavilyWebSearch)->max(2)->allow(['*.edu.ph', '*.gov.ph', '*.org']),
        ];
    }
}
