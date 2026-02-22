<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class ExamQuestion extends Model
{
    use HasFactory, SoftDeletes;

    protected $appends = ['status'];

    protected function casts(): array
    {
        return [
            'options' => 'array',
            'points' => 'integer',
            'is_approved' => 'boolean',
            'is_ai_generated' => 'boolean',
            'ai_metadata' => 'array',
        ];
    }

    /**
     * Derive a string status from the boolean is_approved flag.
     */
    public function getStatusAttribute(): string
    {
        return $this->is_approved ? 'approved' : 'pending';
    }

    protected $fillable = [
        'tos_generate_id',
        'module_id',
        'created_by',
        'question_type',
        'question',
        'options',
        'correct_answer',
        'explanation',
        'cognitive_level',
        'difficulty',
        'learning_objective_code',
        'points',
        'is_approved',
        'is_ai_generated',
        'ai_metadata',
    ];

    public function tosGenerate(): BelongsTo
    {
        return $this->belongsTo(TosGenerate::class, 'tos_generate_id');
    }

    public function module(): BelongsTo
    {
        return $this->belongsTo(Module::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function approve(): void
    {
        $this->update(['is_approved' => true]);
    }

    /**
     * Get student performance statistics for this question.
     */
    public function getPerformanceStats(): array
    {
        $stats = StudentAnswer::where('exam_question_id', $this->id)
            ->selectRaw('COUNT(*) as total, SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correct')
            ->first();

        $total = $stats->total ?? 0;
        $correct = $stats->correct ?? 0;
        $successRate = $total > 0 ? ($correct / $total) * 100 : null;

        $suggestedDifficulty = null;
        if ($total >= 5) { // Only suggest if we have enough data
            if ($successRate >= 80) {
                $suggestedDifficulty = 'easy';
            } elseif ($successRate >= 40) {
                $suggestedDifficulty = 'medium';
            } else {
                $suggestedDifficulty = 'hard';
            }
        }

        return [
            'total_attempts' => $total,
            'correct_answers' => (int) $correct,
            'success_rate' => $successRate ? round($successRate, 1) : null,
            'suggested_difficulty' => $suggestedDifficulty,
            'current_difficulty' => $this->difficulty,
            'needs_calibration' => $suggestedDifficulty && $suggestedDifficulty !== $this->difficulty,
        ];
    }
}
