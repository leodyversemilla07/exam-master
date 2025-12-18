<?php

namespace App\Services;

use App\Models\TosGenerate;

class TosCalculator
{
    /**
     * Calculate item distribution across cognitive levels.
     */
    public function calculateDistribution(TosGenerate $tos): array
    {
        $cognitiveLevels = is_array($tos->cognitive_levels)
            ? $tos->cognitive_levels
            : json_decode($tos->cognitive_levels, true);

        $totalItems = $tos->total_items;
        $distribution = [];
        $allocatedItems = 0;

        // Calculate items per cognitive level based on percentages
        foreach ($cognitiveLevels as $level => $percentage) {
            $items = round(($percentage / 100) * $totalItems);
            $distribution[$level] = [
                'percentage' => $percentage,
                'items' => $items,
                'actual_percentage' => $totalItems > 0 ? round(($items / $totalItems) * 100, 2) : 0,
            ];
            $allocatedItems += $items;
        }

        // Adjust for rounding errors
        $remainder = $totalItems - $allocatedItems;
        if ($remainder != 0) {
            $distribution = $this->adjustForRemainder($distribution, $remainder);
        }

        return $distribution;
    }

    /**
     * Calculate items per topic based on learning objectives.
     */
    public function calculateTopicDistribution(TosGenerate $tos): array
    {
        $objectives = is_array($tos->learning_objectives)
            ? $tos->learning_objectives
            : json_decode($tos->learning_objectives, true);

        $distribution = [];
        $totalWeight = 0;

        // Calculate total weight
        foreach ($objectives as $objective) {
            $totalWeight += $objective['weight'] ?? 1;
        }

        // Distribute items proportionally
        foreach ($objectives as $objective) {
            $weight = $objective['weight'] ?? 1;
            $percentage = $totalWeight > 0 ? ($weight / $totalWeight) * 100 : 0;
            $items = round(($percentage / 100) * $tos->total_items);

            $distribution[$objective['topic']] = [
                'weight' => $weight,
                'percentage' => round($percentage, 2),
                'items' => $items,
                'cognitive_levels' => $objective['cognitive_levels'] ?? [],
            ];
        }

        return $distribution;
    }

    /**
     * Create TOS matrix (topics × cognitive levels).
     */
    public function generateMatrix(TosGenerate $tos): array
    {
        $topicDistribution = $this->calculateTopicDistribution($tos);
        $cognitiveDistribution = $this->calculateDistribution($tos);

        $matrix = [];

        foreach ($topicDistribution as $topic => $topicData) {
            $matrix[$topic] = [];
            $topicItems = $topicData['items'];

            foreach ($cognitiveDistribution as $level => $levelData) {
                // Distribute topic items across cognitive levels
                $levelPercentage = $levelData['percentage'];
                $items = round(($levelPercentage / 100) * $topicItems);

                $matrix[$topic][$level] = [
                    'items' => $items,
                    'percentage' => $topicItems > 0
                        ? round(($items / $topicItems) * 100, 2)
                        : 0,
                ];
            }
        }

        return $matrix;
    }

    /**
     * Validate TOS balance and distribution.
     */
    public function validateBalance(TosGenerate $tos): array
    {
        $issues = [];
        $warnings = [];

        $distribution = $this->calculateDistribution($tos);
        $totalAllocated = array_sum(array_column($distribution, 'items'));

        // Check if total items match
        if ($totalAllocated !== $tos->total_items) {
            $issues[] = "Total allocated items ({$totalAllocated}) does not match target ({$tos->total_items})";
        }

        // Check cognitive level balance
        foreach ($distribution as $level => $data) {
            if ($data['percentage'] > 50) {
                $warnings[] = "Cognitive level '{$level}' is overrepresented at {$data['percentage']}%";
            }
            if ($data['percentage'] < 5 && $data['percentage'] > 0) {
                $warnings[] = "Cognitive level '{$level}' is underrepresented at {$data['percentage']}%";
            }
        }

        // Check for missing lower-order thinking
        $hasRemembering = isset($distribution['remembering']) && $distribution['remembering']['percentage'] > 0;
        $hasUnderstanding = isset($distribution['understanding']) && $distribution['understanding']['percentage'] > 0;

        if (! $hasRemembering && ! $hasUnderstanding) {
            $warnings[] = 'No lower-order thinking skills (Remembering/Understanding) included';
        }

        // Check for missing higher-order thinking
        $hasAnalyzing = isset($distribution['analyzing']) && $distribution['analyzing']['percentage'] > 0;
        $hasEvaluating = isset($distribution['evaluating']) && $distribution['evaluating']['percentage'] > 0;
        $hasCreating = isset($distribution['creating']) && $distribution['creating']['percentage'] > 0;

        if (! $hasAnalyzing && ! $hasEvaluating && ! $hasCreating) {
            $warnings[] = 'No higher-order thinking skills (Analyzing/Evaluating/Creating) included';
        }

        return [
            'is_balanced' => empty($issues),
            'issues' => $issues,
            'warnings' => $warnings,
            'summary' => [
                'total_items' => $tos->total_items,
                'allocated_items' => $totalAllocated,
                'cognitive_levels_count' => count($distribution),
            ],
        ];
    }

    /**
     * Calculate difficulty distribution.
     */
    public function calculateDifficultyDistribution(TosGenerate $tos): array
    {
        $difficulty = $tos->difficulty_level;
        $totalItems = $tos->total_items;

        // Standard distributions based on difficulty
        $distributions = [
            'easy' => ['easy' => 60, 'medium' => 30, 'hard' => 10],
            'medium' => ['easy' => 30, 'medium' => 50, 'hard' => 20],
            'hard' => ['easy' => 20, 'medium' => 30, 'hard' => 50],
        ];

        $dist = $distributions[$difficulty] ?? $distributions['medium'];
        $result = [];

        foreach ($dist as $level => $percentage) {
            $items = round(($percentage / 100) * $totalItems);
            $result[$level] = [
                'percentage' => $percentage,
                'items' => $items,
            ];
        }

        return $result;
    }

    /**
     * Adjust distribution for rounding remainder.
     */
    protected function adjustForRemainder(array $distribution, int $remainder): array
    {
        // Add remainder to the level with highest percentage
        $sorted = collect($distribution)->sortByDesc('percentage');
        $topLevel = $sorted->keys()->first();

        $distribution[$topLevel]['items'] += $remainder;
        $distribution[$topLevel]['actual_percentage'] = round(
            ($distribution[$topLevel]['items'] / array_sum(array_column($distribution, 'items'))) * 100,
            2
        );

        return $distribution;
    }

    /**
     * Generate summary statistics for TOS.
     */
    public function generateSummary(TosGenerate $tos): array
    {
        $distribution = $this->calculateDistribution($tos);
        $validation = $this->validateBalance($tos);
        $difficultyDist = $this->calculateDifficultyDistribution($tos);

        return [
            'total_items' => $tos->total_items,
            'cognitive_distribution' => $distribution,
            'difficulty_distribution' => $difficultyDist,
            'validation' => $validation,
            'completion_percentage' => $this->calculateCompletionPercentage($tos),
        ];
    }

    /**
     * Calculate TOS completion percentage based on generated questions.
     */
    protected function calculateCompletionPercentage(TosGenerate $tos): float
    {
        $generated = $tos->questions()->count();
        $total = $tos->total_items;

        return $total > 0 ? round(($generated / $total) * 100, 2) : 0;
    }
}
