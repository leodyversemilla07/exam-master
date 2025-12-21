<?php

namespace App\Http\Controllers;

use App\Models\Module;
use Inertia\Inertia;
use Inertia\Response;

class TosCalculatorController extends Controller
{
    public function index(Module $module): Response
    {
        $module->load(['topics.learning_objectives' => function ($query) {
            $query->where('is_active', true)->orderBy('order');
        }]);

        // Build TOS matrix
        $matrix = [];
        $distribution = [
            'remembering' => 0,
            'understanding' => 0,
            'applying' => 0,
            'analyzing' => 0,
            'evaluating' => 0,
            'creating' => 0,
        ];

        foreach ($module->topics as $topic) {
            $row = [
                'topic_id' => $topic->id,
                'topic_code' => $topic->code,
                'topic_title' => $topic->title,
                'remembering' => 0,
                'understanding' => 0,
                'applying' => 0,
                'analyzing' => 0,
                'evaluating' => 0,
                'creating' => 0,
                'total' => 0,
            ];

            foreach ($topic->learning_objectives as $objective) {
                $row[$objective->cognitive_level]++;
                $row['total']++;
                $distribution[$objective->cognitive_level]++;
            }

            $row['percentage'] = 0; // Default percentage
            $matrix[] = $row;
        }

        // Calculate percentages
        $totalObjectives = array_sum($distribution);

        if ($totalObjectives > 0) {
            foreach ($matrix as &$row) {
                $row['percentage'] = ($row['total'] / $totalObjectives) * 100;
            }
        }

        // Build distribution array
        $distributionArray = [];
        foreach ($distribution as $level => $count) {
            $distributionArray[] = [
                'cognitive_level' => $level,
                'count' => $count,
                'percentage' => $totalObjectives > 0 ? ($count / $totalObjectives) * 100 : 0,
            ];
        }

        // Calculate statistics
        $statistics = [
            'total_objectives' => $totalObjectives,
            'total_topics' => count($matrix),
            'average_per_topic' => count($matrix) > 0 ? $totalObjectives / count($matrix) : 0,
            'most_used_level' => $this->getMostUsedLevel($distribution),
            'least_used_level' => $this->getLeastUsedLevel($distribution),
        ];

        // Balance analysis (ideal: 10-25% per level)
        $balance = [];
        foreach ($distribution as $level => $count) {
            $percentage = $totalObjectives > 0 ? ($count / $totalObjectives) * 100 : 0;
            $status = 'balanced';

            if ($percentage < 10) {
                $status = 'under';
            } elseif ($percentage > 25) {
                $status = 'over';
            }

            $balance[] = [
                'level' => $level,
                'count' => $count,
                'ideal_min' => 10,
                'ideal_max' => 25,
                'status' => $status,
            ];
        }

        return Inertia::render('tos-calculator/index', [
            'module' => $module,
            'matrix' => $matrix,
            'distribution' => $distributionArray,
            'statistics' => $statistics,
            'balance' => $balance,
        ]);
    }

    private function getMostUsedLevel(array $distribution): string
    {
        $filtered = array_filter($distribution, fn ($count) => $count > 0);

        if (empty($filtered)) {
            return 'remembering';
        }

        return array_search(max($filtered), $distribution);
    }

    private function getLeastUsedLevel(array $distribution): string
    {
        $nonZero = array_filter($distribution, fn ($count) => $count > 0);

        if (empty($nonZero)) {
            return 'remembering';
        }

        return array_search(min($nonZero), $distribution);
    }
}
