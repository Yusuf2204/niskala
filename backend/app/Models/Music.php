<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Music extends Model
{
    use HasFactory;

    protected $table = 'ms_music';

    protected $fillable = [
        'title',
        'artist',
        'file_path',
        'category',
        'duration_seconds',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'duration_seconds' => 'integer',
            'is_active' => 'boolean',
        ];
    }
}

