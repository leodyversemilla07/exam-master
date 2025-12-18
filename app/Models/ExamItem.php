<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ExamItem extends Model
{
    protected $fillable = [
        'exam_id',
        'exam_question_id',
        'order',
        'points',
        'section',
        'custom_metadata',
    ];

    protected $casts = [
        'custom_metadata' => 'array',
    ];

    public function exam(): BelongsTo
    {
        return $this->belongsTo(Exam::class);
    }

    public function question(): BelongsTo
    {
        return $this->belongsTo(ExamQuestion::class, 'exam_question_id');
    }
}
