<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentAnswer extends Model
{
    use HasFactory;

    protected $fillable = [
        'exam_attempt_id',
        'exam_question_id',
        'answer',
        'answer_data',
        'is_correct',
        'points_earned',
        'max_points',
        'feedback',
        'is_manually_graded',
        'graded_by',
        'graded_at',
        'time_spent_seconds',
    ];

    protected function casts(): array
    {
        return [
            'answer_data' => 'array',
            'is_correct' => 'boolean',
            'points_earned' => 'decimal:2',
            'max_points' => 'decimal:2',
            'is_manually_graded' => 'boolean',
            'graded_at' => 'datetime',
        ];
    }

    public function examAttempt(): BelongsTo
    {
        return $this->belongsTo(ExamAttempt::class);
    }

    public function question(): BelongsTo
    {
        return $this->belongsTo(ExamQuestion::class, 'exam_question_id');
    }

    public function grader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'graded_by');
    }

    public function grade(float $pointsEarned, ?string $feedback = null, ?int $graderId = null): void
    {
        $this->points_earned = $pointsEarned;
        $this->is_correct = $pointsEarned >= $this->max_points;
        $this->feedback = $feedback;
        $this->is_manually_graded = true;
        $this->graded_by = $graderId;
        $this->graded_at = now();
        $this->save();
    }

    public function autoGrade(): bool
    {
        $question = $this->question;

        if (in_array($question->question_type, ['essay', 'short_answer'])) {
            return false;
        }

        $isCorrect = $this->checkAnswer();
        $this->is_correct = $isCorrect;
        $this->points_earned = $isCorrect ? $this->max_points : 0;
        $this->save();

        return true;
    }

    protected function checkAnswer(): bool
    {
        $question = $this->question;
        $correctAnswer = strtolower(trim($question->correct_answer ?? ''));
        $studentAnswer = strtolower(trim($this->answer ?? ''));

        return match ($question->question_type) {
            'multiple_choice' => $correctAnswer === $studentAnswer,
            'true_false' => $correctAnswer === $studentAnswer,
            'identification' => $this->checkIdentificationAnswer($correctAnswer, $studentAnswer),
            'matching' => $this->checkMatchingAnswer(),
            'fill_in_the_blanks' => $this->checkFillInTheBlanksAnswer(),
            default => false,
        };
    }

    protected function checkIdentificationAnswer(string $correctAnswer, string $studentAnswer): bool
    {
        return $correctAnswer === $studentAnswer
            || similar_text($correctAnswer, $studentAnswer) / max(strlen($correctAnswer), 1) > 0.85;
    }

    protected function checkMatchingAnswer(): bool
    {
        $answerData = $this->answer_data ?? [];
        $options = $this->question->options ?? [];

        if (empty($answerData) || empty($options)) {
            return false;
        }

        $correctMatches = 0;
        $totalMatches = count($options);

        foreach ($options as $option) {
            $premise = $option['premise'] ?? '';
            $response = $option['response'] ?? '';
            $studentResponse = $answerData[$premise] ?? null;

            if ($studentResponse === $response) {
                $correctMatches++;
            }
        }

        return $correctMatches === $totalMatches;
    }

    protected function checkFillInTheBlanksAnswer(): bool
    {
        $correctAnswer = $this->question->correct_answer ?? '';
        $studentAnswer = $this->answer ?? '';

        $correctBlanks = explode(',', strtolower(trim($correctAnswer)));
        $studentBlanks = is_array($this->answer_data)
            ? array_map('strtolower', array_map('trim', $this->answer_data))
            : explode(',', strtolower(trim($studentAnswer)));

        if (count($correctBlanks) !== count($studentBlanks)) {
            return false;
        }

        foreach ($correctBlanks as $index => $correct) {
            $student = $studentBlanks[$index] ?? '';
            if (trim($correct) !== trim($student)) {
                return false;
            }
        }

        return true;
    }
}
