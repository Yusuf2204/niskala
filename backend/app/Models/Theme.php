<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Theme extends Model
{
    use HasFactory;

    protected $table = 'ms_themes';

    protected $fillable = [
        'name',
        'slug',
        'category',
        'description',
        'thumbnail',
        'default_config',
        'is_active',
        'version',
    ];

    protected function casts(): array
    {
        return [
            'default_config' => 'array',
            'is_active' => 'boolean',
        ];
    }

    public function invitations(): HasMany
    {
        return $this->hasMany(Invitation::class, 'theme_id');
    }
}

