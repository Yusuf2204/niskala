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

        $defaultConfig = $theme?->default_config ?? [];
        $palette = $defaultConfig['palette'] ?? [
            'background' => '#FAF6EE',
            'surface' => '#FFFDF9',
            'primary' => '#C5A059',
            'secondary' => '#4A3525',
            'text' => '#2B1E16',
            'accent' => '#D4AF37',
            'border' => 'rgba(197, 160, 89, 0.35)',
        ];
        $typography = $defaultConfig['typography'] ?? [
            'heading_font' => "'Playfair Display', serif",
            'body_font' => "'Plus Jakarta Sans', sans-serif",
        ];
        $defaultMusicUrl = $defaultConfig['default_music_url'] ?? 'http://localhost:9005/niskala/music/master/canon-in-d.mp3';

        // 1. Create or Update Dummy Invitation
        $invitation = Invitation::updateOrCreate(
            ['slug' => 'rama-shinta'],
            [
                'user_id' => $user->id,
                'theme_id' => $theme?->id,
                'title' => 'The Royal Wedding of Rama & Shinta',
                'event_type' => 'wedding',
                'status' => 'published',
                'cover_image' => 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
                'meta_description' => 'Dhaup Suci / The Royal Wedding of Raden Rama Wijaya & Dyah Ayu Shinta Dewi - Nuansa Pernikahan Adat Jawa Luhur Yogyakarta',
                'published_at' => now(),
            ]
        );

        // 2. Sections Data for Preview and Public Invitation
        $sectionsData = [
            [
                'id' => 'hero-cover-1',
                'type' => 'HeroCover',
                'order' => 0,
                'props' => [
                    'title' => 'Dhaup Suci / The Royal Wedding',
                    'primary_names' => 'Raden Rama & Dyah Shinta',
                    'date_text' => 'Sabtu Pahing, 12 Desember 2026',
                    'quote' => 'Mugi Gusti Ingkang Maha Agung tansah paring berkah lan karaharjan ing gesang bebrayan kito.',
                    'bg_image_url' => 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80',
                    'bg_pattern_url' => 'http://localhost:9005/niskala/themes/adat-jawa/patterns/batik-kawung-subtle.svg',
                    'ornament_url' => 'http://localhost:9005/niskala/themes/adat-jawa/ornaments/gunungan-gold.svg',
                    'divider_url' => 'http://localhost:9005/niskala/themes/adat-jawa/ornaments/divider-keraton.svg',
                    'open_button_text' => 'Buka Serat Undangan',
                    'guest_greeting_prefix' => 'Katur Dhumateng Panjenenganipun Bapak/Ibu/Sedherek:',
                    'ornament_type' => 'gunungan',
                    'text_align' => 'center',
                ],
            ],
            [
                'id' => 'couple-profile-1',
                'type' => 'CoupleProfile',
                'order' => 1,
                'props' => [
                    'section_title' => 'Sri Penganten Kakung & Putri',
                    'quote' => 'Kanthi nyenyuwun berkah dalah pangestu dhumateng Gusti Ingkang Maha Kuwaos, keparenga kulo sakeluarga ngaturi rawuh panjenengan sedaya ing pahargyan dhaup suci putra-putri kito:',
                    'frame_url' => 'http://localhost:9005/niskala/themes/adat-jawa/ornaments/frame-joglo.svg',
                    'divider_url' => 'http://localhost:9005/niskala/themes/adat-jawa/ornaments/divider-keraton.svg',
                    'groom_name' => 'Raden Rama Wijaya, S.Kom.',
                    'groom_parents' => 'Putra kakung kapisan Bpk. Danu Wijaya & Ibu Maya Kartika',
                    'groom_photo' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
                    'groom_instagram' => '@ramawijaya',
                    'bride_name' => 'Dyah Ayu Shinta Dewi, S.E.',
                    'bride_parents' => 'Putri kaping kalih Bpk. Surya Pratama & Ibu Ratna Sari',
                    'bride_photo' => 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80',
                    'bride_instagram' => '@shintadewi',
                ],
            ],
            [
                'id' => 'countdown-timer-1',
                'type' => 'CountdownTimer',
                'order' => 2,
                'props' => [
                    'title' => 'Ngetang Dinten Bahagia',
                    'target_date' => '2026-12-12T08:00:00',
                    'description' => 'Mugi tansah pinaringan berkah saha karaharjan dumugi dinten pahargyan agung.',
                ],
            ],
            [
                'id' => 'event-schedule-1',
                'type' => 'EventSchedule',
                'order' => 3,
                'props' => [
                    'title' => 'Rundown Pahargyan',
                    'subtitle' => 'Wanci & Papan Pelaksanaan',
                    'events' => [
                        [
                            'id' => '1',
                            'name' => 'Akad Nikah / Ijab Kabul',
                            'date' => 'Sabtu Pahing, 12 Desember 2026',
                            'time' => '08:00 - 10:00 WIB',
                            'location' => 'Pendopo Ageng Handrawina',
                            'address' => 'Jl. Taman Siswa No. 45, Keraton, Yogyakarta',
                        ],
                        [
                            'id' => '2',
                            'name' => 'Pahargyan Temu Manten (Resepsi)',
                            'date' => 'Sabtu Pahing, 12 Desember 2026',
                            'time' => '11:00 - 14:00 WIB',
                            'location' => 'Sasana Hinggil Handrawina',
                            'address' => 'Jl. Taman Siswa No. 45, Keraton, Yogyakarta',
                        ],
                    ],
                ],
            ],
            [
                'id' => 'tradition-accordion-1',
                'type' => 'TraditionAccordion',
                'order' => 4,
                'props' => [
                    'title' => 'Tata Upacara & Prosesi Adat Jawa',
                    'subtitle' => 'Rangkaian Ritual Suci Sakral Penganten Jawa',
                    'ornament' => 'gunungan',
                    'divider_url' => 'http://localhost:9005/niskala/themes/adat-jawa/ornaments/divider-keraton.svg',
                    'items' => [
                        [
                            'id' => 'item-1',
                            'title' => 'Upacara Siraman',
                            'icon_url' => 'http://localhost:9005/niskala/themes/adat-jawa/icons/icon-siraman.svg',
                            'time_info' => 'Jumat Pon, 11 Desember 2026 — 09:00 WIB',
                            'location' => 'Kediaman Mempelai Putri',
                            'description' => 'Upacara sesuci raga dalah jiwa calon penganten kanthi toya pitu sumber kembang setaman, pinangka lambang reresik lair lan batin sadurunge ngambah gesang anyar.',
                        ],
                        [
                            'id' => 'item-2',
                            'title' => 'Malam Midodareni',
                            'icon_url' => 'http://localhost:9005/niskala/themes/adat-jawa/icons/icon-midodareni.svg',
                            'time_info' => 'Jumat Pon, 11 Desember 2026 — 19:00 WIB',
                            'location' => 'Kediaman Mempelai Putri',
                            'description' => 'Wanci wengi ing ngendi para widadari mudhun maringi berkah kaendahan, kasekten, lan karaharjan dhumateng calon penganten putri.',
                        ],
                        [
                            'id' => 'item-3',
                            'title' => 'Ijab Kabul / Akad Nikah',
                            'icon_url' => 'http://localhost:9005/niskala/themes/adat-jawa/icons/icon-akad.svg',
                            'time_info' => 'Sabtu Pahing, 12 Desember 2026 — 08:00 WIB',
                            'location' => 'Pendopo Ageng Handrawina',
                            'description' => 'Ikrar suci prajanjen nikah ing ngarsanipun Gusti Allah SWT, saksi, para sepuh, lan wali.',
                        ],
                        [
                            'id' => 'item-4',
                            'title' => 'Upacara Panggih Penganten',
                            'icon_url' => 'http://localhost:9005/niskala/themes/adat-jawa/icons/icon-panggih.svg',
                            'time_info' => 'Sabtu Pahing, 12 Desember 2026 — 10:00 WIB',
                            'location' => 'Sasana Hinggil Handrawina',
                            'description' => 'Temuning sri penganten kakung lan putri lumantar prosesi adat Balangan Gantal, Wijik Suku/Ngidak Endhog, Sinduran, Kacar Kucur, Dahar Klimah, lan Sungkeman.',
                        ],
                        [
                            'id' => 'item-5',
                            'title' => 'Pahargyan Temu Manten (Resepsi)',
                            'icon_url' => 'http://localhost:9005/niskala/themes/adat-jawa/icons/icon-panggih.svg',
                            'time_info' => 'Sabtu Pahing, 12 Desember 2026 — 11:30 - 14:00 WIB',
                            'location' => 'Grand Ballroom Handrawina',
                            'description' => 'Syukuran agung bebarengan para tamu rawuh kinurmatan dalah sedherek kanthi suwasana pinarak gamelan lan beksan Jawa.',
                        ],
                    ],
                ],
            ],
            [
                'id' => 'location-map-1',
                'type' => 'LocationMap',
                'order' => 5,
                'props' => [
                    'title' => 'Papan Pelaksanaan & Denah',
                    'venue_name' => 'Pendopo Ageng Handrawina',
                    'address' => 'Jl. Taman Siswa No. 45, Keraton, Yogyakarta',
                    'maps_embed_url' => 'https://maps.google.com/maps?q=Keraton+Yogyakarta&t=&z=15&ie=UTF8&iwloc=&output=embed',
                    'maps_direction_url' => 'https://maps.google.com/?q=Keraton+Yogyakarta',
                    'button_label' => 'Petunjuk Arah Google Maps',
                ],
            ],
            [
                'id' => 'love-story-1',
                'type' => 'LoveStory',
                'order' => 6,
                'props' => [
                    'title' => 'Cariyos Tresna',
                    'subtitle' => 'Lampahing Katresnan Tumuju Janji Suci',
                    'stories' => [
                        [
                            'year' => '2020',
                            'title' => 'Tepang Sepisanan',
                            'text' => 'Tepang kapisan ing salebeting adicara budaya, witing tresna jalaran saka kulina.',
                        ],
                        [
                            'year' => '2023',
                            'title' => 'Nyuwun Pangestu',
                            'text' => 'Sesarengan ngadhepi lelampahan gesang kanthi tekad ingkang bulat nyawiji.',
                        ],
                        [
                            'year' => '2026',
                            'title' => 'Dhaup Suci',
                            'text' => 'Kanthi berkahing Gusti dalah pangestuning rama ibu, manteb ngambah gesang bebrayan.',
                        ],
                    ],
                ],
            ],
            [
                'id' => 'photo-gallery-1',
                'type' => 'PhotoGallery',
                'order' => 7,
                'props' => [
                    'title' => 'Momen Bahagia',
                    'subtitle' => 'Galeri Foto Kenangan & Prewedding',
                    'images' => [
                        'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80',
                        'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80',
                        'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
                        'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&w=800&q=80',
                    ],
                ],
            ],
            [
                'id' => 'gift-registry-1',
                'type' => 'GiftRegistry',
                'order' => 8,
                'props' => [
                    'title' => 'Tandha Asih & Amplop Digital',
                    'note' => 'Donga pangestu panjenengan dados kanugrahan ingkang tanpa upami tumrap sri penganten. Menawi kersa maringi tandha asih, saged lumantar saluran digital ing ngandhap punika:',
                    'accounts' => [
                        ['bank' => 'BCA', 'number' => '882-019-3321', 'holder' => 'Raden Rama Wijaya'],
                        ['bank' => 'Bank Mandiri', 'number' => '137-00-9821-332', 'holder' => 'Dyah Ayu Shinta Dewi'],
                    ],
                    'physical_gift_address' => 'Ndalem Handrawina, Jl. Taman Siswa No. 45, Keraton, Yogyakarta (Penerima: Dyah Ayu Shinta)',
                ],
            ],
            [
                'id' => 'rsvp-section-1',
                'type' => 'RsvpSection',
                'order' => 9,
                'props' => [
                    'title' => 'Konfirmasi Rawuh & Serat Donga',
                    'subtitle' => 'Kabingahan tumrap kulo sakeluarga awit rawuh panjenengan',
                    'note' => 'Kanthi andhap asoring manah, nyuwun konfirmasi rawuh saderengipun 1 Desember 2026 kagem nyiapaken papan palungguhan.',
                ],
            ],
            [
                'id' => 'footer-section-1',
                'type' => 'FooterSection',
                'order' => 10,
                'props' => [
                    'closing_quote' => 'Saking sanget ing bingahing manah, keparenga kulo sakeluarga ngaturaken agunging panuwun awit rawuh lan donga pangestu panjenengan sedaya.',
                    'family_signatures' => 'Keluarga Ageng Bpk. Danu Wijaya & Bpk. Surya Pratama',
                    'brand_credit' => 'Niskala Digital Invitation',
                ],
            ],
        ];

        // 3. Save InvitationContent
        InvitationContent::updateOrCreate(
            ['invitation_id' => $invitation->id],
            [
                'schema_version' => '1.0.0',
                'sections_data' => $sectionsData,
                'music_url' => $defaultMusicUrl,
                'settings' => [
                    'palette' => $palette,
                    'typography' => $typography,
                ],
            ]
        );

        // 4. Save Invitation Events
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
                'location_name' => 'Pendopo Ageng Handrawina',
                'address' => 'Jl. Taman Siswa No. 45, Keraton, Yogyakarta',
                'google_maps_url' => 'https://maps.google.com/?q=Keraton+Yogyakarta',
            ]
        );

        InvitationEvent::updateOrCreate(
            [
                'invitation_id' => $invitation->id,
                'event_title' => 'Pahargyan Temu Manten (Resepsi)',
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
                    'message' => 'Selamat menempuh hidup baru Raden Rama & Dyah Shinta, semoga langgeng dan penuh berkah.',
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
                    'message' => 'Semoga acaranya lancar dan sakral, doa terbaik untuk kedua mempelai!',
                    'is_hidden' => false,
                ]
            );
        }
    }
}

