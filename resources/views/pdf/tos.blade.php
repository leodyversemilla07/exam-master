<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>TOS - {{ $tos->subject }}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 9pt;
            line-height: 1.4;
            color: #1a1a1a;
        }
        
        .container {
            padding: 15px 20px;
        }
        
        .header {
            text-align: center;
            border-bottom: 2px solid #2563eb;
            padding-bottom: 10px;
            margin-bottom: 15px;
        }
        
        .header h1 {
            font-size: 16pt;
            color: #1e3a5f;
            margin-bottom: 3px;
        }
        
        .header .subtitle {
            font-size: 10pt;
            color: #4b5563;
        }
        
        .meta-info {
            margin-bottom: 15px;
            font-size: 8pt;
        }
        
        .meta-row {
            display: table;
            width: 100%;
            margin-bottom: 3px;
        }
        
        .meta-label {
            display: table-cell;
            font-weight: bold;
            width: 120px;
        }
        
        .meta-value {
            display: table-cell;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
            font-size: 8pt;
        }
        
        th, td {
            border: 1px solid #000;
            padding: 5px 8px;
            text-align: center;
        }
        
        th {
            background-color: #e5e7eb;
            font-weight: bold;
        }
        
        .topic-cell {
            text-align: left;
            font-weight: 500;
        }
        
        .total-row {
            background-color: #f3f4f6;
            font-weight: bold;
        }
        
        .summary-section {
            margin-top: 15px;
            padding: 10px;
            background-color: #f9fafb;
            border: 1px solid #d1d5db;
        }
        
        .summary-title {
            font-weight: bold;
            font-size: 10pt;
            margin-bottom: 8px;
        }
        
        .summary-grid {
            display: table;
            width: 100%;
        }
        
        .summary-row {
            display: table-row;
        }
        
        .summary-cell {
            display: table-cell;
            padding: 3px 0;
            width: 50%;
        }
        
        .summary-label {
            font-weight: bold;
        }
        
        .footer {
            margin-top: 20px;
            padding-top: 10px;
            border-top: 1px solid #d1d5db;
            font-size: 7pt;
            color: #6b7280;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Table of Specifications (TOS)</h1>
            <div class="subtitle">{{ $tos->subject }} - {{ $tos->grade_level }}</div>
            @if($tos->quarter)
                <div class="subtitle">{{ $tos->quarter }}</div>
            @endif
        </div>

        <div class="meta-info">
            <div class="meta-row">
                <div class="meta-label">Module:</div>
                <div class="meta-value">{{ $tos->module->name ?? 'N/A' }}</div>
            </div>
            <div class="meta-row">
                <div class="meta-label">Total Items:</div>
                <div class="meta-value">{{ $tos->total_items }}</div>
            </div>
            <div class="meta-row">
                <div class="meta-label">Difficulty Level:</div>
                <div class="meta-value">{{ ucfirst($tos->difficulty_level) }}</div>
            </div>
            <div class="meta-row">
                <div class="meta-label">Language:</div>
                <div class="meta-value">{{ ucfirst($tos->language ?? 'english') }}</div>
            </div>
            <div class="meta-row">
                <div class="meta-label">Created by:</div>
                <div class="meta-value">{{ $tos->creator->name ?? 'N/A' }}</div>
            </div>
            <div class="meta-row">
                <div class="meta-label">Generated:</div>
                <div class="meta-value">{{ $generatedAt }}</div>
            </div>
        </div>

        <table>
            <thead>
                <tr>
                    <th rowspan="2" class="topic-cell">Learning Objectives</th>
                    <th colspan="6">Bloom's Taxonomy Levels</th>
                    <th rowspan="2">Total</th>
                </tr>
                <tr>
                    <th>Remember</th>
                    <th>Understand</th>
                    <th>Apply</th>
                    <th>Analyze</th>
                    <th>Evaluate</th>
                    <th>Create</th>
                </tr>
            </thead>
            <tbody>
                @foreach($tos->learning_objectives as $index => $objective)
                    <tr>
                        <td class="topic-cell">{{ $objective['code'] ?? ($index + 1) }}. {{ $objective['description'] }}</td>
                        @php
                            $rowTotal = 0;
                            foreach(['remember', 'understand', 'apply', 'analyze', 'evaluate', 'create'] as $level) {
                                $value = $matrix[$index][$level] ?? 0;
                                $rowTotal += $value;
                                echo '<td>' . ($value > 0 ? $value : '-') . '</td>';
                            }
                        @endphp
                        <td><strong>{{ $rowTotal }}</strong></td>
                    </tr>
                @endforeach
                <tr class="total-row">
                    <td class="topic-cell">TOTAL</td>
                    @foreach(['remember', 'understand', 'apply', 'analyze', 'evaluate', 'create'] as $level)
                        <td>{{ $distribution[$level] ?? 0 }}</td>
                    @endforeach
                    <td>{{ $tos->total_items }}</td>
                </tr>
                <tr>
                    <td class="topic-cell">Percentage (%)</td>
                    @foreach(['remember', 'understand', 'apply', 'analyze', 'evaluate', 'create'] as $level)
                        @php
                            $value = $distribution[$level] ?? 0;
                            $percentage = $tos->total_items > 0 ? round(($value / $tos->total_items) * 100, 1) : 0;
                        @endphp
                        <td>{{ $percentage }}%</td>
                    @endforeach
                    <td>100%</td>
                </tr>
            </tbody>
        </table>

        <div class="summary-section">
            <div class="summary-title">Distribution Summary</div>
            <div class="summary-grid">
                <div class="summary-row">
                    <div class="summary-cell">
                        <span class="summary-label">Remember:</span> {{ $distribution['remember'] ?? 0 }} items
                    </div>
                    <div class="summary-cell">
                        <span class="summary-label">Understand:</span> {{ $distribution['understand'] ?? 0 }} items
                    </div>
                </div>
                <div class="summary-row">
                    <div class="summary-cell">
                        <span class="summary-label">Apply:</span> {{ $distribution['apply'] ?? 0 }} items
                    </div>
                    <div class="summary-cell">
                        <span class="summary-label">Analyze:</span> {{ $distribution['analyze'] ?? 0 }} items
                    </div>
                </div>
                <div class="summary-row">
                    <div class="summary-cell">
                        <span class="summary-label">Evaluate:</span> {{ $distribution['evaluate'] ?? 0 }} items
                    </div>
                    <div class="summary-cell">
                        <span class="summary-label">Create:</span> {{ $distribution['create'] ?? 0 }} items
                    </div>
                </div>
            </div>
        </div>

        @if($summary['validation']['is_balanced'])
            <div style="margin-top: 10px; padding: 8px; background-color: #d1fae5; border: 1px solid #10b981; font-size: 8pt;">
                ✓ This TOS is properly balanced according to educational standards.
            </div>
        @else
            <div style="margin-top: 10px; padding: 8px; background-color: #fee2e2; border: 1px solid #ef4444; font-size: 8pt;">
                ⚠ Balance issues detected. Please review the distribution.
            </div>
        @endif

        <div class="footer">
            Generated by ExamMaster | {{ $generatedAt }}
        </div>
    </div>
</body>
</html>
