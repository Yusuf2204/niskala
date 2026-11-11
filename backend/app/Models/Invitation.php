<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Invitation extends Model
{
    use HasFactory;

    protected $table = 'tr_invitations';

    protected $fillable = [
        'user_id',
        'theme_id',
        'title',
        'event_type',
        'slug',
        'status',
        'cover_image',
        'meta_description',
        'published_at',
    ];

    protected function casts(): array
    {
        return [
            'published_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function theme(): BelongsTo
    {
        return $this->belongsTo(Theme::class, 'theme_id');
    }

    public function content(): HasOne
    {
        return $this->hasOne(InvitationContent::class, 'invitation_id');
    }

    public function events(): HasMany
    {
        return $this->hasMany(InvitationEvent::class, 'invitation_id')->orderBy('event_date')->orderBy('start_time');
    }

    public function guests(): HasMany
    {
        return $this->hasMany(Guest::class, 'invitation_id')->orderBy('name');
    }

    public function rsvps(): HasMany
    {
        return $this->hasMany(Rsvp::class, 'invitation_id')->latest('id');
    }

    public function serviceOrders(): HasMany
    {
        return $this->hasMany(ServiceOrder::class, 'invitation_id')->latest('id');
    }

    public function isPublished(): bool
    {
        return $this->status === 'published';
    }

    public function isDraft(): bool
    {
        return $this->status === 'draft';
    }

    public function isArchived(): bool
    {
        return $this->status === 'archived';
    }
}

