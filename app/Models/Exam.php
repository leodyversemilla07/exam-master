<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Exam extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'module_id',
        'tos_generate_id',
        'created_by',
        'title',
        'description',
        'exam_type',
        'time_limit',
        'passing_score',
        'instructions',
        'total_points',
        'total_items',
        'status',
        'shuffle_questions',
        'show_answers',
        'metadata',
    ];

    protected $casts = [
        'passing_score' => 'decimal:2',
        'shuffle_questions' => 'boolean',
        'show_answers' => 'boolean',
        'metadata' => 'array',
    ];

    public function module(): BelongsTo
    {
        return $this->belongsTo(Module::class);
    }

    public function tosGenerate(): BelongsTo
    {
        return $this->belongsTo(TosGenerate::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function questions(): BelongsToMany
    {
        return $this->belongsToMany(ExamQuestion::class, 'exam_items')
            ->withPivot(['order', 'points', 'section', 'custom_metadata'])
            ->withTimestamps()
            ->orderBy('exam_items.order');
    }

    public function calculateTotals(): void
    {
        $this->total_items = $this->questions()->count();
        $this->total_points = $this->questions()->sum('exam_items.points');
        $this->save();
    }
}
