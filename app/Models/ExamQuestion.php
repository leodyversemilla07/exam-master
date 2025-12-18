<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class ExamQuestion extends Model
{
    use HasFactory, SoftDeletes;

    protected function casts(): array
    {
        return [
            'options' => 'array',
            'points' => 'integer',
            'is_approved' => 'boolean',
            'is_ai_generated' => 'boolean',
        ];
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
}
