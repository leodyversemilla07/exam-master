<?php

namespace App\Services;

use App\Models\ExamQuestion;
use Illuminate\Support\Collection;

class QuestionDuplicateDetector
{
    /**
     * Find potential duplicate questions based on similarity threshold.
     */
    public function findDuplicates(ExamQuestion $question, float $threshold = 0.85): Collection
    {
        $moduleQuestions = ExamQuestion::where('module_id', $question->module_id)
            ->where('id', '!=', $question->id)
            ->where('question_type', $question->question_type)
            ->get();

        $duplicates = collect();

        foreach ($moduleQuestions as $candidate) {
            $similarity = $this->calculateSimilarity(
                $question->question,
                $candidate->question
            );

            if ($similarity >= $threshold) {
                $duplicates->push([
                    'question' => $candidate,
                    'similarity' => round($similarity * 100, 2),
                    'match_type' => $this->getMatchType($similarity),
                ]);
            }
        }

        return $duplicates->sortByDesc('similarity')->values();
    }

    /**
     * Calculate similarity between two strings using Levenshtein distance.
     */
    public function calculateSimilarity(string $str1, string $str2): float
    {
        $str1 = $this->normalize($str1);
        $str2 = $this->normalize($str2);

        if ($str1 === $str2) {
            return 1.0;
        }

        $maxLength = max(strlen($str1), strlen($str2));
        if ($maxLength === 0) {
            return 1.0;
        }

        $distance = levenshtein($str1, $str2);

        return 1 - ($distance / $maxLength);
    }

    /**
     * Check if a question is an exact duplicate.
     */
    public function isExactDuplicate(ExamQuestion $question): bool
    {
        return ExamQuestion::where('module_id', $question->module_id)
            ->where('id', '!=', $question->id)
            ->whereRaw('LOWER(question) = ?', [strtolower($question->question)])
            ->exists();
    }

    /**
     * Find questions with similar options (for multiple choice).
     */
    public function findSimilarOptions(ExamQuestion $question): Collection
    {
        if ($question->question_type !== 'multiple_choice' || ! $question->options) {
            return collect();
        }

        $moduleQuestions = ExamQuestion::where('module_id', $question->module_id)
            ->where('id', '!=', $question->id)
            ->where('question_type', 'multiple_choice')
            ->whereNotNull('options')
            ->get();

        $similar = collect();

        foreach ($moduleQuestions as $candidate) {
            $optionsSimilarity = $this->compareOptions(
                $question->options,
                $candidate->options
            );

            if ($optionsSimilarity >= 0.7) {
                $similar->push([
                    'question' => $candidate,
                    'options_similarity' => round($optionsSimilarity * 100, 2),
                ]);
            }
        }

        return $similar->sortByDesc('options_similarity')->values();
    }

    /**
     * Normalize text for comparison.
     */
    protected function normalize(string $text): string
    {
        // Remove extra whitespace
        $text = preg_replace('/\s+/', ' ', $text);

        // Convert to lowercase
        $text = strtolower($text);

        // Remove punctuation
        $text = preg_replace('/[^\w\s]/', '', $text);

        return trim($text);
    }

    /**
     * Compare options between two multiple choice questions.
     */
    protected function compareOptions(array $options1, array $options2): float
    {
        if (count($options1) !== count($options2)) {
            return 0.0;
        }

        $normalizedOptions1 = array_map(fn ($opt) => $this->normalize($opt), $options1);
        $normalizedOptions2 = array_map(fn ($opt) => $this->normalize($opt), $options2);

        $matches = 0;
        foreach ($normalizedOptions1 as $opt1) {
            foreach ($normalizedOptions2 as $opt2) {
                if ($this->calculateSimilarity($opt1, $opt2) >= 0.9) {
                    $matches++;
                    break;
                }
            }
        }

        return $matches / count($options1);
    }

    /**
     * Get match type based on similarity score.
     */
    protected function getMatchType(float $similarity): string
    {
        if ($similarity >= 0.95) {
            return 'exact';
        } elseif ($similarity >= 0.85) {
            return 'very_high';
        } elseif ($similarity >= 0.70) {
            return 'high';
        } else {
            return 'moderate';
        }
    }

    /**
     * Get duplicate statistics for a module.
     */
    public function getModuleStatistics(int $moduleId): array
    {
        $questions = ExamQuestion::where('module_id', $moduleId)->get();
        $totalDuplicates = 0;
        $exactDuplicates = 0;

        foreach ($questions as $question) {
            $duplicates = $this->findDuplicates($question, 0.95);
            if ($duplicates->isNotEmpty()) {
                $totalDuplicates++;
                if ($duplicates->first()['similarity'] >= 99) {
                    $exactDuplicates++;
                }
            }
        }

        return [
            'total_questions' => $questions->count(),
            'questions_with_duplicates' => $totalDuplicates,
            'exact_duplicates' => $exactDuplicates,
            'duplicate_percentage' => $questions->count() > 0
                ? round(($totalDuplicates / $questions->count()) * 100, 2)
                : 0,
        ];
    }
}
