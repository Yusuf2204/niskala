<?php

namespace App\Http\Requests\Api;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class UpdateInvitationContentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'schema_version' => 'nullable|string|max:20',
            'sections_data' => 'required|array',
            'sections_data.*.id' => 'required|string',
            'sections_data.*.type' => 'required|string',
            'sections_data.*.props' => 'nullable|array',
            'sections_data.*.order' => 'nullable|integer',
            'music_url' => 'nullable|string|max:255',
            'settings' => 'nullable|array',
        ];
    }

    protected function failedValidation(Validator $validator): void
    {
        throw new HttpResponseException(response()->json([
            'data' => null,
            'message' => 'The given data was invalid.',
            'errors' => $validator->errors(),
        ], 422));
    }
}
