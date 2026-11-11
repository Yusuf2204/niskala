<?php

namespace App\Http\Requests\Api;

use App\Models\Invitation;
use App\Rules\ReservedSlug;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class UpdateInvitationRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        if ($this->has('slug') && is_string($this->slug)) {
            $this->merge([
                'slug' => Str::slug($this->slug),
            ]);
        }
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $invitation = $this->route('invitation') ?? $this->route('id');
        $id = $invitation instanceof Invitation ? $invitation->id : $invitation;

        return [
            'title' => 'sometimes|required|string|max:255',
            'theme_id' => 'sometimes|nullable|integer|exists:ms_themes,id',
            'event_type' => 'sometimes|nullable|string|in:wedding,birthday,general',
            'slug' => [
                'sometimes',
                'required',
                'string',
                'min:3',
                'max:100',
                Rule::unique('tr_invitations', 'slug')->ignore($id),
                new ReservedSlug(),
            ],
            'cover_image' => 'sometimes|nullable|string|max:255',
            'meta_description' => 'sometimes|nullable|string|max:1000',
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

