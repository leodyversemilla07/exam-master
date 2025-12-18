<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTosGenerateRequest extends FormRequest
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
            'grade_level' => ['required', 'string', 'max:50'],
            'subject' => ['required', 'string', 'max:255'],
            'quarter' => ['nullable', 'string', 'max:50'],
            'total_items' => ['required', 'integer', 'min:1', 'max:200'],
            'learning_objectives' => ['required', 'array', 'min:1'],
            'learning_objectives.*.code' => ['required', 'string'],
            'learning_objectives.*.description' => ['required', 'string'],
            'cognitive_levels' => ['required', 'array'],
            'cognitive_levels.remember' => ['nullable', 'integer', 'min:0'],
            'cognitive_levels.understand' => ['nullable', 'integer', 'min:0'],
            'cognitive_levels.apply' => ['nullable', 'integer', 'min:0'],
            'cognitive_levels.analyze' => ['nullable', 'integer', 'min:0'],
            'cognitive_levels.evaluate' => ['nullable', 'integer', 'min:0'],
            'cognitive_levels.create' => ['nullable', 'integer', 'min:0'],
            'difficulty_level' => ['required', 'in:easy,medium,hard,mixed'],
            'question_type' => ['required', 'in:multiple_choice,true_false,essay,short_answer'],
            'additional_instructions' => ['nullable', 'string', 'max:1000'],
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
            'learning_objectives.min' => 'At least one learning objective is required.',
            'cognitive_levels.required' => 'Cognitive level distribution is required.',
            'total_items.max' => 'Maximum 200 questions per TOS.',
        ];
    }
}
