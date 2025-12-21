<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Module extends Model
{
    use HasFactory, SoftDeletes;

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'curriculum_year' => 'integer',
        ];
    }

    protected $fillable = [
        'code',
        'name',
        'description',
        'pdf_file',
        'subject_area',
        'grade_level',
        'curriculum_year',
        'is_active',
        'created_by',
    ];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function tosGenerates(): HasMany
    {
        return $this->hasMany(TosGenerate::class);
    }

    public function questions(): HasMany
    {
        return $this->hasMany(ExamQuestion::class);
    }

    public function topics(): HasMany
    {
        return $this->hasMany(Topic::class)->orderBy('order');
    }

    public function rootTopics(): HasMany
    {
        return $this->hasMany(Topic::class)->whereNull('parent_id')->orderBy('order');
    }
}
