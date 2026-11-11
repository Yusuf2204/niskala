<?php

namespace App\Http\Requests\Api;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

abstract class ApiFormRequest extends FormRequest
{
    /**
     * Strip dangerous script/style tags and HTML tags to guarantee plain text.
     */
    protected function sanitizePlainText(mixed $value, bool $preserveNewlines = false): ?string
    {
        if (! is_string($value)) {
            return $value === null ? null : (string) $value;
        }

        $withoutBlocks = preg_replace('/<(script|style)\b[^>]*>.*?<\/\1>/is', '', $value);
        $plain = strip_tags((string) $withoutBlocks);

        if ($preserveNewlines) {
            $normalized = str_replace(["\r\n", "\r"], "\n", $plain);
            $collapsed = preg_replace('/[ \t]+/u', ' ', $normalized) ?? '';

            return trim(preg_replace("/\n{3,}/", "\n\n", $collapsed) ?? '');
        }

        return trim(preg_replace('/\s+/u', ' ', $plain) ?? '');
    }

    /**
     * Return standardized JSON validation errors matching rules.md.
     */
    protected function failedValidation(Validator $validator): void
    {
        throw new HttpResponseException(response()->json([
            'data' => null,
            'message' => 'The given data was invalid.',
            'errors' => $validator->errors(),
        ], 422));
    }
}
