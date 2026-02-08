<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ShowPaymentIntentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'payment_intent_id' => ['required', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'payment_intent_id.required' => 'A payment intent id is required.',
            'payment_intent_id.string' => 'The payment intent id must be a string.',
        ];
    }
}
