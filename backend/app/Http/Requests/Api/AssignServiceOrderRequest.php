<?php

namespace App\Http\Requests\Api;

class AssignServiceOrderRequest extends ApiFormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() === true;
    }

    protected function prepareForValidation(): void
    {
        if ($this->input('assigned_admin_id') === '') {
            $this->merge(['assigned_admin_id' => null]);
        }
    }

    public function rules(): array
    {
        return [
            'assigned_admin_id' => ['nullable', 'integer', 'exists:users,id'],
            'start_progress' => ['nullable', 'boolean'],
        ];
    }
}
