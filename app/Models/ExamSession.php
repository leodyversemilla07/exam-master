<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class ExamSession extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'exam_id',
        'created_by',
        'title',
        'description',
        'access_code',
        'start_time',
        'end_time',
        'time_limit_minutes',
        'max_attempts',
        'shuffle_questions',
        'shuffle_options',
        'show_results_immediately',
        'show_correct_answers',
        'allow_review',
        'status',
        'allowed_students',
        'settings',
    ];

    protected function casts(): array
    {
        return [
            'start_time' => 'datetime',
            'end_time' => 'datetime',
            'shuffle_questions' => 'boolean',
            'shuffle_options' => 'boolean',
            'show_results_immediately' => 'boolean',
            'show_correct_answers' => 'boolean',
            'allow_review' => 'boolean',
            'allowed_students' => 'array',
            'settings' => 'array',
        ];
    }

    protected static function boot(): void
    {
        parent::boot();

        static::creating(function (ExamSession $session) {
            if (empty($session->access_code)) {
                $session->access_code = strtoupper(Str::random(8));
            }
        });
    }

    public function exam(): BelongsTo
    {
        return $this->belongsTo(Exam::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function attempts(): HasMany
    {
        return $this->hasMany(ExamAttempt::class);
    }

    public function isActive(): bool
    {
        $now = now();

        return $this->status === 'active'
            && $now->gte($this->start_time)
            && $now->lte($this->end_time);
    }

    public function isUpcoming(): bool
    {
        return $this->status === 'active' && now()->lt($this->start_time);
    }

    public function isExpired(): bool
    {
        return now()->gt($this->end_time);
    }

    public function canUserAttempt(User $user): bool
    {
        if (! $this->isActive()) {
            return false;
        }

        $attemptCount = $this->attempts()
            ->where('user_id', $user->id)
            ->count();

        return $attemptCount < $this->max_attempts;
    }

    public function getUserAttempts(User $user): Collection
    {
        return $this->attempts()
            ->where('user_id', $user->id)
            ->orderBy('attempt_number')
            ->get();
    }
}
