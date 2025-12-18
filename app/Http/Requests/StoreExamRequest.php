<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreExamRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'module_id' => ['required', 'exists:modules,id'],
            'tos_generate_id' => ['nullable', 'exists:tos_generates,id'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'exam_type' => ['required', 'string', Rule::in(['formative', 'summative', 'diagnostic'])],
            'time_limit' => ['nullable', 'integer', 'min:1', 'max:600'],
            'passing_score' => ['required', 'numeric', 'min:0', 'max:100'],
            'instructions' => ['nullable', 'string'],
            'shuffle_questions' => ['nullable', 'boolean'],
            'show_answers' => ['nullable', 'boolean'],
        ];
    }

    /**
     * Get custom error messages.
     */
    public function messages(): array
    {
        return [
            'module_id.required' => 'Please select a module for this exam.',
            'module_id.exists' => 'The selected module does not exist.',
            'title.required' => 'Please provide a title for the exam.',
            'exam_type.required' => 'Please select an exam type.',
            'exam_type.in' => 'Exam type must be formative, summative, or diagnostic.',
            'time_limit.min' => 'Time limit must be at least 1 minute.',
            'time_limit.max' => 'Time limit cannot exceed 600 minutes (10 hours).',
            'passing_score.required' => 'Please provide a passing score.',
            'passing_score.min' => 'Passing score cannot be negative.',
            'passing_score.max' => 'Passing score cannot exceed 100%.',
        ];
    }
}
