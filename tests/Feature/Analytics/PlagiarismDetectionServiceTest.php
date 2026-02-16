<?php

use App\Models\Exam;
use App\Models\ExamAttempt;
use App\Models\ExamItem;
use App\Models\ExamQuestion;
use App\Models\ExamSession;
use App\Models\Module;
use App\Models\StudentAnswer;
use App\Models\User;
use App\Services\PlagiarismDetectionService;
use App\Services\QuestionDuplicateDetector;

beforeEach(function () {
    $this->detector = Mockery::mock(QuestionDuplicateDetector::class);
    $this->service = new PlagiarismDetectionService($this->detector);

    $this->user = User::factory()->create();
    $this->module = Module::factory()->create();
    $this->exam = Exam::factory()->create([
        'module_id' => $this->module->id,
        'created_by' => $this->user->id,
    ]);
    $this->session = ExamSession::factory()->create([
        'exam_id' => $this->exam->id,
        'created_by' => $this->user->id,
    ]);
});

afterEach(function () {
    Mockery::close();
});

describe('generateReport', function () {
    it('generates empty report when no essay questions exist', function () {
        // Arrange
        ExamQuestion::factory()->create([
            'module_id' => $this->module->id,
            'question_type' => 'multiple_choice',
        ]);

        // Act
        $report = $this->service->generateReport($this->session);

        // Assert
        expect($report)->toBeArray();
        expect($report)->toBeEmpty();
    });

    it('generates report with matches for essay questions', function () {
        // Arrange
        $question = ExamQuestion::factory()->create([
            'module_id' => $this->module->id,
            'question_type' => 'essay',
        ]);

        // Link question to exam via exam_item
        ExamItem::create([
            'exam_id' => $this->exam->id,
            'exam_question_id' => $question->id,
            'order' => 1,
            'points' => 1,
        ]);

        $attempt1 = ExamAttempt::factory()->create([
            'exam_session_id' => $this->session->id,
            'user_id' => User::factory()->create()->id,
        ]);

        $attempt2 = ExamAttempt::factory()->create([
            'exam_session_id' => $this->session->id,
            'user_id' => User::factory()->create()->id,
        ]);

        StudentAnswer::factory()->create([
            'exam_attempt_id' => $attempt1->id,
            'exam_question_id' => $question->id,
            'answer' => 'This is a long answer that should be compared for plagiarism detection.',
        ]);

        StudentAnswer::factory()->create([
            'exam_attempt_id' => $attempt2->id,
            'exam_question_id' => $question->id,
            'answer' => 'This is a long answer that should be compared for plagiarism detection.',
        ]);

        $this->detector->shouldReceive('calculateSimilarity')
            ->andReturn(0.95);

        // Act
        $report = $this->service->generateReport($this->session);

        // Assert
        expect($report)->toBeArray();
        expect($report)->toHaveCount(1);
        expect($report[0]['question_id'])->toBe($question->id);
        expect($report[0]['matches'])->toBeArray();
    });
});

describe('findSimilarAnswers', function () {
    it('finds similar answers above threshold', function () {
        // Arrange
        $question = ExamQuestion::factory()->create([
            'module_id' => $this->module->id,
            'question_type' => 'essay',
        ]);

        $attempt1 = ExamAttempt::factory()->create([
            'exam_session_id' => $this->session->id,
            'user_id' => User::factory()->create()->id,
        ]);

        $attempt2 = ExamAttempt::factory()->create([
            'exam_session_id' => $this->session->id,
            'user_id' => User::factory()->create()->id,
        ]);

        StudentAnswer::factory()->create([
            'exam_attempt_id' => $attempt1->id,
            'exam_question_id' => $question->id,
            'answer' => 'This is a sample answer for testing plagiarism detection.',
        ]);

        StudentAnswer::factory()->create([
            'exam_attempt_id' => $attempt2->id,
            'exam_question_id' => $question->id,
            'answer' => 'This is a sample answer for testing plagiarism detection.',
        ]);

        $this->detector->shouldReceive('calculateSimilarity')
            ->andReturn(0.85);

        // Act
        $matches = $this->service->findSimilarAnswers($this->session, $question, 0.7, 20);

        // Assert
        expect($matches)->toBeArray();
        expect($matches)->not->toBeEmpty();
        expect($matches[0]['similarity'])->toBe(85.0);
    });

    it('ignores answers below minimum length', function () {
        // Arrange
        $question = ExamQuestion::factory()->create([
            'module_id' => $this->module->id,
            'question_type' => 'essay',
        ]);

        $attempt1 = ExamAttempt::factory()->create([
            'exam_session_id' => $this->session->id,
            'user_id' => User::factory()->create()->id,
        ]);

        $attempt2 = ExamAttempt::factory()->create([
            'exam_session_id' => $this->session->id,
            'user_id' => User::factory()->create()->id,
        ]);

        StudentAnswer::factory()->create([
            'exam_attempt_id' => $attempt1->id,
            'exam_question_id' => $question->id,
            'answer' => 'Short.',
        ]);

        StudentAnswer::factory()->create([
            'exam_attempt_id' => $attempt2->id,
            'exam_question_id' => $question->id,
            'answer' => 'Also short.',
        ]);

        // Act
        $matches = $this->service->findSimilarAnswers($this->session, $question, 0.7, 50);

        // Assert
        expect($matches)->toBeArray();
        expect($matches)->toBeEmpty();
    });

    it('ignores answers below similarity threshold', function () {
        // Arrange
        $question = ExamQuestion::factory()->create([
            'module_id' => $this->module->id,
            'question_type' => 'essay',
        ]);

        $attempt1 = ExamAttempt::factory()->create([
            'exam_session_id' => $this->session->id,
            'user_id' => User::factory()->create()->id,
        ]);

        $attempt2 = ExamAttempt::factory()->create([
            'exam_session_id' => $this->session->id,
            'user_id' => User::factory()->create()->id,
        ]);

        StudentAnswer::factory()->create([
            'exam_attempt_id' => $attempt1->id,
            'exam_question_id' => $question->id,
            'answer' => 'This is a completely different answer that should not match.',
        ]);

        StudentAnswer::factory()->create([
            'exam_attempt_id' => $attempt2->id,
            'exam_question_id' => $question->id,
            'answer' => 'Another completely different answer with no similarity.',
        ]);

        $this->detector->shouldReceive('calculateSimilarity')
            ->andReturn(0.3);

        // Act
        $matches = $this->service->findSimilarAnswers($this->session, $question, 0.7, 20);

        // Assert
        expect($matches)->toBeArray();
        expect($matches)->toBeEmpty();
    });
});

describe('getStatistics', function () {
    it('returns correct statistics for plagiarism report', function () {
        // Arrange
        $question = ExamQuestion::factory()->create([
            'module_id' => $this->module->id,
            'question_type' => 'essay',
        ]);

        // Link question to exam via exam_item
        ExamItem::create([
            'exam_id' => $this->exam->id,
            'exam_question_id' => $question->id,
            'order' => 1,
            'points' => 1,
        ]);

        $attempt1 = ExamAttempt::factory()->create([
            'exam_session_id' => $this->session->id,
            'user_id' => User::factory()->create()->id,
        ]);

        $attempt2 = ExamAttempt::factory()->create([
            'exam_session_id' => $this->session->id,
            'user_id' => User::factory()->create()->id,
        ]);

        StudentAnswer::factory()->create([
            'exam_attempt_id' => $attempt1->id,
            'exam_question_id' => $question->id,
            'answer' => 'This is a long answer that should be compared for plagiarism detection.',
        ]);

        StudentAnswer::factory()->create([
            'exam_attempt_id' => $attempt2->id,
            'exam_question_id' => $question->id,
            'answer' => 'This is a long answer that should be compared for plagiarism detection.',
        ]);

        $this->detector->shouldReceive('calculateSimilarity')
            ->andReturn(0.9);

        // Act
        $stats = $this->service->getStatistics($this->session);

        // Assert
        expect($stats)->toBeArray();
        expect($stats)->toHaveKeys([
            'total_questions_checked',
            'total_matches_found',
            'high_similarity_matches',
            'average_similarity',
        ]);
        expect($stats['total_questions_checked'])->toBe(1);
        expect($stats['total_matches_found'])->toBe(1);
    });
});
