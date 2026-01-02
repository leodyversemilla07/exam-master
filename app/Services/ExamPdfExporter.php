<?php

namespace App\Services;

use App\Models\Exam;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Str;

class ExamPdfExporter
{
    /**
     * Export exam to PDF format.
     */
    public function export(Exam $exam, bool $withAnswers = false): \Barryvdh\DomPDF\PDF
    {
        $exam->load(['module', 'creator', 'examTemplate', 'questions' => function ($query) {
            $query->orderBy('exam_items.order');
        }]);

        $data = [
            'exam' => $exam,
            'withAnswers' => $withAnswers,
            'questions' => $this->prepareQuestions($exam),
            'generatedAt' => now()->format('F j, Y g:i A'),
            'template' => $this->processTemplate($exam),
        ];

        $pdf = Pdf::loadView('pdf.exam', $data);
        $pdf->setPaper('letter', 'portrait');

        return $pdf;
    }

    protected function processTemplate(Exam $exam): ?array
    {
        if (! $exam->examTemplate) {
            return null;
        }

        $placeholders = [
            '{{school_name}}' => $exam->creator->organization ?? 'Your School Name',
            '{{exam_title}}' => $exam->title,
            '{{student_name}}' => '____________________',
            '{{date}}' => now()->format('F j, Y'),
            '{{score}}' => '___ / '.($exam->total_points ?? 0),
        ];

        $header = $exam->examTemplate->header_content;
        $footer = $exam->examTemplate->footer_content;

        foreach ($placeholders as $key => $value) {
            $header = str_replace($key, $value, $header ?? '');
            $footer = str_replace($key, $value, $footer ?? '');
        }

        return [
            'header' => $header,
            'footer' => $footer,
            'styles' => $exam->examTemplate->custom_styles,
        ];
    }

    /**
     * Export exam with answer key.
     */
    public function exportWithAnswerKey(Exam $exam): \Barryvdh\DomPDF\PDF
    {
        return $this->export($exam, true);
    }

    /**
     * Get the filename for the PDF.
     */
    public function getFilename(Exam $exam, bool $withAnswers = false): string
    {
        $suffix = $withAnswers ? '_with_answers' : '';
        $title = Str::slug($exam->title);

        return "{$title}{$suffix}.pdf";
    }

    /**
     * Prepare questions data for PDF rendering.
     */
    protected function prepareQuestions(Exam $exam): array
    {
        $questions = [];
        $number = 1;

        foreach ($exam->questions as $question) {
            $questionData = [
                'number' => $number++,
                'text' => $question->question,
                'type' => $question->question_type,
                'points' => $question->pivot->points ?? $question->points ?? 1,
                'cognitive_level' => $question->cognitive_level,
                'options' => [],
                'correct_answer' => $question->correct_answer,
                'explanation' => $question->explanation,
            ];

            // Handle options for multiple choice, true/false, and matching
            if (in_array($question->question_type, ['multiple_choice', 'true_false', 'matching'])) {
                $options = is_string($question->options)
                    ? json_decode($question->options, true)
                    : $question->options;

                if (is_array($options)) {
                    $questionData['options'] = $options;
                }
            }

            $questions[] = $questionData;
        }

        return $questions;
    }
}
