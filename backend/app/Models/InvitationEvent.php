<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InvitationEvent extends Model
{
    use HasFactory;

    protected $table = 'tr_invitation_events';

    protected $fillable = [
        'invitation_id',
        'event_title',
        'event_date',
        'start_time',
        'end_time',
        'time_zone',
        'location_name',
        'address',
        'google_maps_url',
        'latitude',
        'longitude',
    ];

    protected function casts(): array
    {
        return [
            'event_date' => 'date',
            'latitude' => 'float',
            'longitude' => 'float',
        ];
    }

    public function invitation(): BelongsTo
    {
        return $this->belongsTo(Invitation::class, 'invitation_id');
    }
}

