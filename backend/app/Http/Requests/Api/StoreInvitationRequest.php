<?php

namespace App\Http\Requests\Api;

use App\Rules\ReservedSlug;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Support\Str;

class StoreInvitationRequest extends FormRequest
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
        return [
            'title' => 'required|string|max:255',
            'theme_id' => 'required|integer|exists:ms_themes,id',
            'event_type' => 'nullable|string|in:wedding,birthday,general',
            'slug' => [
                'nullable',
                'string',
                'min:3',
                'max:100',
                'unique:tr_invitations,slug',
                new ReservedSlug(),
            ],
            'cover_image' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:1000',

            // Initial event session (optional)
            'event_title' => 'nullable|string|max:150',
            'event_date' => 'nullable|date',
            'start_time' => 'nullable|string|max:10',
            'end_time' => 'nullable|string|max:10',
            'time_zone' => 'nullable|string|max:50',
            'location_name' => 'nullable|string|max:255',
            'address' => 'nullable|string|max:1000',
            'google_maps_url' => 'nullable|string|max:1000',
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
