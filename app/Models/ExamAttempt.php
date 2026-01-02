<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ExamAttempt extends Model
{
    use HasFactory;

    protected $fillable = [
        'exam_session_id',
        'user_id',
        'attempt_number',
        'started_at',
        'submitted_at',
        'time_spent_seconds',
        'score',
        'percentage',
        'correct_answers',
        'total_questions',
        'status',
        'ip_address',
        'user_agent',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'started_at' => 'datetime',
            'submitted_at' => 'datetime',
            'score' => 'decimal:2',
            'percentage' => 'decimal:2',
            'metadata' => 'array',
        ];
    }

    public function examSession(): BelongsTo
    {
        return $this->belongsTo(ExamSession::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function answers(): HasMany
    {
        return $this->hasMany(StudentAnswer::class);
    }

    public function isInProgress(): bool
    {
        return $this->status === 'in_progress';
    }

    public function isSubmitted(): bool
    {
        return $this->status === 'submitted';
    }

    public function isGraded(): bool
    {
        return $this->status === 'graded';
    }

    public function getTimeRemainingSeconds(): int
    {
        if (! $this->isInProgress()) {
            return 0;
        }

        $session = $this->examSession;
        if (! $session->time_limit_minutes) {
            return PHP_INT_MAX;
        }

        $timeLimitSeconds = $session->time_limit_minutes * 60;
        $elapsed = $this->started_at->diffInSeconds(now(), false);

        return max(0, $timeLimitSeconds - $elapsed);
    }

    public function calculateScore(): void
    {
        $answers = $this->answers()->get();

        $correctAnswers = $answers->where('is_correct', true)->count();
        $totalPoints = $answers->sum('max_points');
        $earnedPoints = $answers->sum('points_earned');

        $this->correct_answers = $correctAnswers;
        $this->total_questions = $answers->count();
        $this->score = $earnedPoints;
        $this->percentage = $totalPoints > 0 ? ($earnedPoints / $totalPoints) * 100 : 0;
        $this->save();
    }

    public function submit(): void
    {
        $this->submitted_at = now();
        $this->time_spent_seconds = now()->diffInSeconds($this->started_at);
        $this->status = 'submitted';
        $this->save();

        $this->calculateScore();
    }
}
