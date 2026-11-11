<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Guest extends Model
{
    use HasFactory;

    protected $table = 'tr_guests';

    protected $fillable = [
        'invitation_id',
        'name',
        'slug_token',
        'phone_number',
        'category',
        'pax_allocated',
    ];

    protected function casts(): array
    {
        return [
            'pax_allocated' => 'integer',
        ];
    }

    public function invitation(): BelongsTo
    {
        return $this->belongsTo(Invitation::class, 'invitation_id');
    }

    public function rsvps(): HasMany
    {
        return $this->hasMany(Rsvp::class, 'guest_id');
    }
}
