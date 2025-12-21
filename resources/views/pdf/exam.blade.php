<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>{{ $exam->title }}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 11pt;
            line-height: 1.5;
            color: #1a1a1a;
        }
        
        .container {
            padding: 20px 40px;
        }
        
        /* Header Styles */
        .header {
            text-align: center;
            border-bottom: 2px solid #2563eb;
            padding-bottom: 15px;
            margin-bottom: 20px;
        }
        
        .header h1 {
            font-size: 18pt;
            color: #1e3a5f;
            margin-bottom: 5px;
        }
        
        .header .subtitle {
            font-size: 12pt;
            color: #4b5563;
            margin-bottom: 10px;
        }
        
        .exam-meta {
            display: table;
            width: 100%;
            margin-top: 10px;
            font-size: 10pt;
        }
        
        .exam-meta-row {
            display: table-row;
        }
        
        .exam-meta-cell {
            display: table-cell;
            padding: 3px 10px;
        }
        
        .exam-meta-label {
            font-weight: bold;
            color: #374151;
        }
        
        /* Student Info Section */
        .student-info {
            border: 1px solid #d1d5db;
            padding: 15px;
            margin-bottom: 20px;
            background-color: #f9fafb;
        }
        
        .student-info-row {
            margin-bottom: 10px;
        }
        
        .student-info-row:last-child {
            margin-bottom: 0;
        }
        
        .student-info-label {
            font-weight: bold;
            display: inline-block;
            width: 100px;
        }
        
        .student-info-line {
            display: inline-block;
            border-bottom: 1px solid #374151;
            width: 250px;
        }
        
        /* Instructions */
        .instructions {
            background-color: #eff6ff;
            border-left: 4px solid #2563eb;
            padding: 15px;
            margin-bottom: 20px;
        }
        
        .instructions h3 {
            color: #1e40af;
            margin-bottom: 8px;
            font-size: 11pt;
        }
        
        .instructions p {
            font-size: 10pt;
            color: #374151;
        }
        
        /* Questions Section */
        .questions-section {
            margin-top: 20px;
        }
        
        .section-header {
            background-color: #1e3a5f;
            color: white;
            padding: 8px 15px;
            font-size: 12pt;
            font-weight: bold;
            margin-bottom: 15px;
        }
        
        .question {
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 1px dashed #d1d5db;
            page-break-inside: avoid;
        }
        
        .question:last-child {
            border-bottom: none;
        }
        
        .question-header {
            display: table;
            width: 100%;
            margin-bottom: 8px;
        }
        
        .question-number {
            display: table-cell;
            font-weight: bold;
            color: #1e3a5f;
            width: 40px;
            vertical-align: top;
        }
        
        .question-text {
            display: table-cell;
            vertical-align: top;
        }
        
        .question-points {
            display: table-cell;
            text-align: right;
            width: 80px;
            font-size: 9pt;
            color: #6b7280;
            vertical-align: top;
        }
        
        /* Options */
        .options {
            margin-left: 40px;
            margin-top: 10px;
        }
        
        .option {
            margin-bottom: 6px;
            display: table;
            width: 100%;
        }
        
        .option-letter {
            display: table-cell;
            width: 25px;
            font-weight: bold;
        }
        
        .option-text {
            display: table-cell;
        }
        
        .option-correct {
            background-color: #dcfce7;
            padding: 2px 5px;
        }
        
        /* Answer Line */
        .answer-line {
            margin-left: 40px;
            margin-top: 10px;
        }
        
        .answer-line-label {
            font-weight: bold;
            display: inline-block;
        }
        
        .answer-line-space {
            display: inline-block;
            border-bottom: 1px solid #374151;
            width: 300px;
            margin-left: 10px;
        }
        
        /* Essay Space */
        .essay-space {
            margin-left: 40px;
            margin-top: 10px;
            border: 1px solid #d1d5db;
            height: 100px;
            background-color: #fafafa;
        }
        
        /* Answer Key Section */
        .answer-key {
            margin-top: 30px;
            page-break-before: always;
        }
        
        .answer-key-header {
            background-color: #dc2626;
            color: white;
            padding: 8px 15px;
            font-size: 12pt;
            font-weight: bold;
            margin-bottom: 15px;
        }
        
        .answer-item {
            margin-bottom: 10px;
            padding: 8px;
            background-color: #f9fafb;
            border-left: 3px solid #2563eb;
        }
        
        .answer-item-number {
            font-weight: bold;
            color: #1e3a5f;
        }
        
        .answer-item-answer {
            margin-top: 5px;
        }
        
        .answer-item-explanation {
            margin-top: 5px;
            font-size: 10pt;
            color: #4b5563;
            font-style: italic;
        }
        
        /* Footer */
        .footer {
            position: fixed;
            bottom: 20px;
            left: 40px;
            right: 40px;
            text-align: center;
            font-size: 9pt;
            color: #6b7280;
            border-top: 1px solid #e5e7eb;
            padding-top: 10px;
        }
        
        .page-number:before {
            content: counter(page);
        }
        
        /* Cognitive Level Badge */
        .cognitive-badge {
            display: inline-block;
            font-size: 8pt;
            padding: 1px 6px;
            border-radius: 3px;
            margin-left: 8px;
            vertical-align: middle;
        }
        
        .cognitive-remembering { background-color: #f3e8ff; color: #7c3aed; }
        .cognitive-understanding { background-color: #dbeafe; color: #2563eb; }
        .cognitive-applying { background-color: #dcfce7; color: #16a34a; }
        .cognitive-analyzing { background-color: #fef3c7; color: #d97706; }
        .cognitive-evaluating { background-color: #ffedd5; color: #ea580c; }
        .cognitive-creating { background-color: #fee2e2; color: #dc2626; }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1>{{ $exam->title }}</h1>
            @if($exam->module)
                <div class="subtitle">{{ $exam->module->name }} ({{ $exam->module->code }})</div>
            @endif
            <div class="exam-meta">
                <div class="exam-meta-row">
                    <div class="exam-meta-cell">
                        <span class="exam-meta-label">Total Items:</span> {{ $exam->total_items ?? count($questions) }}
                    </div>
                    <div class="exam-meta-cell">
                        <span class="exam-meta-label">Total Points:</span> {{ $exam->total_points ?? array_sum(array_column($questions, 'points')) }}
                    </div>
                    @if($exam->time_limit)
                    <div class="exam-meta-cell">
                        <span class="exam-meta-label">Time Limit:</span> {{ $exam->time_limit }} minutes
                    </div>
                    @endif
                    @if($exam->passing_score)
                    <div class="exam-meta-cell">
                        <span class="exam-meta-label">Passing Score:</span> {{ $exam->passing_score }}%
                    </div>
                    @endif
                </div>
            </div>
        </div>

        @if(!$withAnswers)
        <!-- Student Info -->
        <div class="student-info">
            <div class="student-info-row">
                <span class="student-info-label">Name:</span>
                <span class="student-info-line"></span>
                <span style="margin-left: 30px;">
                    <span class="student-info-label">Date:</span>
                    <span class="student-info-line" style="width: 150px;"></span>
                </span>
            </div>
            <div class="student-info-row">
                <span class="student-info-label">Section:</span>
                <span class="student-info-line" style="width: 150px;"></span>
                <span style="margin-left: 30px;">
                    <span class="student-info-label">Score:</span>
                    <span class="student-info-line" style="width: 100px;"></span>
                </span>
            </div>
        </div>
        @endif

        <!-- Instructions -->
        @if($exam->instructions)
        <div class="instructions">
            <h3>Instructions:</h3>
            <p>{!! nl2br(e($exam->instructions)) !!}</p>
        </div>
        @endif

        <!-- Questions -->
        <div class="questions-section">
            <div class="section-header">
                {{ $withAnswers ? 'Questions with Answers' : 'Examination Questions' }}
            </div>

            @foreach($questions as $question)
            <div class="question">
                <div class="question-header">
                    <div class="question-number">{{ $question['number'] }}.</div>
                    <div class="question-text">
                        {!! nl2br(e($question['text'])) !!}
                        @if($withAnswers && $question['cognitive_level'])
                            <span class="cognitive-badge cognitive-{{ $question['cognitive_level'] }}">
                                {{ ucfirst($question['cognitive_level']) }}
                            </span>
                        @endif
                    </div>
                    <div class="question-points">({{ $question['points'] }} pt{{ $question['points'] > 1 ? 's' : '' }})</div>
                </div>

                @if($question['type'] === 'multiple_choice' && !empty($question['options']))
                    <div class="options">
                        @foreach($question['options'] as $index => $option)
                            @php
                                $letter = chr(65 + $index); // A, B, C, D...
                                $isCorrect = $withAnswers && strtoupper($question['correct_answer']) === $letter;
                                $optionText = is_array($option) ? ($option['text'] ?? '') : $option;
                            @endphp
                            <div class="option {{ $isCorrect ? 'option-correct' : '' }}">
                                <div class="option-letter">{{ $letter }}.</div>
                                <div class="option-text">
                                    {{ $optionText }}
                                    @if($isCorrect)
                                        <strong>✓</strong>
                                    @endif
                                </div>
                            </div>
                        @endforeach
                    </div>
                @elseif($question['type'] === 'true_false')
                    <div class="options">
                        @php
                            $correctAnswer = strtolower($question['correct_answer']);
                        @endphp
                        <div class="option {{ $withAnswers && $correctAnswer === 'true' ? 'option-correct' : '' }}">
                            <div class="option-letter">T.</div>
                            <div class="option-text">
                                True
                                @if($withAnswers && $correctAnswer === 'true')
                                    <strong>✓</strong>
                                @endif
                            </div>
                        </div>
                        <div class="option {{ $withAnswers && $correctAnswer === 'false' ? 'option-correct' : '' }}">
                            <div class="option-letter">F.</div>
                            <div class="option-text">
                                False
                                @if($withAnswers && $correctAnswer === 'false')
                                    <strong>✓</strong>
                                @endif
                            </div>
                        </div>
                    </div>
                @elseif($question['type'] === 'identification')
                    @if($withAnswers)
                        <div class="answer-line">
                            <span class="answer-line-label">Answer:</span>
                            <strong style="margin-left: 10px;">{{ $question['correct_answer'] }}</strong>
                        </div>
                    @else
                        <div class="answer-line">
                            <span class="answer-line-label">Answer:</span>
                            <span class="answer-line-space"></span>
                        </div>
                    @endif
                @elseif($question['type'] === 'essay')
                    @if($withAnswers && $question['correct_answer'])
                        <div class="answer-line" style="background-color: #f0fdf4; padding: 10px; border-left: 3px solid #22c55e;">
                            <span class="answer-line-label">Sample Answer:</span>
                            <p style="margin-top: 5px;">{{ $question['correct_answer'] }}</p>
                        </div>
                    @else
                        <div class="essay-space"></div>
                    @endif
                @endif

                @if($withAnswers && $question['explanation'])
                    <div style="margin-left: 40px; margin-top: 10px; padding: 8px; background-color: #fefce8; border-left: 3px solid #eab308;">
                        <strong style="font-size: 9pt;">Explanation:</strong>
                        <p style="font-size: 10pt; color: #4b5563; margin-top: 3px;">{{ $question['explanation'] }}</p>
                    </div>
                @endif
            </div>
            @endforeach
        </div>

        <!-- Footer -->
        <div class="footer">
            Generated by ExamMaster on {{ $generatedAt }} | Page <span class="page-number"></span>
        </div>
    </div>
</body>
</html>
