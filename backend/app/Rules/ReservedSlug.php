<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class ReservedSlug implements ValidationRule
{
    /**
     * List of slugs reserved for system routing and internal assets.
     *
     * @var array<string>
     */
    protected array $reserved = [
        'admin',
        'api',
        'app',
        'assets',
        'auth',
        'dashboard',
        'docs',
        'documentation',
        'favicon.ico',
        'home',
        'login',
        'logout',
        'media',
        'public',
        'register',
        'robots.txt',
        'settings',
        'setup',
        'storage',
        'themes',
        'up',
        'v1',
    ];

    /**
     * Run the validation rule.
     *
     * @param  \Closure(string, ?string=): \Illuminate\Translation\PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! is_string($value)) {
            $fail('The :attribute must be a string.');

            return;
        }

        $slug = strtolower(trim($value));

        if (! preg_match('/^[a-z0-9]+(?:-[a-z0-9]+)*$/', $slug)) {
            $fail('The :attribute may only contain lowercase letters, numbers, and hyphens without consecutive or trailing hyphens.');

            return;
        }

        if (in_array($slug, $this->reserved, true)) {
            $fail('The :attribute is reserved for system use and cannot be chosen.');
        }
    }
}
