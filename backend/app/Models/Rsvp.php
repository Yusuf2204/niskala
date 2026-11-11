<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Rsvp extends Model
{
    use HasFactory;

    protected $table = 'tr_rsvps';

    protected $fillable = [
        'invitation_id',
        'guest_id',
        'guest_name',
        'attendance_status',
        'pax_count',
        'message',
        'ip_address',
        'user_agent',
        'is_hidden',
    ];

    protected function casts(): array
    {
        return [
            'pax_count' => 'integer',
            'is_hidden' => 'boolean',
        ];
    }

    public function invitation(): BelongsTo
    {
        return $this->belongsTo(Invitation::class, 'invitation_id');
    }

    public function guest(): BelongsTo
    {
        return $this->belongsTo(Guest::class, 'guest_id');
    }
}
