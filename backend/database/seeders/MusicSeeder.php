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
        $tracks = [
            [
                'title' => 'A Thousand Years (Piano Instrumental)',
                'artist' => 'The Piano Guys',
                'file_path' => '/assets/music/a-thousand-years.mp3',
                'category' => 'wedding',
                'duration_seconds' => 255,
                'is_active' => true,
            ],
            [
                'title' => 'Canon in D (Strings & Acoustic)',
                'artist' => 'Pachelbel Chamber',
                'file_path' => '/assets/music/canon-in-d.mp3',
                'category' => 'wedding',
                'duration_seconds' => 312,
                'is_active' => true,
            ],
            [
                'title' => 'Teman Hidup (Acoustic Warmth)',
                'artist' => 'Niskala Acoustic Studio',
                'file_path' => '/assets/music/teman-hidup.mp3',
                'category' => 'wedding',
                'duration_seconds' => 238,
                'is_active' => true,
            ],
            [
                'title' => 'Melody of Joy (Cheerful Beats)',
                'artist' => 'Soundscape Lab',
                'file_path' => '/assets/music/melody-of-joy.mp3',
                'category' => 'birthday',
                'duration_seconds' => 195,
                'is_active' => true,
            ],
        ];

        foreach ($tracks as $track) {
            Music::updateOrCreate(
                ['title' => $track['title']],
                $track
            );
        }
    }
}
