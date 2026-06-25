<?php

namespace App\Services\AI;

use App\Ai\Agents\TosExtractor;
use App\Models\Module;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Laravel\Ai\Enums\Lab;
use Smalot\PdfParser\Parser as PdfParser;

class TosExtractorService
{
    protected Lab $provider;

    protected string $model;

    public function __construct()
    {
        $this->provider = config('app.env') === 'production' ? Lab::OpenAI : Lab::Gemini;
        $this->model = $this->provider === Lab::OpenAI ? 'gpt-4o-mini' : 'gemini-2.0-flash';
    }

    /**
     * Extract TOS-specific information from a module's PDF file.
     */
    public function extractFromModule(Module $module): array
    {
        if (! $module->pdf_file) {
            return [
                'success' => false,
                'error' => 'This module does not have an uploaded PDF file.',
                'data' => null,
            ];
        }

        try {
            // Extract text from the stored PDF
            $pdfContent = $this->extractPdfText($module->pdf_file);

            if (empty($pdfContent)) {
                return [
                    'success' => false,
                    'error' => 'Could not extract text from PDF. The file may be image-based or corrupted.',
                    'data' => null,
                ];
            }

            // Use AI to analyze and extract TOS-specific data
            $extracted = $this->analyzeWithAI($pdfContent, $module);

            return [
                'success' => true,
                'error' => null,
                'data' => $extracted,
            ];
        } catch (\Exception $e) {
            Log::error('TOS extraction failed', [
                'module_id' => $module->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return [
                'success' => false,
                'error' => 'Failed to analyze PDF: '.$e->getMessage(),
                'data' => null,
            ];
        }
    }

    /**
     * Extract text content from stored PDF file.
     */
    protected function extractPdfText(string $pdfPath): ?string
    {
        $fullPath = Storage::disk('public')->path($pdfPath);

        if (! file_exists($fullPath)) {
            throw new \RuntimeException('PDF file not found on disk.');
        }

        $parser = new PdfParser;
        $pdf = $parser->parseFile($fullPath);
        $text = $pdf->getText();

        // Clean up the text
        $text = preg_replace('/\s+/', ' ', $text);
        $text = trim($text);

        // Limit to first 15000 characters for AI processing
        if (strlen($text) > 15000) {
            $text = substr($text, 0, 15000).' [... content truncated]';
        }

        return $text;
    }

    /**
     * Use AI to analyze PDF content and extract TOS information.
     */
    protected function analyzeWithAI(string $content, Module $module): array
    {
        $prompt = $this->buildExtractionPrompt($content, $module);

        $response = (new TosExtractor)->prompt(
            $prompt,
            provider: $this->provider,
            model: $this->model,
        );

        if (! isset($response['tos_data'])) {
            throw new \RuntimeException('Invalid AI response structure');
        }

        return $response['tos_data'];
    }

    /**
     * Build the prompt for TOS extraction.
     */
    protected function buildExtractionPrompt(string $content, Module $module): string
    {
        return <<<PROMPT
You are an expert at analyzing educational curriculum documents to create Table of Specifications (TOS) for exam generation.

**Module Information:**
- Code: {$module->code}
- Name: {$module->name}
- Subject: {$module->subject_area}
- Grade Level: {$module->grade_level}

**PDF Content:**
{$content}

**Your Task:**
Extract information to create a comprehensive Table of Specifications (TOS) for exam generation.

**Instructions:**
1. **Learning Objectives**: Identify all learning objectives or competencies from the document
   - Each should have a code (e.g., M10-A1, SCI-7-Q1-1)
   - Each should have a clear description
   - Extract 5-15 objectives

2. **Cognitive Levels**: Analyze the objectives and suggest distribution across Bloom's Taxonomy
   - Levels: remembering, understanding, applying, analyzing, evaluating, creating
   - Provide counts that sum to 50 items (default total)
   - Base distribution on the cognitive complexity of objectives

3. **Question Types**: Suggest distribution of question types
   - Types: multiple_choice, true_false, essay, identification
   - Provide counts that sum to 50 items
   - Base on assessment methods mentioned or implied

4. **Recommended Total Items**: Suggest appropriate number of test items (20-100)
   - Consider content breadth and assessment time

5. **Difficulty Level**: Suggest overall difficulty (easy, medium, hard, mixed)

**Important:**
- Ensure cognitive_levels counts sum to recommended_total_items
- Ensure question_types counts sum to recommended_total_items
- Use clear, measurable learning objective descriptions
- Generate realistic, balanced distributions

Extract the TOS information now.
PROMPT;
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
