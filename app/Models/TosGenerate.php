<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TosGenerate extends Model
{
    protected function casts(): array
    {
        return [
            'learning_objectives' => 'array',
            'cognitive_levels' => 'array',
            'question_types' => 'array',
            'item_distribution' => 'array',
            'total_items' => 'integer',
        ];
    }

    protected $fillable = [
        'module_id',
        'created_by',
        'grade_level',
        'subject',
        'quarter',
        'total_items',
        'learning_objectives',
        'cognitive_levels',
        'question_types',
        'item_distribution',
        'difficulty_level',
        'language',
        'additional_instructions',
        'status',
        'error_message',
    ];

    public function module(): BelongsTo
    {
        return $this->belongsTo(Module::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function questions(): HasMany
    {
        return $this->hasMany(ExamQuestion::class, 'tos_generate_id');
    }

    public function markAsGenerating(): void
    {
        $this->update(['status' => 'generating']);
    }

    public function markAsCompleted(): void
    {
        $this->update(['status' => 'completed']);
    }

    public function markAsFailed(string $error): void
    {
        $this->update([
            'status' => 'failed',
            'error_message' => $error,
        ]);
    }
}
