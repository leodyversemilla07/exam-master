<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreModuleRequest extends FormRequest
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
        $moduleId = $this->route('module')?->id;

        return [
            'code' => ['required', 'string', 'max:50', 'unique:modules,code,'.$moduleId],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'pdf_file' => ['nullable', 'file', 'mimes:pdf', 'max:10240'],
            'subject_area' => ['required', 'string', 'max:100'],
            'grade_level' => ['required', 'string', 'max:50'],
            'curriculum_year' => ['required', 'integer', 'min:2020', 'max:2030'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }

    /**
     * Get custom error messages for validation rules.
     */
    public function messages(): array
    {
        return [
            'code.required' => 'Module code is required.',
            'code.unique' => 'This module code is already in use.',
            'name.required' => 'Module name is required.',
            'pdf_file.file' => 'The uploaded file must be a valid file.',
            'pdf_file.mimes' => 'The file must be a PDF.',
            'pdf_file.max' => 'The PDF file must not exceed 10MB.',
            'subject_area.required' => 'Subject area is required.',
            'grade_level.required' => 'Grade level is required.',
            'curriculum_year.required' => 'Curriculum year is required.',
            'curriculum_year.min' => 'Curriculum year must be 2020 or later.',
            'curriculum_year.max' => 'Curriculum year must be 2030 or earlier.',
        ];
    }
}
