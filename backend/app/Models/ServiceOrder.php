<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ServiceOrder extends Model
{
    use HasFactory;

    protected $table = 'tr_service_orders';

    public const SERVICE_TYPES = [
        'full_creation',
        'custom_styling',
        'data_entry',
        'review',
    ];

    public const STATUS_PENDING_REVIEW = 'pending_review';
    public const STATUS_IN_PROGRESS = 'in_progress';
    public const STATUS_CLIENT_REVIEW = 'client_review';
    public const STATUS_COMPLETED = 'completed';
    public const STATUS_CANCELLED = 'cancelled';

    public const STATUSES = [
        self::STATUS_PENDING_REVIEW,
        self::STATUS_IN_PROGRESS,
        self::STATUS_CLIENT_REVIEW,
        self::STATUS_COMPLETED,
        self::STATUS_CANCELLED,
    ];

    /**
     * Allowed state transitions following PRD 06 workflow.
     */
    public const ALLOWED_TRANSITIONS = [
        self::STATUS_PENDING_REVIEW => [
            self::STATUS_PENDING_REVIEW,
            self::STATUS_IN_PROGRESS,
            self::STATUS_CANCELLED,
        ],
        self::STATUS_IN_PROGRESS => [
            self::STATUS_IN_PROGRESS,
            self::STATUS_CLIENT_REVIEW,
            self::STATUS_CANCELLED,
        ],
        self::STATUS_CLIENT_REVIEW => [
            self::STATUS_CLIENT_REVIEW,
            self::STATUS_IN_PROGRESS,
            self::STATUS_COMPLETED,
            self::STATUS_CANCELLED,
        ],
        self::STATUS_COMPLETED => [
            self::STATUS_COMPLETED,
        ],
        self::STATUS_CANCELLED => [
            self::STATUS_CANCELLED,
        ],
    ];

    protected $fillable = [
        'user_id',
        'invitation_id',
        'order_number',
        'service_type',
        'status',
        'client_notes',
        'admin_notes',
        'assigned_admin_id',
        'completed_at',
    ];

    protected function casts(): array
    {
        return [
            'completed_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function invitation(): BelongsTo
    {
        return $this->belongsTo(Invitation::class, 'invitation_id');
    }

    public function assignedAdmin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_admin_id');
    }

    public function canTransitionTo(string $targetStatus): bool
    {
        $allowed = self::ALLOWED_TRANSITIONS[$this->status] ?? [];

        return in_array($targetStatus, $allowed, true);
    }

    public function isTerminal(): bool
    {
        return in_array($this->status, [self::STATUS_COMPLETED, self::STATUS_CANCELLED], true);
    }
}
