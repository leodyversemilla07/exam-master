<?php

namespace App\Services;

use App\Models\Exam;
use Illuminate\Support\Str;
use PhpOffice\PhpWord\IOFactory;
use PhpOffice\PhpWord\PhpWord;
use PhpOffice\PhpWord\SimpleType\Jc;

class ExamWordExporter
{
    /**
     * Export exam to Word (.docx) format.
     */
    public function export(Exam $exam, bool $withAnswers = false): string
    {
        $exam->load(['module', 'creator', 'questions' => function ($query) {
            $query->orderBy('exam_items.order');
        }]);

        $phpWord = new PhpWord;
        $section = $phpWord->addSection([
            'marginTop' => 1440, // 1 inch
            'marginBottom' => 1440,
            'marginLeft' => 1440,
            'marginRight' => 1440,
        ]);

        // Header
        $header = $section->addHeader();
        $header->addText($exam->title, ['bold' => true, 'size' => 16], ['alignment' => Jc::CENTER]);
        if ($exam->module) {
            $header->addText($exam->module->name.' ('.$exam->module->code.')', ['size' => 12], ['alignment' => Jc::CENTER]);
        }

        // Student Info
        if (! $withAnswers) {
            $table = $section->addTable(['width' => 100 * 50]);
            $table->addRow();
            $table->addCell(5000)->addText('Name: __________________________');
            $table->addCell(5000)->addText('Date: __________________________');
            $table->addRow();
            $table->addCell(5000)->addText('Section: _______________________');
            $table->addCell(5000)->addText('Score: _________________________');
            $section->addTextBreak(1);
        }

        // Instructions
        if ($exam->instructions) {
            $section->addText('Instructions:', ['bold' => true]);
            $section->addText($exam->instructions, ['italic' => true]);
            $section->addTextBreak(1);
        }

        // Questions
        $number = 1;
        foreach ($exam->questions as $question) {
            $points = $question->pivot->points ?? $question->points ?? 1;
            $textRun = $section->addTextRun();
            $textRun->addText($number++.'. ', ['bold' => true]);
            $textRun->addText($question->question);
            $textRun->addText(' ('.$points.' pts)', ['size' => 9, 'italic' => true]);

            $this->renderQuestionBody($section, $question, $withAnswers);
            $section->addTextBreak(1);
        }

        $objWriter = IOFactory::createWriter($phpWord, 'Word2007');
        $tempFile = tempnam(sys_get_temp_dir(), 'exam_').'.docx';
        $objWriter->save($tempFile);

        return $tempFile;
    }

    protected function renderQuestionBody($section, $question, $withAnswers): void
    {
        switch ($question->question_type) {
            case 'multiple_choice':
                $options = is_string($question->options) ? json_decode($question->options, true) : $question->options;
                if (is_array($options)) {
                    $numericIndex = 0;
                    foreach ($options as $key => $option) {
                        // If key is numeric, generate letter; if key is already a letter, use it
                        $letter = is_int($key) ? chr(65 + $numericIndex) : (string) $key;
                        $optionText = is_array($option) ? ($option['text'] ?? '') : (string) $option;
                        $isCorrect = $withAnswers && strtoupper((string) $question->correct_answer) === strtoupper($letter);

                        $textRun = $section->addTextRun();
                        $textRun->addText("    {$letter}. ", ['bold' => true]);
                        $textRun->addText($optionText, $isCorrect ? ['bold' => true, 'color' => '008000'] : []);
                        if ($isCorrect) {
                            $textRun->addText(' ✓', ['bold' => true, 'color' => '008000']);
                        }
                        $numericIndex++;
                    }
                }
                break;

            case 'true_false':
                $correct = strtolower($question->correct_answer);
                $section->addText('    T. True'.($withAnswers && $correct === 'true' ? ' ✓' : ''), $withAnswers && $correct === 'true' ? ['bold' => true, 'color' => '008000'] : []);
                $section->addText('    F. False'.($withAnswers && $correct === 'false' ? ' ✓' : ''), $withAnswers && $correct === 'false' ? ['bold' => true, 'color' => '008000'] : []);
                break;

            case 'identification':
                if ($withAnswers) {
                    $section->addText('    Answer: '.$question->correct_answer, ['bold' => true, 'color' => '008000']);
                } else {
                    $section->addText('    Answer: _________________________________');
                }
                break;

            case 'essay':
                if ($withAnswers && $question->correct_answer) {
                    $section->addText('    Sample Answer: '.$question->correct_answer, ['italic' => true, 'color' => '008000']);
                } else {
                    $section->addTextBreak(3);
                }
                break;

            case 'matching':
                $options = is_string($question->options) ? json_decode($question->options, true) : $question->options;
                if (is_array($options)) {
                    $table = $section->addTable();
                    $columnB = array_values($options);
                    if (! $withAnswers) {
                        shuffle($columnB);
                    }

                    $idx = 0;
                    foreach ($options as $key => $value) {
                        $table->addRow();
                        $table->addCell(4500)->addText("{$key}. {$value}");
                        $respLetter = chr(65 + $idx);
                        $table->addCell(4500)->addText("{$respLetter}. {$columnB[$idx]}");
                        $idx++;
                    }

                    if ($withAnswers) {
                        $section->addText('    Correct matches: '.(is_array($question->correct_answer) ? json_encode($question->correct_answer) : $question->correct_answer), ['bold' => true, 'color' => '008000']);
                    }
                }
                break;

            case 'fill_in_the_blanks':
                if ($withAnswers) {
                    $section->addText('    Answer: '.$question->correct_answer, ['bold' => true, 'color' => '008000']);
                }
                break;
        }

        if ($withAnswers && $question->explanation) {
            $section->addText('    Explanation: '.$question->explanation, ['italic' => true, 'size' => 9, 'color' => '4B5563']);
        }
    }

    public function getFilename(Exam $exam, bool $withAnswers = false): string
    {
        $suffix = $withAnswers ? '_with_answers' : '';
        $title = Str::slug($exam->title);

        return "{$title}{$suffix}.docx";
    }
}
