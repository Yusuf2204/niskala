<?php

namespace Database\Seeders;

use App\Models\Theme;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;

class ThemeSeeder extends Seeder
{
    /**
     * Local SVG assets bundled under storage/app/theme-assets/adat-jawa.
     *
     * @var array<int, string>
     */
    private const ADAT_JAWA_ASSETS = [
        'ornaments/gunungan-gold.svg',
        'ornaments/divider-keraton.svg',
        'ornaments/corner-ornament.svg',
        'ornaments/frame-joglo.svg',
        'patterns/batik-kawung-subtle.svg',
        'patterns/batik-truntum-subtle.svg',
        'icons/icon-siraman.svg',
        'icons/icon-midodareni.svg',
        'icons/icon-akad.svg',
        'icons/icon-panggih.svg',
        'thumbnails/adat-jawa-thumb.svg',
    ];

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $storageUrl = $this->resolvePublicBucketUrl();
        $this->syncThemeAssetsToStorage('adat-jawa', self::ADAT_JAWA_ASSETS);

        $assetBase = "{$storageUrl}/themes/adat-jawa";
        $musicBase = "{$storageUrl}/music/master";

        Theme::updateOrCreate(
            ['slug' => 'adat-jawa'],
            [
                'name' => 'Adat Jawa',
                'category' => 'wedding',
                'description' => 'Tema pernikahan bernuansa Keraton Jawa yang anggun dan sakral, dilengkapi hiasan ornamen Gunungan emas, ukiran sudut, bingkai foto Joglo, serta motif batik Kawung & Truntum.',
                'thumbnail' => "{$assetBase}/thumbnails/adat-jawa-thumb.svg",
                'is_active' => true,
                'version' => '1.1.0',
                'default_config' => [
                    'theme_style' => 'adat-jawa',
                    'palette' => [
                        'bg' => '#FAF6EE',
                        'background' => '#FAF6EE',
                        'surface' => '#F3ECE0',
                        'card' => '#FFFDF9',
                        'primary' => '#8A6728',
                        'secondary' => '#4A3525',
                        'text' => '#2B1E16',
                        'muted' => '#6A5342',
                        'accent' => '#C5A059',
                        'dark_bg' => '#241B15',
                        'border' => 'rgba(197, 160, 89, 0.38)',
                    ],
                    'typography' => [
                        'heading' => "'Playfair Display', Georgia, serif",
                        'body' => "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif",
                        'heading_font' => "'Playfair Display', Georgia, serif",
                        'body_font' => "'Plus Jakarta Sans', sans-serif",
                    ],
                    'animation' => [
                        'preset' => 'keraton-royal',
                        'gate_style' => 'keraton-reveal',
                        'section_reveal' => 'fade-up-slow',
                        'ornament_motion' => true,
                    ],
                    'default_music_url' => "{$musicBase}/canon-in-d.mp3",
                    'assets' => [
                        'ornament' => 'gunungan',
                        'gunungan_url' => "{$assetBase}/ornaments/gunungan-gold.svg",
                        'divider_url' => "{$assetBase}/ornaments/divider-keraton.svg",
                        'corner_url' => "{$assetBase}/ornaments/corner-ornament.svg",
                        'frame_url' => "{$assetBase}/ornaments/frame-joglo.svg",
                        'pattern_url' => "{$assetBase}/patterns/batik-kawung-subtle.svg",
                        'pattern_secondary_url' => "{$assetBase}/patterns/batik-truntum-subtle.svg",
                        'icon_siraman_url' => "{$assetBase}/icons/icon-siraman.svg",
                        'icon_midodareni_url' => "{$assetBase}/icons/icon-midodareni.svg",
                        'icon_akad_url' => "{$assetBase}/icons/icon-akad.svg",
                        'icon_panggih_url' => "{$assetBase}/icons/icon-panggih.svg",
                    ],
                    'default_sections' => [
                        'HeroCover',
                        'CoupleProfile',
                        'CountdownTimer',
                        'EventSchedule',
                        'TraditionAccordion',
                        'LocationMap',
                        'LoveStory',
                        'PhotoGallery',
                        'GiftRegistry',
                        'RsvpSection',
                        'FooterSection',
                    ],
                    'section_presets' => [
                        'HeroCover' => [
                            'title' => 'Undangan Pernikahan',
                            'primary_names' => 'Rama & Shinta',
                            'date_text' => 'Sabtu, 12 Desember 2026',
                            'quote' => 'Maha Suci Tuhan yang telah menciptakan makhluk-Nya berpasang-pasangan. Dengan memohon rahmat dan rida-Nya, kami mengundang Anda menuju hari bahagia kami.',
                            'bg_image_url' => 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80',
                            'bg_pattern_url' => "{$assetBase}/patterns/batik-kawung-subtle.svg",
                            'ornament_url' => "{$assetBase}/ornaments/gunungan-gold.svg",
                            'divider_url' => "{$assetBase}/ornaments/divider-keraton.svg",
                            'corner_url' => "{$assetBase}/ornaments/corner-ornament.svg",
                            'open_button_text' => 'Buka Undangan',
                            'guest_greeting_prefix' => 'Kepada Yth. Bapak/Ibu/Saudara/i:',
                            'ornament_type' => 'gunungan',
                            'text_align' => 'center',
                        ],
                        'CoupleProfile' => [
                            'section_title' => 'Mempelai Pria & Wanita',
                            'quote' => 'Dengan memohon rahmat dan rida Tuhan Yang Maha Esa, kami bermaksud menyelenggarakan syukuran pernikahan putra-putri kami:',
                            'frame_url' => "{$assetBase}/ornaments/frame-joglo.svg",
                            'divider_url' => "{$assetBase}/ornaments/divider-keraton.svg",
                            'groom_name' => 'Rama Wijaya, S.Kom.',
                            'groom_parents' => 'Putra pertama dari Bpk. Danu Wijaya & Ibu Maya Kartika',
                            'groom_photo' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
                            'groom_instagram' => '@ramawijaya',
                            'bride_name' => 'Shinta Dewi, S.E.',
                            'bride_parents' => 'Putri kedua dari Bpk. Surya Pratama & Ibu Ratna Sari',
                            'bride_photo' => 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80',
                            'bride_instagram' => '@shintadewi',
                        ],
                        'CountdownTimer' => [
                            'title' => 'Menghitung Hari Bahagia',
                            'target_date' => '2026-12-12T08:00:00',
                            'description' => 'Setiap detik membawa kami semakin dekat menuju ikrar janji suci di hadapan keluarga dan sahabat tercinta.',
                        ],
                        'EventSchedule' => [
                            'title' => 'Rangkaian Acara',
                            'subtitle' => 'Waktu & Tempat Pelaksanaan',
                            'events' => [
                                [
                                    'id' => '1',
                                    'name' => 'Akad Nikah / Ijab Kabul',
                                    'date' => 'Sabtu, 12 Desember 2026',
                                    'time' => '08:00 - 10:00 WIB',
                                    'location' => 'Pendopo Agung Handrawina',
                                    'address' => 'Jl. Taman Siswa No. 45, Keraton, Yogyakarta',
                                ],
                                [
                                    'id' => '2',
                                    'name' => 'Resepsi Pernikahan',
                                    'date' => 'Sabtu, 12 Desember 2026',
                                    'time' => '11:00 - 14:00 WIB',
                                    'location' => 'Sasana Hinggil Handrawina',
                                    'address' => 'Jl. Taman Siswa No. 45, Keraton, Yogyakarta',
                                ],
                            ],
                        ],
                        'TraditionAccordion' => [
                            'title' => 'Prosesi & Rangkaian Adat Jawa',
                            'subtitle' => 'Urutan Upacara Sakral Pernikahan',
                            'ornament' => 'gunungan',
                            'divider_url' => "{$assetBase}/ornaments/divider-keraton.svg",
                            'items' => [
                                [
                                    'id' => 'item-1',
                                    'title' => 'Upacara Siraman',
                                    'icon_url' => "{$assetBase}/icons/icon-siraman.svg",
                                    'time_info' => 'Jumat, 11 Desember 2026 — 09:00 WIB',
                                    'location' => 'Kediaman Mempelai Wanita',
                                    'description' => 'Prosesi penyucian diri lahir dan batin dengan air tujuh sumber dan bunga setaman sebagai simbol kesiapan memasuki kehidupan baru.',
                                ],
                                [
                                    'id' => 'item-2',
                                    'title' => 'Malam Midodareni',
                                    'icon_url' => "{$assetBase}/icons/icon-midodareni.svg",
                                    'time_info' => 'Jumat, 11 Desember 2026 — 19:00 WIB',
                                    'location' => 'Kediaman Mempelai Wanita',
                                    'description' => 'Malam tirakatan dan doa keluarga menjelang akad nikah sebagai permohonan berkah, ketenteraman, dan kelancaran acara.',
                                ],
                                [
                                    'id' => 'item-3',
                                    'title' => 'Ijab Kabul / Akad Nikah',
                                    'icon_url' => "{$assetBase}/icons/icon-akad.svg",
                                    'time_info' => 'Sabtu, 12 Desember 2026 — 08:00 WIB',
                                    'location' => 'Pendopo Agung Handrawina',
                                    'description' => 'Pengucapan ikrar suci pernikahan yang disaksikan oleh keluarga besar, wali nikah, serta para saksi.',
                                ],
                                [
                                    'id' => 'item-4',
                                    'title' => 'Upacara Panggih',
                                    'icon_url' => "{$assetBase}/icons/icon-panggih.svg",
                                    'time_info' => 'Sabtu, 12 Desember 2026 — 10:00 WIB',
                                    'location' => 'Sasana Hinggil Handrawina',
                                    'description' => 'Pertemuan resmi kedua mempelai setelah sah menikah melalui tradisi balangan gantal, wijik suku, sinduran, kacar-kucur, dan sungkeman.',
                                ],
                                [
                                    'id' => 'item-5',
                                    'title' => 'Resepsi Pernikahan',
                                    'icon_url' => "{$assetBase}/icons/icon-panggih.svg",
                                    'time_info' => 'Sabtu, 12 Desember 2026 — 11:30 - 14:00 WIB',
                                    'location' => 'Grand Ballroom Handrawina',
                                    'description' => 'Ramah tamah bersama keluarga besar, kerabat, dan seluruh tamu undangan untuk berbagi kebahagiaan.',
                                ],
                            ],
                        ],
                        'LocationMap' => [
                            'title' => 'Lokasi & Peta Acara',
                            'venue_name' => 'Pendopo Agung Handrawina',
                            'address' => 'Jl. Taman Siswa No. 45, Keraton, Yogyakarta',
                            'maps_embed_url' => 'https://maps.google.com/maps?q=Keraton+Yogyakarta&t=&z=15&ie=UTF8&iwloc=&output=embed',
                            'maps_direction_url' => 'https://maps.google.com/?q=Keraton+Yogyakarta',
                            'button_label' => 'Buka di Google Maps',
                        ],
                        'LoveStory' => [
                            'title' => 'Kisah Kasih Kami',
                            'subtitle' => 'Perjalanan Menuju Satu Ikatan Suci',
                            'stories' => [
                                [
                                    'year' => '2020',
                                    'title' => 'Awal Bertemu',
                                    'text' => 'Pertemuan pertama dalam sebuah kegiatan kampus yang menjadi awal tumbuhnya rasa saling mengenal.',
                                ],
                                [
                                    'year' => '2023',
                                    'title' => 'Menjalin Komitmen',
                                    'text' => 'Setelah melalui banyak cerita dan perjalanan bersama, kami sepakat melangkah lebih serius dengan restu orang tua.',
                                ],
                                [
                                    'year' => '2026',
                                    'title' => 'Menuju Pelaminan',
                                    'text' => 'Dengan doa serta restu keluarga besar, kami memantapkan hati untuk mengikat janji suci pernikahan.',
                                ],
                            ],
                        ],
                        'PhotoGallery' => [
                            'title' => 'Momen Bahagia',
                            'subtitle' => 'Galeri Foto Kenangan & Prewedding',
                            'images' => [
                                'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80',
                                'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80',
                                'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
                                'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&w=800&q=80',
                            ],
                        ],
                        'GiftRegistry' => [
                            'title' => 'Tanda Kasih & Amplop Digital',
                            'note' => 'Doa restu Anda merupakan karunia terindah bagi kami. Namun jika Anda berkenan memberikan tanda kasih, dapat disalurkan melalui rekening berikut:',
                            'accounts' => [
                                ['bank' => 'BCA', 'number' => '882-019-3321', 'holder' => 'Rama Wijaya'],
                                ['bank' => 'Bank Mandiri', 'number' => '137-00-9821-332', 'holder' => 'Shinta Dewi'],
                            ],
                            'physical_gift_address' => 'Jl. Taman Siswa No. 45, Keraton, Yogyakarta (Penerima: Shinta Dewi)',
                        ],
                        'RsvpSection' => [
                            'title' => 'Konfirmasi Kehadiran & Doa',
                            'subtitle' => 'Merupakan kehormatan bagi kami atas kehadiran serta doa restu Anda',
                            'note' => 'Mohon berkenan mengisi konfirmasi kehadiran sebelum 1 Desember 2026 demi kelancaran penyambutan tamu.',
                        ],
                        'FooterSection' => [
                            'closing_quote' => 'Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir untuk memberikan doa restu.',
                            'family_signatures' => 'Keluarga Besar Bpk. Danu Wijaya & Bpk. Surya Pratama',
                            'brand_credit' => 'Niskala Digital Invitation',
                        ],
                    ],
                ],
            ]
        );
    }

    private function resolvePublicBucketUrl(): string
    {
        $configured = rtrim((string) config('filesystems.disks.s3.url', ''), '/');
        if ($configured !== '') {
            return $configured;
        }

        return 'http://localhost:9005/niskala';
    }

    /**
     * Sync local theme SVG assets into MinIO/S3 when reachable so asset URLs stay valid after fresh setups.
     *
     * @param  array<int, string>  $relativePaths
     */
    private function syncThemeAssetsToStorage(string $themeSlug, array $relativePaths): void
    {
        try {
            $disk = Storage::disk('s3');
            foreach ($relativePaths as $relativePath) {
                $localPath = storage_path("app/theme-assets/{$themeSlug}/{$relativePath}");
                if (! file_exists($localPath)) {
                    continue;
                }

                $s3Path = "themes/{$themeSlug}/{$relativePath}";
                $disk->put($s3Path, file_get_contents($localPath), [
                    'visibility' => 'public',
                    'ContentType' => 'image/svg+xml',
                ]);
            }
        } catch (\Throwable $e) {
            // Graceful fallback when running isolated tests without S3/MinIO connectivity.
        }
    }
}
