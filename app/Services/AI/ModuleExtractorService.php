<?php

namespace App\Services\AI;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;
use Prism\Prism\Facades\Prism;
use Prism\Prism\Schema\ArraySchema;
use Prism\Prism\Schema\ObjectSchema;
use Prism\Prism\Schema\StringSchema;
use Smalot\PdfParser\Parser as PdfParser;

class ModuleExtractorService
{
    protected string $provider;

    protected string $model;

    public function __construct()
    {
        $this->provider = config('app.env') === 'production' ? 'openai' : 'gemini';
        $this->model = $this->provider === 'openai' ? 'gpt-4o-mini' : 'gemini-2.0-flash';
    }

    /**
     * Extract module information from a PDF file.
     */
    public function extractFromPdf(UploadedFile $file): array
    {
        try {
            // Extract text from PDF
            $pdfContent = $this->extractPdfText($file);

            if (empty($pdfContent)) {
                return [
                    'success' => false,
                    'error' => 'Could not extract text from PDF. The file may be image-based or corrupted.',
                    'data' => null,
                ];
            }

            // Use AI to analyze and extract structured data
            $extracted = $this->analyzeWithAI($pdfContent);

            return [
                'success' => true,
                'error' => null,
                'data' => $extracted,
            ];
        } catch (\Exception $e) {
            Log::error('Module extraction failed', [
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
     * Extract text content from uploaded PDF file.
     */
    protected function extractPdfText(UploadedFile $file): ?string
    {
        $tempPath = $file->getPathname();

        // Check file size - skip if too large (> 10MB)
        $fileSize = $file->getSize();
        if ($fileSize > 10 * 1024 * 1024) {
            throw new \RuntimeException('PDF file is too large. Maximum size is 10MB.');
        }

        $parser = new PdfParser;
        $pdf = $parser->parseFile($tempPath);
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
     * Use AI to analyze PDF content and extract module information.
     */
    protected function analyzeWithAI(string $content): array
    {
        $prompt = $this->buildExtractionPrompt($content);

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
        if (! is_array($structured) || ! isset($structured['module_info'])) {
            throw new \RuntimeException('Invalid AI response structure');
        }

        return $structured['module_info'];
    }

    /**
     * Build the prompt for module extraction.
     */
    protected function buildExtractionPrompt(string $content): string
    {
        return <<<PROMPT
You are an expert at analyzing educational curriculum documents. Analyze the following PDF content and extract module/course information.

**PDF Content:**
{$content}

**Instructions:**
1. Extract the module/course title, code, and description
2. Identify the subject area (e.g., Mathematics, Science, English, etc.)
3. Determine the grade level if mentioned (e.g., Grade 7, Grade 10, Senior High School)
4. Find the curriculum year or academic year if present
5. List the main topics or chapters found in the document
6. For each topic, try to identify learning objectives if present

**Important:**
- If a field cannot be determined, provide a reasonable suggestion based on content
- For module code, suggest a format like "SUBJ-101" based on the subject
- Keep descriptions concise (2-3 sentences)
- Topics should be chapter headings or major sections
- Learning objectives should follow the SMART format if possible

Extract the information now.
PROMPT;
    }

    /**
     * Define the schema for structured extraction.
     */
    protected function getExtractionSchema(): ObjectSchema
    {
        return new ObjectSchema(
            name: 'module_extraction',
            description: 'Extracted module information from PDF',
            properties: [
                new ObjectSchema(
                    name: 'module_info',
                    description: 'Core module information',
                    properties: [
                        new StringSchema(
                            name: 'name',
                            description: 'Module or course title'
                        ),
                        new StringSchema(
                            name: 'code',
                            description: 'Module code (e.g., MATH-101, SCI-201)'
                        ),
                        new StringSchema(
                            name: 'description',
                            description: 'Brief module description (2-3 sentences)'
                        ),
                        new StringSchema(
                            name: 'subject_area',
                            description: 'Subject discipline (e.g., Mathematics, Science, English)'
                        ),
                        new StringSchema(
                            name: 'grade_level',
                            description: 'Target grade level (e.g., Grade 7, Grade 10)'
                        ),
                        new StringSchema(
                            name: 'curriculum_year',
                            description: 'Academic year (e.g., 2024, 2024-2025)'
                        ),
                        new ArraySchema(
                            name: 'topics',
                            description: 'List of chapters or major topics',
                            items: new ObjectSchema(
                                name: 'topic',
                                description: 'Topic or chapter information',
                                properties: [
                                    new StringSchema('title', 'Topic or chapter title'),
                                    new StringSchema('description', 'Brief topic description'),
                                    new ArraySchema(
                                        name: 'learning_objectives',
                                        description: 'Learning objectives for this topic',
                                        items: new StringSchema('objective', 'A learning objective')
                                    ),
                                ],
                                requiredFields: ['title']
                            )
                        ),
                    ],
                    requiredFields: ['name', 'code', 'description', 'subject_area', 'grade_level']
                ),
            ],
            requiredFields: ['module_info']
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
