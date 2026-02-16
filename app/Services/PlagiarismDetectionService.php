<?php

namespace App\Services;

use App\Models\ExamQuestion;
use App\Models\ExamSession;
use App\Models\StudentAnswer;
use Illuminate\Support\Collection;

class PlagiarismDetectionService
{
    public function __construct(
        private QuestionDuplicateDetector $duplicateDetector
    ) {}

    /**
     * Generate plagiarism report for an exam session.
     */
    public function generateReport(ExamSession $examSession): array
    {
        $examSession->load('exam.questions');

        $essayQuestions = $examSession->exam->questions->where('question_type', 'essay');
        $reports = [];

        foreach ($essayQuestions as $question) {
            $matches = $this->findSimilarAnswers($examSession, $question);

            if (! empty($matches)) {
                $reports[] = [
                    'question_id' => $question->id,
                    'question_text' => $question->question,
                    'matches' => $matches,
                ];
            }
        }

        return $reports;
    }

    /**
     * Find similar answers for a specific question in a session.
     *
     * @param  float  $threshold  Minimum similarity threshold (0.0 to 1.0)
     * @param  int  $minAnswerLength  Minimum answer length to consider
     */
    public function findSimilarAnswers(
        ExamSession $examSession,
        ExamQuestion $question,
        float $threshold = 0.7,
        int $minAnswerLength = 20
    ): array {
        $answers = $this->getAnswersForQuestion($examSession, $question);

        $matches = [];
        $answerCount = $answers->count();

        for ($i = 0; $i < $answerCount; $i++) {
            for ($j = $i + 1; $j < $answerCount; $j++) {
                $match = $this->compareAnswers(
                    $answers[$i],
                    $answers[$j],
                    $threshold,
                    $minAnswerLength
                );

                if ($match !== null) {
                    $matches[] = $match;
                }
            }
        }

        return $matches;
    }

    /**
     * Get all answers for a specific question in a session.
     */
    private function getAnswersForQuestion(ExamSession $examSession, ExamQuestion $question): Collection
    {
        return StudentAnswer::where('exam_question_id', $question->id)
            ->whereHas('examAttempt', function ($query) use ($examSession) {
                $query->where('exam_session_id', $examSession->id);
            })
            ->with('examAttempt.user')
            ->get();
    }

    /**
     * Compare two answers and return match data if similar.
     */
    private function compareAnswers(
        StudentAnswer $answer1,
        StudentAnswer $answer2,
        float $threshold,
        int $minAnswerLength
    ): ?array {
        $text1 = $answer1->answer ?? '';
        $text2 = $answer2->answer ?? '';

        if (strlen($text1) < $minAnswerLength || strlen($text2) < $minAnswerLength) {
            return null;
        }

        $similarity = $this->duplicateDetector->calculateSimilarity($text1, $text2);

        if ($similarity < $threshold) {
            return null;
        }

        return [
            'student1' => $answer1->examAttempt->user->name,
            'student2' => $answer2->examAttempt->user->name,
            'similarity' => round($similarity * 100, 2),
            'answer1' => $text1,
            'answer2' => $text2,
        ];
    }

    /**
     * Get plagiarism statistics for a session.
     */
    public function getStatistics(ExamSession $examSession): array
    {
        $reports = $this->generateReport($examSession);

        $totalMatches = collect($reports)->sum(fn ($report) => count($report['matches']));
        $highSimilarityMatches = collect($reports)
            ->flatMap(fn ($report) => $report['matches'])
            ->where('similarity', '>=', 85)
            ->count();

        return [
            'total_questions_checked' => count($reports),
            'total_matches_found' => $totalMatches,
            'high_similarity_matches' => $highSimilarityMatches,
            'average_similarity' => $totalMatches > 0
                ? round(
                    collect($reports)
                        ->flatMap(fn ($report) => $report['matches'])
                        ->avg('similarity'),
                    2
                )
                : 0,
        ];
    }
}
