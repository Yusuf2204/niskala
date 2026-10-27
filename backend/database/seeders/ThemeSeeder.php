<?php

namespace Database\Seeders;

use App\Models\Theme;
use Illuminate\Database\Seeder;

class ThemeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Theme::updateOrCreate(
            ['slug' => 'classic-ivory'],
            [
                'name' => 'Classic Ivory',
                'category' => 'wedding',
                'description' => 'Tema klasik bernuansa hangat, elegan, dan abadi dengan palet Ivory 60%, Charcoal 30%, dan Muted Gold 10%.',
                'thumbnail' => '/assets/themes/classic-ivory.jpg',
                'default_config' => [
                    'palette' => [
                        'background' => '#F1EDE5',
                        'surface' => '#FAF8F5',
                        'primary' => '#34342F',
                        'text' => '#34342F',
                        'accent' => '#A68B65',
                    ],
                    'typography' => [
                        'heading_font' => 'Playfair Display, serif',
                        'body_font' => 'Plus Jakarta Sans, sans-serif',
                    ],
                    'default_sections' => [
                        'HeroCover',
                        'CoupleProfile',
                        'CountdownTimer',
                        'EventSchedule',
                        'LocationMap',
                        'RsvpForm',
                        'FooterSection',
                    ],
                ],
                'is_active' => true,
                'version' => '1.0.0',
            ]
        );

        Theme::updateOrCreate(
            ['slug' => 'modern-charcoal'],
            [
                'name' => 'Modern Charcoal',
                'category' => 'wedding',
                'description' => 'Tema malam eksklusif dan mewah dengan perpaduan Deep Charcoal dan Champagne Gold.',
                'thumbnail' => '/assets/themes/modern-charcoal.jpg',
                'default_config' => [
                    'palette' => [
                        'background' => '#242420',
                        'surface' => '#2D2D28',
                        'primary' => '#D8C2A0',
                        'text' => '#F1EDE5',
                        'accent' => '#D8C2A0',
                    ],
                    'typography' => [
                        'heading_font' => 'Cinzel, serif',
                        'body_font' => 'Inter, sans-serif',
                    ],
                    'default_sections' => [
                        'HeroCover',
                        'CoupleProfile',
                        'CountdownTimer',
                        'EventSchedule',
                        'LocationMap',
                        'RsvpForm',
                        'FooterSection',
                    ],
                ],
                'is_active' => true,
                'version' => '1.0.0',
            ]
        );
    }
}

