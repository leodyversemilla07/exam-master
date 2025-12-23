<?php

namespace App\Services\AI;

use App\Models\Module;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Prism\Prism\Facades\Prism;
use Prism\Prism\Schema\ArraySchema;
use Prism\Prism\Schema\NumberSchema;
use Prism\Prism\Schema\ObjectSchema;
use Prism\Prism\Schema\StringSchema;
use Smalot\PdfParser\Parser as PdfParser;

class TosExtractorService
{
    protected string $provider;

    protected string $model;

    public function __construct()
    {
        $this->provider = config('app.env') === 'production' ? 'openai' : 'gemini';
        $this->model = $this->provider === 'openai' ? 'gpt-4o-mini' : 'gemini-2.0-flash';
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

        $response = Prism::structured()
            ->using($this->provider, $this->model)
            ->withPrompt($prompt)
            ->withSchema($this->getExtractionSchema())
            ->withMaxTokens(4000)
            ->withClientOptions([
                'timeout' => 60,
                'connect_timeout' => 15,
            ])
            ->asStructured();

        $structured = $response->structured;

        // Validate response structure
        if (! is_array($structured) || ! isset($structured['tos_data'])) {
            throw new \RuntimeException('Invalid AI response structure');
        }

        return $structured['tos_data'];
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
     * Define the schema for structured extraction.
     */
    protected function getExtractionSchema(): ObjectSchema
    {
        return new ObjectSchema(
            name: 'tos_extraction',
            description: 'Extracted TOS information from module PDF',
            properties: [
                new ObjectSchema(
                    name: 'tos_data',
                    description: 'Table of Specifications data',
                    properties: [
                        new ArraySchema(
                            name: 'learning_objectives',
                            description: 'List of learning objectives to assess',
                            items: new ObjectSchema(
                                name: 'objective',
                                description: 'A learning objective',
                                properties: [
                                    new StringSchema('code', 'Objective code (e.g., M10-A1)'),
                                    new StringSchema('description', 'Clear, measurable objective description'),
                                ],
                                requiredFields: ['code', 'description']
                            )
                        ),
                        new ObjectSchema(
                            name: 'cognitive_levels',
                            description: "Bloom's Taxonomy distribution",
                            properties: [
                                new NumberSchema('remembering', 'Number of remembering level items'),
                                new NumberSchema('understanding', 'Number of understanding level items'),
                                new NumberSchema('applying', 'Number of applying level items'),
                                new NumberSchema('analyzing', 'Number of analyzing level items'),
                                new NumberSchema('evaluating', 'Number of evaluating level items'),
                                new NumberSchema('creating', 'Number of creating level items'),
                            ],
                            requiredFields: ['remembering', 'understanding', 'applying', 'analyzing', 'evaluating', 'creating']
                        ),
                        new ObjectSchema(
                            name: 'question_types',
                            description: 'Distribution of question types',
                            properties: [
                                new NumberSchema('multiple_choice', 'Number of multiple choice questions'),
                                new NumberSchema('true_false', 'Number of true/false questions'),
                                new NumberSchema('essay', 'Number of essay questions'),
                                new NumberSchema('identification', 'Number of identification questions'),
                            ],
                            requiredFields: ['multiple_choice', 'true_false', 'essay', 'identification']
                        ),
                        new NumberSchema(
                            name: 'recommended_total_items',
                            description: 'Recommended total number of test items (20-100)'
                        ),
                        new StringSchema(
                            name: 'difficulty_level',
                            description: 'Overall difficulty level: easy, medium, hard, or mixed'
                        ),
                        new StringSchema(
                            name: 'suggested_quarter',
                            description: 'Suggested quarter/grading period if mentioned (e.g., 1st Quarter, Q2)'
                        ),
                    ],
                    requiredFields: ['learning_objectives', 'cognitive_levels', 'question_types', 'recommended_total_items', 'difficulty_level']
                ),
            ],
            requiredFields: ['tos_data']
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
