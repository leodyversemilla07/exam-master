<?php

namespace App\Services;

use App\Models\TosGenerate;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Str;

class TosPdfExporter
{
    /**
     * Export TOS to PDF format.
     */
    public function export(TosGenerate $tosGenerate): \Barryvdh\DomPDF\PDF
    {
        $tosGenerate->load(['module', 'creator']);

        // Calculate matrix and statistics using TosCalculator
        $calculator = app(TosCalculator::class);
        $matrix = $calculator->generateMatrix($tosGenerate);
        $distribution = $calculator->calculateDistribution($tosGenerate);
        $summary = $calculator->generateSummary($tosGenerate);

        $data = [
            'tos' => $tosGenerate,
            'matrix' => $matrix,
            'distribution' => $distribution,
            'summary' => $summary,
            'generatedAt' => now()->format('F j, Y g:i A'),
        ];

        $pdf = Pdf::loadView('pdf.tos', $data);
        $pdf->setPaper('letter', 'landscape');

        return $pdf;
    }

    /**
     * Get the filename for the PDF.
     */
    public function getFilename(TosGenerate $tosGenerate): string
    {
        $subject = Str::slug($tosGenerate->subject);
        $gradeLevel = Str::slug($tosGenerate->grade_level);

        return "TOS_{$subject}_{$gradeLevel}.pdf";
    }
}
