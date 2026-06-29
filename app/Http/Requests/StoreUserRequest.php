<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Spatie\Permission\Models\Role;

class StoreUserRequest extends FormRequest
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
        $userId = $this->route('user')?->id;

        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users')->ignore($userId)],
            'organization' => ['nullable', 'string', 'max:255'],
            'password' => [
                $userId ? 'nullable' : 'required',
                'string',
                'min:8',
                'confirmed',
            ],
            'role' => ['nullable', 'string', Rule::in($this->assignableRoleNames())],
        ];
    }

    /**
     * Get the roles the current user may assign.
     *
     * @return array<int, string>
     */
    private function assignableRoleNames(): array
    {
        $roles = Role::query()->pluck('name')->all();

        if ($this->user()?->hasRole('super-admin')) {
            return $roles;
        }

        return array_values(array_filter($roles, fn (string $role): bool => $role !== 'super-admin'));
    }

    /**
     * Get custom error messages for validation rules.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Name is required.',
            'email.required' => 'Email is required.',
            'email.email' => 'Please enter a valid email address.',
            'email.unique' => 'This email is already registered.',
            'password.required' => 'Password is required.',
            'password.min' => 'Password must be at least 8 characters.',
            'password.confirmed' => 'Password confirmation does not match.',
            'role.in' => 'You are not allowed to assign the selected role.',
        ];
    }
}
