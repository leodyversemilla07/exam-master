<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreExamQuestionRequest extends FormRequest
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
            'question_type' => ['required', 'string', 'in:multiple_choice,true_false,identification,essay,short_answer'],
            'question' => ['required', 'string', 'min:10'],
            'options' => ['required_if:question_type,multiple_choice', 'array', 'min:2'],
            'options.*' => ['string'],
            'correct_answer' => ['required', 'string'],
            'explanation' => ['nullable', 'string', 'max:1000'],
            'cognitive_level' => ['required', 'string', 'in:remembering,understanding,applying,analyzing,evaluating,creating'],
            'difficulty' => ['required', 'string', 'in:easy,medium,hard'],
            'learning_objective_code' => ['nullable', 'string', 'max:50'],
            'points' => ['required', 'integer', 'min:1', 'max:100'],
            'is_approved' => ['sometimes', 'boolean'],
        ];
    }

    /**
     * Get custom error messages for validation rules.
     */
    public function messages(): array
    {
        return [
            'module_id.required' => 'Please select a module.',
            'module_id.exists' => 'The selected module does not exist.',
            'question_type.required' => 'Question type is required.',
            'question_type.in' => 'Invalid question type.',
            'question.required' => 'Question text is required.',
            'question.min' => 'Question must be at least 10 characters.',
            'options.required_if' => 'Options are required for multiple choice questions.',
            'options.min' => 'Multiple choice questions must have at least 2 options.',
            'correct_answer.required' => 'Correct answer is required.',
            'cognitive_level.required' => 'Cognitive level is required.',
            'cognitive_level.in' => 'Invalid cognitive level.',
            'difficulty.required' => 'Difficulty level is required.',
            'difficulty.in' => 'Invalid difficulty level.',
            'points.required' => 'Points are required.',
            'points.min' => 'Points must be at least 1.',
            'points.max' => 'Points cannot exceed 100.',
        ];
    }
}
