<?php

namespace App\Http\Requests\Api;

use App\Models\ServiceOrder;
use Illuminate\Validation\Rule;

class UpdateServiceOrderStatusRequest extends ApiFormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() === true;
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('admin_notes') && $this->input('admin_notes') !== null) {
            $this->merge([
                'admin_notes' => $this->sanitizePlainText($this->input('admin_notes'), true),
            ]);
        }

        if ($this->input('invitation_id') === '') {
            $this->merge(['invitation_id' => null]);
        }
    }

    public function rules(): array
    {
        return [
            'status' => ['required', 'string', Rule::in(ServiceOrder::STATUSES)],
            'admin_notes' => ['nullable', 'string', 'max:5000'],
            'invitation_id' => ['nullable', 'integer', 'exists:tr_invitations,id'],
        ];
    }
}
