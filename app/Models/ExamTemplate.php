<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ExamTemplate extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'header_content',
        'footer_content',
        'custom_styles',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function exams(): HasMany
    {
        return $this->hasMany(Exam::class);
    }
}
