<?php

namespace App\Ai\Agents;

use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Promptable;

class AnswerFeedback implements Agent
{
    use Promptable;

    public function instructions(): string
    {
        return 'You are a helpful tutor providing brief feedback to students.';
    }
}
