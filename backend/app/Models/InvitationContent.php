<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InvitationContent extends Model
{
    use HasFactory;

    protected $table = 'tr_invitation_contents';

    protected $fillable = [
        'invitation_id',
        'schema_version',
        'sections_data',
        'music_url',
        'settings',
    ];

    protected function casts(): array
    {
        return [
            'sections_data' => 'array',
            'settings' => 'array',
        ];
    }

    public function invitation(): BelongsTo
    {
        return $this->belongsTo(Invitation::class, 'invitation_id');
    }
}
