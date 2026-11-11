<?php

namespace App\Http\Requests\Api;

class UpdateGuestRequest extends ApiFormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    protected function prepareForValidation(): void
    {
        $merged = [];
        if ($this->has('name')) {
            $merged['name'] = $this->sanitizePlainText($this->input('name'));
        }
        if ($this->has('phone_number')) {
            $merged['phone_number'] = $this->sanitizePlainText($this->input('phone_number')) ?: null;
        }
        if ($this->has('category')) {
            $merged['category'] = $this->sanitizePlainText($this->input('category')) ?: 'General';
        }
        if ($merged !== []) {
            $this->merge($merged);
        }
    }

    public function rules(): array
    {
        $categoryRule = 'sometimes|nullable|string|in:'.implode(',', StoreGuestRequest::CATEGORIES);

        return [
            'name' => 'sometimes|required|string|min:1|max:150',
            'phone_number' => 'sometimes|nullable|string|max:30',
            'category' => $categoryRule,
            'pax_allocated' => 'sometimes|nullable|integer|min:1|max:20',
        ];
    }
}
