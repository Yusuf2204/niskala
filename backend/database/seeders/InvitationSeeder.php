<?php

namespace Database\Seeders;

use App\Models\Guest;
use App\Models\Invitation;
use App\Models\InvitationContent;
use App\Models\InvitationEvent;
use App\Models\Rsvp;
use App\Models\Theme;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class InvitationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $user = User::first();
        if (! $user) {
            return;
        }

        $theme = Theme::where('slug', 'adat-jawa')->first();
        if (! $theme) {
            $this->call(ThemeSeeder::class);
            $theme = Theme::where('slug', 'adat-jawa')->first();
        }

        $defaultConfig = $theme?->default_config ?? [];
        $defaultSections = $defaultConfig['default_sections'] ?? [];
        $sectionPresets = $defaultConfig['section_presets'] ?? [];

        // 1. Create or Update Dummy Invitation (Adat Jawa flagship example)
        $invitation = Invitation::updateOrCreate(
            ['slug' => 'rama-shinta'],
            [
                'user_id' => $user->id,
                'theme_id' => $theme?->id,
                'title' => 'Pernikahan Rama & Shinta',
                'event_type' => 'wedding',
                'status' => 'published',
                'cover_image' => 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
                'meta_description' => 'Undangan Pernikahan Rama Wijaya & Shinta Dewi — Nuansa Ornamen Adat Jawa.',
                'published_at' => now(),
            ]
        );

        // 2. Build deterministic sections_data from ThemeSeeder presets
        $sectionsData = [];
        foreach ($defaultSections as $index => $sectionType) {
            $sectionsData[] = [
                'id' => Str::slug($sectionType).'-1',
                'type' => $sectionType,
                'order' => $index,
                'props' => $sectionPresets[$sectionType] ?? [],
            ];
        }

        // 3. Save InvitationContent with complete theme settings
        InvitationContent::updateOrCreate(
            ['invitation_id' => $invitation->id],
            [
                'schema_version' => '1.0.0',
                'sections_data' => $sectionsData,
                'music_url' => $defaultConfig['default_music_url'] ?? null,
                'settings' => [
                    'theme_style' => $defaultConfig['theme_style'] ?? ($theme?->slug ?? 'adat-jawa'),
                    'palette' => $defaultConfig['palette'] ?? null,
                    'typography' => $defaultConfig['typography'] ?? null,
                    'assets' => $defaultConfig['assets'] ?? null,
                    'animation' => $defaultConfig['animation'] ?? null,
                ],
            ]
        );

        // 4. Save Invitation Events (idempotent cleanup of renamed sample titles)
        InvitationEvent::where('invitation_id', $invitation->id)
            ->whereNotIn('event_title', ['Akad Nikah / Ijab Kabul', 'Resepsi Pernikahan'])
            ->delete();

        InvitationEvent::updateOrCreate(
            [
                'invitation_id' => $invitation->id,
                'event_title' => 'Akad Nikah / Ijab Kabul',
            ],
            [
                'event_date' => '2026-12-12',
                'start_time' => '08:00',
                'end_time' => '10:00',
                'time_zone' => 'WIB',
                'location_name' => 'Pendopo Agung Handrawina',
                'address' => 'Jl. Taman Siswa No. 45, Keraton, Yogyakarta',
                'google_maps_url' => 'https://maps.google.com/?q=Keraton+Yogyakarta',
            ]
        );

        InvitationEvent::updateOrCreate(
            [
                'invitation_id' => $invitation->id,
                'event_title' => 'Resepsi Pernikahan',
            ],
            [
                'event_date' => '2026-12-12',
                'start_time' => '11:00',
                'end_time' => '14:00',
                'time_zone' => 'WIB',
                'location_name' => 'Sasana Hinggil Handrawina',
                'address' => 'Jl. Taman Siswa No. 45, Keraton, Yogyakarta',
                'google_maps_url' => 'https://maps.google.com/?q=Keraton+Yogyakarta',
            ]
        );

        // 5. Idempotent sample guests & wishes for Rama & Shinta
        $sampleGuests = [
            [
                'slug_token' => 'rama-vip-01',
                'name' => 'Bapak Surya Pratama & Ibu',
                'phone_number' => '6281234567890',
                'category' => 'VIP',
                'pax_allocated' => 2,
            ],
            [
                'slug_token' => 'rama-fam-02',
                'name' => 'Keluarga Besar Handrawina',
                'phone_number' => '6281298765432',
                'category' => 'Family',
                'pax_allocated' => 4,
            ],
            [
                'slug_token' => 'rama-frd-03',
                'name' => 'Siti Aminah',
                'phone_number' => '6281355551234',
                'category' => 'Friend',
                'pax_allocated' => 1,
            ],
        ];

        $vipGuest = null;
        foreach ($sampleGuests as $guestData) {
            $guest = Guest::updateOrCreate(
                ['slug_token' => $guestData['slug_token']],
                [
                    'invitation_id' => $invitation->id,
                    'name' => $guestData['name'],
                    'phone_number' => $guestData['phone_number'],
                    'category' => $guestData['category'],
                    'pax_allocated' => $guestData['pax_allocated'],
                ]
            );
            if ($guestData['slug_token'] === 'rama-vip-01') {
                $vipGuest = $guest;
            }
        }

        if ($invitation->rsvps()->count() === 0) {
            Rsvp::firstOrCreate(
                [
                    'invitation_id' => $invitation->id,
                    'guest_name' => 'Bapak Surya Pratama & Ibu',
                ],
                [
                    'guest_id' => $vipGuest?->id,
                    'attendance_status' => 'attending',
                    'pax_count' => 2,
                    'message' => 'Selamat menempuh hidup baru Rama & Shinta, semoga senantiasa diberikan keberkahan dan kebahagiaan.',
                    'is_hidden' => false,
                ]
            );

            Rsvp::firstOrCreate(
                [
                    'invitation_id' => $invitation->id,
                    'guest_name' => 'Andi Wijaya',
                ],
                [
                    'attendance_status' => 'tentative',
                    'pax_count' => 1,
                    'message' => 'Semoga acaranya berjalan lancar dan penuh khidmat, doa terbaik untuk kedua mempelai!',
                    'is_hidden' => false,
                ]
            );
        }
    }
}
