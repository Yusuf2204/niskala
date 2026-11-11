<?php

namespace App\Http\Requests\Api;

class ApproveServiceOrderRequest extends ApiFormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('client_notes') && $this->input('client_notes') !== null) {
            $this->merge([
                'client_notes' => $this->sanitizePlainText($this->input('client_notes'), true),
            ]);
        }
    }

    public function rules(): array
    {
        return [
            'publish_invitation' => ['nullable', 'boolean'],
            'client_notes' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
