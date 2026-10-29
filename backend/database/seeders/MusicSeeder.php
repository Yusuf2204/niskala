<?php

namespace Database\Seeders;

use App\Models\Music;
use Illuminate\Database\Seeder;

class MusicSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Music::query()->delete();

        $tracks = [
            [
                'title' => 'A Thousand Years (Piano Instrumental)',
                'artist' => 'The Piano Guys / Christina Perri',
                'file_path' => 'http://localhost:9005/niskala/music/master/a-thousand-years.mp3',
                'category' => 'wedding',
                'duration_seconds' => 270,
                'is_active' => true,
            ],
            [
                'title' => 'Canon in D (Classical Strings)',
                'artist' => 'Johann Pachelbel',
                'file_path' => 'http://localhost:9005/niskala/music/master/canon-in-d.mp3',
                'category' => 'wedding',
                'duration_seconds' => 312,
                'is_active' => true,
            ],
        ];

        foreach ($tracks as $track) {
            Music::create($track);
        }
    }
}

