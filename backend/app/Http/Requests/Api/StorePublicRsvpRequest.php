<?php

namespace App\Http\Requests\Api;

class StorePublicRsvpRequest extends ApiFormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'guest_name' => $this->sanitizePlainText($this->input('guest_name')),
            'message' => $this->sanitizePlainText($this->input('message'), true) ?: null,
            'guest_token' => $this->sanitizePlainText($this->input('guest_token')) ?: null,
        ]);
    }

    public function rules(): array
    {
        return [
            'guest_name' => 'required|string|min:1|max:150',
            'attendance_status' => 'required|string|in:attending,not_attending,tentative',
            'pax_count' => 'nullable|integer|min:0|max:20',
            'message' => 'nullable|string|max:1000',
            'guest_token' => 'nullable|string|max:64',
        ];
    }
}
