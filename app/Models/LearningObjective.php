<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class LearningObjective extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'topic_id',
        'code',
        'objective',
        'cognitive_level',
        'order',
        'assessment_criteria',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function topic(): BelongsTo
    {
        return $this->belongsTo(Topic::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByCognitiveLevel($query, string $level)
    {
        return $query->where('cognitive_level', $level);
    }
}
