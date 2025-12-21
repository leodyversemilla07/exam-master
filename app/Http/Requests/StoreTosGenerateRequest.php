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
            'question_types' => ['nullable', 'array'],
            'question_types.multiple_choice' => ['nullable', 'integer', 'min:0'],
            'question_types.true_false' => ['nullable', 'integer', 'min:0'],
            'question_types.essay' => ['nullable', 'integer', 'min:0'],
            'question_types.identification' => ['nullable', 'integer', 'min:0'],
            'difficulty_level' => ['required', 'in:easy,medium,hard,mixed'],
            'language' => ['nullable', 'in:english,filipino'],
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

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            // Validate cognitive levels sum
            $cognitiveSum = array_sum($this->input('cognitive_levels', []));
            if ($cognitiveSum !== $this->input('total_items')) {
                $validator->errors()->add(
                    'cognitive_levels',
                    "The sum of cognitive levels ({$cognitiveSum}) must equal the total items ({$this->input('total_items')})."
                );
            }

            // Validate question types sum
            $questionTypesSum = array_sum($this->input('question_types', []));
            if ($questionTypesSum !== $this->input('total_items')) {
                $validator->errors()->add(
                    'question_types',
                    "The sum of question types ({$questionTypesSum}) must equal the total items ({$this->input('total_items')})."
                );
            }
        });
    }
}
