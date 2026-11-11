<?php

namespace App\Http\Requests\Api;

class RequestServiceOrderRevisionRequest extends ApiFormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('revision_notes')) {
            $this->merge([
                'revision_notes' => $this->sanitizePlainText($this->input('revision_notes'), true),
            ]);
        }
    }

    public function rules(): array
    {
        return [
            'revision_notes' => ['required', 'string', 'min:5', 'max:3000'],
        ];
    }
}
