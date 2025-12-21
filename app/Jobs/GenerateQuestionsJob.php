<?php

namespace App\Jobs;

use App\Models\ExamQuestion;
use App\Models\TosGenerate;
use App\Services\AI\QuestionGeneratorService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class GenerateQuestionsJob implements ShouldQueue
{
    use Queueable, InteractsWithQueue, SerializesModels;

    /**
     * The number of times the job may be attempted.
     */
    public int $tries = 3;

    /**
     * The maximum number of seconds the job can run.
     */
    public int $timeout = 600;

    /**
     * The number of seconds to wait before retrying the job.
     */
    public int $backoff = 60;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public TosGenerate $tosGenerate,
        public int $userId
    ) {}

    /**
     * Execute the job.
     */
    public function handle(QuestionGeneratorService $questionGenerator): void
    {
        try {
            Log::info("Starting question generation for TOS #{$this->tosGenerate->id}");

            // Mark as generating if not already
            if ($this->tosGenerate->status !== 'generating') {
                $this->tosGenerate->markAsGenerating();
            }

            // Generate questions using AI
            $generatedQuestions = $questionGenerator->generateQuestions($this->tosGenerate);

            if (! isset($generatedQuestions['questions']) || ! is_array($generatedQuestions['questions'])) {
                throw new \RuntimeException("Invalid AI response: missing 'questions' array.");
            }

            // Save questions in a transaction
            DB::transaction(function () use ($generatedQuestions, $questionGenerator) {
                $questionsCreated = 0;

                foreach ($generatedQuestions['questions'] as $questionData) {
                    ExamQuestion::create([
                        'tos_generate_id' => $this->tosGenerate->id,
                        'module_id' => $this->tosGenerate->module_id,
                        'created_by' => $this->userId,
                        'question_type' => $questionData['question_type'] ?? 'multiple_choice',
                        'question' => $questionData['question'],
                        'options' => $questionData['options'] ?? null,
                        'correct_answer' => $questionData['correct_answer'],
                        'explanation' => $questionData['explanation'] ?? null,
                        'cognitive_level' => $questionData['cognitive_level'],
                        'difficulty' => $questionData['difficulty'],
                        'learning_objective_code' => $questionData['learning_objective_code'],
                        'is_ai_generated' => true,
                        'ai_metadata' => json_encode([
                            'provider' => $questionGenerator->provider ?? 'unknown',
                            'model' => $questionGenerator->model ?? 'unknown',
                            'generated_at' => now()->toIso8601String(),
                        ]),
                    ]);

                    $questionsCreated++;
                }

                // Mark as completed
                $this->tosGenerate->markAsCompleted();

                Log::info("Successfully generated {$questionsCreated} questions for TOS #{$this->tosGenerate->id}");
            });
        } catch (\Exception $e) {
            Log::error("Question generation failed for TOS #{$this->tosGenerate->id}", [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            // Mark as failed
            $this->tosGenerate->markAsFailed($e->getMessage());

            // Re-throw to mark job as failed
            throw $e;
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error("GenerateQuestionsJob failed after all retries for TOS #{$this->tosGenerate->id}", [
            'error' => $exception->getMessage(),
        ]);

        // Ensure TOS is marked as failed
        $this->tosGenerate->markAsFailed($exception->getMessage());
    }
}
