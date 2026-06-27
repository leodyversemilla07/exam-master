<?php

namespace App\Services\AI;

use App\Ai\Agents\ModuleExtractor;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;
use Smalot\PdfParser\Parser as PdfParser;

class ModuleExtractorService
{
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

        $response = (new ModuleExtractor)->prompt($prompt);

        // Validate response structure
        if (! isset($response['module_info'])) {
            throw new \RuntimeException('Invalid AI response structure');
        }

        return $response['module_info'];
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
}
