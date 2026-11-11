<?php

namespace Database\Seeders;

use App\Models\Music;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;

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
                'file_name' => 'a-thousand-years.mp3',
                'file_path' => 'http://localhost:9005/niskala/music/master/a-thousand-years.mp3',
                'category' => 'wedding',
                'duration_seconds' => 270,
                'is_active' => true,
            ],
            [
                'title' => 'Canon in D (Classical Strings)',
                'artist' => 'Johann Pachelbel',
                'file_name' => 'canon-in-d.mp3',
                'file_path' => 'http://localhost:9005/niskala/music/master/canon-in-d.mp3',
                'category' => 'wedding',
                'duration_seconds' => 312,
                'is_active' => true,
            ],
        ];

        // Ensure files exist in S3/MinIO master folder if available
        try {
            $disk = Storage::disk('s3');
            foreach ($tracks as $track) {
                $s3Path = 'music/master/' . $track['file_name'];
                $localPath = storage_path('app/theme-assets/music/' . $track['file_name']);
                if (file_exists($localPath) && !$disk->exists($s3Path)) {
                    $disk->put($s3Path, file_get_contents($localPath), 'public');
                }
            }
        } catch (\Throwable $e) {
            // Graceful fallback for offline testing environments
        }

        foreach ($tracks as $track) {
            unset($track['file_name']);
            Music::create($track);
        }
    }
}

