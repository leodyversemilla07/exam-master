<?php

namespace App\Services\AI;

use App\Ai\Agents\QuestionGenerator;
use App\Models\Module;
use App\Models\TosGenerate;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Laravel\Ai\Enums\Lab;
use Smalot\PdfParser\Parser as PdfParser;

class QuestionGeneratorService
{
    protected Lab $provider;

    protected string $model;

    public function __construct()
    {
        $this->provider = config('app.env') === 'production' ? Lab::OpenAI : Lab::Gemini;
        $this->model = $this->provider === Lab::OpenAI ? 'gpt-4o-mini' : 'gemini-3-flash-preview';
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

            $response = (new QuestionGenerator)->prompt(
                $prompt,
                provider: $this->provider,
                model: $this->model,
            );

            if (! isset($response['questions']) || ! is_array($response['questions'])) {
                $shape = 'missing questions array';

                throw new \RuntimeException("Invalid AI response: {$shape}");
            }

            return ['questions' => $response['questions']];
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
- For each question, you MUST include the question_type field with one of these values: multiple_choice, true_false, essay, identification, matching, or fill_in_the_blanks
- For matching type: Include Column A items in 'options' (key as 1, 2, 3, etc.) and their corresponding Column B matches. The 'correct_answer' should map the number to the correct letter or value.
- For fill_in_the_blanks: Use [blank] in the question text.
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

            $parser = new PdfParser;
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
     * Switch to a specific provider and model.
     */
    public function useProvider(string $provider, string $model): self
    {
        $this->provider = match ($provider) {
            'openai' => Lab::OpenAI,
            'gemini' => Lab::Gemini,
            'anthropic' => Lab::Anthropic,
            default => Lab::OpenAI,
        };
        $this->model = $model;

        return $this;
    }
}
