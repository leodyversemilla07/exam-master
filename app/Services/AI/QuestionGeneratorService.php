<?php

namespace App\Services\AI;

use App\Models\Module;
use App\Models\TosGenerate;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Prism\Prism\Facades\Prism;
use Prism\Prism\Schema\ArraySchema;
use Prism\Prism\Schema\ObjectSchema;
use Prism\Prism\Schema\StringSchema;
use Smalot\PdfParser\Parser as PdfParser;

class QuestionGeneratorService
{
    protected string $provider;

    protected string $model;

    public function __construct()
    {
        $this->provider = config('app.env') === 'production' ? 'openai' : 'gemini';
        $this->model = $this->provider === 'openai' ? 'gpt-4o-mini' : 'gemini-3-flash-preview';
    }

    /**
     * Generate exam questions based on TOS specifications.
     */
    public function generateQuestions(TosGenerate $tos): array
    {
        // Allow up to 5 minutes for generation (job handles overall timeout)
        set_time_limit(300);

        try {
            $module = $tos->module;

            $prompt = $this->buildPrompt($tos, $module);

            $response = Prism::structured()
                ->using($this->provider, $this->model)
                ->withPrompt($prompt)
                ->withSchema($this->getQuestionSchema())
                ->withMaxTokens(30000)
                ->withClientOptions([
                    'timeout' => 180, // 3 minutes timeout for HTTP request
                    'connect_timeout' => 30,
                ])
                ->asStructured();

            $structured = $response->structured;

            if (! is_array($structured) || ! array_key_exists('questions', $structured) || ! is_array($structured['questions'])) {
                if (! is_array($structured)) {
                    $shape = gettype($structured).': '.json_encode($structured);
                } elseif (empty($structured)) {
                    $shape = 'empty array';
                } else {
                    $shape = 'array with keys ['.implode(', ', array_keys($structured)).']';
                }

                throw new \RuntimeException("Invalid AI response: missing 'questions' array. Received: {$shape}");
            }

            return $structured;
        } catch (\Exception $e) {
            Log::error('Question generation failed', [
                'tos_id' => $tos->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }

    /**
     * Build the AI prompt from TOS data.
     */
    protected function buildPrompt(TosGenerate $tos, Module $module): string
    {
        $objectives = collect($tos->learning_objectives)
            ->map(fn ($obj) => "- {$obj['code']}: {$obj['description']}")
            ->join("\n");

        $cognitiveDistribution = collect($tos->cognitive_levels)
            ->map(fn ($count, $level) => "- {$level}: {$count} items")
            ->join("\n");

        $questionTypeDistribution = '';
        if (isset($tos->question_types) && is_array($tos->question_types)) {
            $questionTypeDistribution = collect($tos->question_types)
                ->filter(fn ($count) => $count > 0)
                ->map(fn ($count, $type) => "- {$type}: {$count} items")
                ->join("\n");
        }

        $language = $tos->language === 'filipino' ? 'Filipino (Tagalog)' : 'English';

        $languageInstruction = $tos->language === 'filipino'
            ? 'Write the question text, options, correct answers, and explanations in Filipino (Tagalog).'
            : 'Write the question text, options, correct answers, and explanations in English.';

        // Extract PDF content if available
        $pdfContent = $this->extractPdfContent($module);
        $pdfSection = $pdfContent ? "\n\n**Module Content (from PDF):**\n{$pdfContent}\n" : '';

        $questionTypeSection = '';
        $questionTypeInstruction = '';
        if ($questionTypeDistribution) {
            $questionTypeSection = "\n**Question Type Distribution:**\n{$questionTypeDistribution}\n";
            $questionTypeInstruction = "- Follow the question type distribution strictly. Include the question_type field for each question.\n";
        }

        $pdfInstruction = $pdfContent ? "- Base your questions on the module content provided above\n" : '';
        $additionalInstructions = $tos->additional_instructions ? "\n- Additional Requirements: {$tos->additional_instructions}" : '';

        return <<<PROMPT
You are an expert educational assessment creator for Filipino students in {$tos->grade_level}.

**Subject:** {$tos->subject}
**Module:** {$module->name} ({$module->code})
**Quarter:** {$tos->quarter}
**Total Items:** {$tos->total_items}
**Language:** {$language}

**Learning Objectives:**
{$objectives}

**Cognitive Level Distribution (Bloom's Taxonomy):**
{$cognitiveDistribution}{$questionTypeSection}{$pdfSection}
**Instructions:**
- Generate exactly {$tos->total_items} questions
{$questionTypeInstruction}- Follow the cognitive level distribution strictly
- Difficulty: {$tos->difficulty_level}
- {$languageInstruction}
{$pdfInstruction}- Ensure questions are culturally appropriate for Filipino students
- Use clear, simple language appropriate for {$tos->grade_level}
- Each question must align with one of the learning objectives
- For each question, you MUST include the question_type field with one of these values: multiple_choice, true_false, essay, or identification
- Output must strictly follow the provided JSON schema: the top-level object must contain a `questions` array.{$additionalInstructions}

Generate the questions now.
PROMPT;
    }

    /**
     * Extract text content from module PDF file.
     */
    protected function extractPdfContent(Module $module): ?string
    {
        if (! $module->pdf_file) {
            return null;
        }

        try {
            $pdfPath = Storage::disk('public')->path($module->pdf_file);

            if (! file_exists($pdfPath)) {
                Log::warning('PDF file not found', ['path' => $pdfPath]);
                return null;
            }

            // Check file size - skip if too large (> 5MB)
            $fileSize = filesize($pdfPath);
            if ($fileSize > 5 * 1024 * 1024) {
                Log::info('PDF file too large for extraction', [
                    'module_id' => $module->id,
                    'file_size' => $fileSize,
                ]);
                return null;
            }

            $parser = new PdfParser();
            $pdf = $parser->parseFile($pdfPath);
            $text = $pdf->getText();

            // Clean up the text (remove excessive whitespace, normalize)
            $text = preg_replace('/\s+/', ' ', $text);
            $text = trim($text);

            // Limit to first 12000 characters to leave room for other prompt content
            if (strlen($text) > 12000) {
                $text = substr($text, 0, 12000).' [... content truncated for length]';
            }

            Log::info('PDF content extracted successfully', [
                'module_id' => $module->id,
                'content_length' => strlen($text),
            ]);

            return $text;
        } catch (\Exception $e) {
            Log::error('Failed to extract PDF content', [
                'module_id' => $module->id,
                'pdf_file' => $module->pdf_file,
                'error' => $e->getMessage(),
            ]);

            return null;
        }
    }

    /**
     * Define the structured output schema for questions.
     */
    protected function getQuestionSchema(): ObjectSchema
    {
        return new ObjectSchema(
            name: 'exam_questions',
            description: 'Generated exam questions based on TOS',
            properties: [
                new ArraySchema(
                    name: 'questions',
                    description: 'Array of generated questions',
                    items: new ObjectSchema(
                        name: 'question',
                        description: 'Individual question with metadata',
                        properties: [
                            new StringSchema(
                                name: 'question',
                                description: 'The question text'
                            ),
                            new ArraySchema(
                                name: 'options',
                                description: 'Multiple choice options (if applicable)',
                                items: new ObjectSchema(
                                    name: 'option',
                                    description: 'Answer option',
                                    properties: [
                                        new StringSchema('key', 'Option key (A, B, C, D)'),
                                        new StringSchema('text', 'Option text'),
                                    ],
                                    requiredFields: ['key', 'text']
                                )
                            ),
                            new StringSchema(
                                name: 'correct_answer',
                                description: 'Correct answer key or text'
                            ),
                            new StringSchema(
                                name: 'explanation',
                                description: 'Explanation of the correct answer'
                            ),
                            new StringSchema(
                                name: 'cognitive_level',
                                description: "Bloom's taxonomy level: remember, understand, apply, analyze, evaluate, create"
                            ),
                            new StringSchema(
                                name: 'difficulty',
                                description: 'Difficulty level: easy, medium, hard'
                            ),
                            new StringSchema(
                                name: 'learning_objective_code',
                                description: 'Learning objective code this question addresses'
                            ),
                            new StringSchema(
                                name: 'question_type',
                                description: 'Question type: multiple_choice, true_false, essay, or identification'
                            ),
                        ],
                        requiredFields: ['question', 'correct_answer', 'cognitive_level', 'difficulty', 'learning_objective_code', 'question_type']
                    )
                ),
            ],
            requiredFields: ['questions']
        );
    }

    /**
     * Switch to a specific provider and model.
     */
    public function useProvider(string $provider, string $model): self
    {
        $this->provider = $provider;
        $this->model = $model;

        return $this;
    }
}
