<?php

namespace App\Http\Requests\Api;

use App\Models\ServiceOrder;
use Illuminate\Validation\Rule;

class StoreServiceOrderRequest extends ApiFormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('client_notes')) {
            $this->merge([
                'client_notes' => $this->sanitizePlainText($this->input('client_notes'), true),
            ]);
        }

        if ($this->input('invitation_id') === '' || $this->input('invitation_id') === null) {
            $this->merge(['invitation_id' => null]);
        }
    }

    public function rules(): array
    {
        return [
            'service_type' => ['required', 'string', Rule::in(ServiceOrder::SERVICE_TYPES)],
            'invitation_id' => ['nullable', 'integer', 'exists:tr_invitations,id'],
            'client_notes' => ['required', 'string', 'min:10', 'max:5000'],
        ];
    }
}
