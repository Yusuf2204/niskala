<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

class AuditLogger
{
    private const SENSITIVE_KEYS = [
        'password',
        'password_confirmation',
        'current_password',
        'new_password',
        'token',
        'access_token',
        'remember_token',
        'authorization',
        'secret',
        'api_key',
    ];

    /**
     * Persist an operational audit record without leaking credentials or tokens.
     */
    public function log(
        User|int $actor,
        string $action,
        Model|string $target,
        ?int $targetId = null,
        array $details = [],
        ?Request $request = null,
    ): AuditLog {
        $actorId = $actor instanceof User ? $actor->id : $actor;
        $targetType = $target instanceof Model ? $target::class : $target;
        $resolvedTargetId = $target instanceof Model ? (int) $target->getKey() : (int) $targetId;

        return AuditLog::create([
            'user_id' => $actorId,
            'action' => $action,
            'target_type' => $targetType,
            'target_id' => $resolvedTargetId,
            'details' => empty($details) ? null : $this->redact($details),
            'ip_address' => $request?->ip(),
            'created_at' => now(),
        ]);
    }

    /**
     * Recursively redact sensitive keys from metadata arrays.
     */
    private function redact(array $payload): array
    {
        $sanitized = [];

        foreach ($payload as $key => $value) {
            $normalizedKey = is_string($key) ? strtolower($key) : '';

            if ($normalizedKey !== '' && in_array($normalizedKey, self::SENSITIVE_KEYS, true)) {
                $sanitized[$key] = '[REDACTED]';
                continue;
            }

            if (is_array($value)) {
                $sanitized[$key] = $this->redact($value);
                continue;
            }

            $sanitized[$key] = $value;
        }

        return $sanitized;
    }
}
