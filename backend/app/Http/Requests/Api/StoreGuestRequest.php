<?php

namespace App\Http\Requests\Api;

class StoreGuestRequest extends ApiFormRequest
{
    public const CATEGORIES = ['General', 'VIP', 'Family', 'Colleague', 'Friend'];

    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    protected function prepareForValidation(): void
    {
        $sanitizeGuest = function (array $item): array {
            $category = $this->sanitizePlainText($item['category'] ?? null);

            return [
                ...$item,
                'name' => $this->sanitizePlainText($item['name'] ?? null),
                'phone_number' => $this->sanitizePlainText($item['phone_number'] ?? null) ?: null,
                'category' => $category ?: 'General',
            ];
        };

        if (is_array($this->input('guests'))) {
            $sanitizedBatch = array_map(
                fn ($row) => is_array($row) ? $sanitizeGuest($row) : $row,
                $this->input('guests'),
            );
            $this->merge(['guests' => $sanitizedBatch]);

            return;
        }

        $this->merge($sanitizeGuest($this->all()));
    }

    public function rules(): array
    {
        $categoryRule = 'nullable|string|in:'.implode(',', self::CATEGORIES);

        return [
            'guests' => 'sometimes|array|min:1|max:100',
            'guests.*.name' => 'required_with:guests|string|min:1|max:150',
            'guests.*.phone_number' => 'nullable|string|max:30',
            'guests.*.category' => $categoryRule,
            'guests.*.pax_allocated' => 'nullable|integer|min:1|max:20',

            'name' => 'required_without:guests|nullable|string|min:1|max:150',
            'phone_number' => 'nullable|string|max:30',
            'category' => $categoryRule,
            'pax_allocated' => 'nullable|integer|min:1|max:20',
        ];
    }
}
