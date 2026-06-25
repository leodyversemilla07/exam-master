<?php

namespace App\Ai\Agents;

use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Promptable;

class AttemptFeedback implements Agent
{
    use Promptable;

    public function instructions(): string
    {
        return 'You are an encouraging Filipino educator providing constructive feedback.';
    }
}
