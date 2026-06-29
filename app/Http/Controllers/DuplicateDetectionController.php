<?php

namespace App\Http\Controllers;

use App\Models\ExamQuestion;
use App\Models\Module;
use App\Services\QuestionDuplicateDetector;
use Inertia\Inertia;
use Inertia\Response;

class DuplicateDetectionController extends Controller
{
    public function __construct(
        private QuestionDuplicateDetector $duplicateDetector
    ) {}

    public function index(Module $module): Response
    {
        abort_unless(auth()->user()->isAdmin() || $module->created_by === auth()->id(), 403);

        $questions = ExamQuestion::where('module_id', $module->id)
            ->where('is_approved', true)
            ->get();

        $duplicates = [];
        $statistics = [
            'total_questions' => $questions->count(),
            'duplicate_groups' => 0,
            'highest_similarity' => 0,
            'questions_with_duplicates' => 0,
        ];

        $processedPairs = [];

        foreach ($questions as $question) {
            $matches = $this->duplicateDetector->findDuplicates($question, 0.60);

            if ($matches->isNotEmpty()) {
                $duplicateGroup = [
                    'question' => $question,
                    'matches' => [],
                ];

                foreach ($matches as $match) {
                    // Create a unique pair identifier (sorted to avoid duplicates)
                    $pairKey = implode('-', [
                        min($question->id, $match['question']->id),
                        max($question->id, $match['question']->id),
                    ]);

                    // Skip if we've already processed this pair
                    if (in_array($pairKey, $processedPairs)) {
                        continue;
                    }

                    $processedPairs[] = $pairKey;

                    $duplicateGroup['matches'][] = [
                        'question' => $match['question'],
                        'similarity_score' => $match['similarity'],
                        'matching_aspects' => [$match['match_type']],
                    ];

                    if ($match['similarity'] > $statistics['highest_similarity']) {
                        $statistics['highest_similarity'] = $match['similarity'];
                    }
                }

                if (! empty($duplicateGroup['matches'])) {
                    $duplicates[] = $duplicateGroup;
                    $statistics['questions_with_duplicates']++;
                }
            }
        }

        $statistics['duplicate_groups'] = count($duplicates);

        return Inertia::render('duplicate-detection/index', [
            'module' => $module,
            'duplicates' => $duplicates,
            'statistics' => $statistics,
        ]);
    }
}
