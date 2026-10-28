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
            ['slug' => 'adat-jawa'],
            [
                'name' => 'Adat Jawa',
                'category' => 'wedding',
                'description' => 'Nuansa agung nan sakral pernikahan adat Jawa tradisi luhur, berhiaskan ornamen Gunungan Wayang emas, aksen batik Sogan Kawung, serta susunan acara prosesi adat (Siraman, Midodareni, Akad & Panggih).',
                'thumbnail' => null,
                'is_active' => true,
                'version' => '1.0.0',
                'default_config' => [
                    'palette' => [
                        'background' => '#FAF6EE',
                        'surface' => '#FFFDF9',
                        'primary' => '#C5A059',
                        'secondary' => '#4A3525',
                        'text' => '#2B1E16',
                        'accent' => '#D4AF37',
                        'border' => 'rgba(197, 160, 89, 0.35)',
                    ],
                    'typography' => [
                        'heading_font' => "'Playfair Display', serif",
                        'body_font' => "'Plus Jakarta Sans', sans-serif",
                    ],
                    'theme_style' => 'jawa',
                    'assets' => [
                        'ornament' => 'gunungan',
                        'border_ornament' => 'ukiran_emas',
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
                            'title' => 'Dhaup Suci / The Royal Wedding',
                            'primary_names' => 'Raden Rama & Dyah Shinta',
                            'date_text' => 'Sabtu Pahing, 12 Desember 2026',
                            'quote' => 'Mugi Gusti Ingkang Maha Agung tansah paring berkah lan karaharjan ing gesang bebrayan kito.',
                            'bg_image_url' => 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80',
                            'open_button_text' => 'Buka Serat Undangan',
                            'guest_greeting_prefix' => 'Katur Dhumateng Panjenenganipun Bapak/Ibu/Sedherek:',
                            'ornament_type' => 'gunungan',
                            'text_align' => 'center',
                        ],
                        'CoupleProfile' => [
                            'section_title' => 'Sri Penganten Kakung & Putri',
                            'quote' => 'Kanthi nyenyuwun berkah dalah pangestu dhumateng Gusti Ingkang Maha Kuwaos, keparenga kulo sakeluarga ngaturi rawuh panjenengan sedaya ing pahargyan dhaup suci putra-putri kito:',
                            'groom_name' => 'Raden Rama Wijaya, S.Kom.',
                            'groom_parents' => 'Putra kakung kapisan Bpk. Danu Wijaya & Ibu Maya Kartika',
                            'groom_photo' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
                            'groom_instagram' => '@ramawijaya',
                            'bride_name' => 'Dyah Ayu Shinta Dewi, S.E.',
                            'bride_parents' => 'Putri kaping kalih Bpk. Surya Pratama & Ibu Ratna Sari',
                            'bride_photo' => 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80',
                            'bride_instagram' => '@shintadewi',
                        ],
                        'CountdownTimer' => [
                            'title' => 'Ngetang Dinten Bahagia',
                            'target_date' => '2026-12-12T08:00:00',
                            'description' => 'Mugi tansah pinaringan berkah saha karaharjan dumugi dinten pahargyan agung.',
                        ],
                        'EventSchedule' => [
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
                        'TraditionAccordion' => [
                            'title' => 'Tata Upacara & Prosesi Adat Jawa',
                            'subtitle' => 'Rangkaian Ritual Suci Sakral Penganten Jawa',
                            'ornament' => 'gunungan',
                            'items' => [
                                [
                                    'id' => 'item-1',
                                    'title' => 'Upacara Siraman',
                                    'time_info' => 'Jumat Pon, 11 Desember 2026 — 09:00 WIB',
                                    'location' => 'Kediaman Mempelai Putri',
                                    'description' => 'Upacara sesuci raga dalah jiwa calon penganten kanthi toya pitu sumber kembang setaman, pinangka lambang reresik lair lan batin sadurunge ngambah gesang anyar.',
                                ],
                                [
                                    'id' => 'item-2',
                                    'title' => 'Malam Midodareni',
                                    'time_info' => 'Jumat Pon, 11 Desember 2026 — 19:00 WIB',
                                    'location' => 'Kediaman Mempelai Putri',
                                    'description' => 'Wanci wengi ing ngendi para widadari mudhun maringi berkah kaendahan, kasekten, lan karaharjan dhumateng calon penganten putri.',
                                ],
                                [
                                    'id' => 'item-3',
                                    'title' => 'Ijab Kabul / Akad Nikah',
                                    'time_info' => 'Sabtu Pahing, 12 Desember 2026 — 08:00 WIB',
                                    'location' => 'Pendopo Ageng Handrawina',
                                    'description' => 'Ikrar suci prajanjen nikah ing ngarsanipun Gusti Allah SWT, saksi, para sepuh, lan wali.',
                                ],
                                [
                                    'id' => 'item-4',
                                    'title' => 'Upacara Panggih Penganten',
                                    'time_info' => 'Sabtu Pahing, 12 Desember 2026 — 10:00 WIB',
                                    'location' => 'Sasana Hinggil Handrawina',
                                    'description' => 'Temuning sri penganten kakung lan putri lumantar prosesi adat Balangan Gantal, Wijik Suku/Ngidak Endhog, Sinduran, Kacar Kucur, Dahar Klimah, lan Sungkeman.',
                                ],
                                [
                                    'id' => 'item-5',
                                    'title' => 'Pahargyan Temu Manten (Resepsi)',
                                    'time_info' => 'Sabtu Pahing, 12 Desember 2026 — 11:30 - 14:00 WIB',
                                    'location' => 'Grand Ballroom Handrawina',
                                    'description' => 'Syukuran agung bebarengan para tamu rawuh kinurmatan dalah sedherek kanthi suwasana pinarak gamelan lan beksan Jawa.',
                                ],
                            ],
                        ],
                        'LocationMap' => [
                            'title' => 'Papan Pelaksanaan & Denah',
                            'venue_name' => 'Pendopo Ageng Handrawina',
                            'address' => 'Jl. Taman Siswa No. 45, Keraton, Yogyakarta',
                            'maps_embed_url' => 'https://maps.google.com/maps?q=Keraton+Yogyakarta&t=&z=15&ie=UTF8&iwloc=&output=embed',
                            'maps_direction_url' => 'https://maps.google.com/?q=Keraton+Yogyakarta',
                            'button_label' => 'Petunjuk Arah Google Maps',
                        ],
                        'LoveStory' => [
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
                        'GiftRegistry' => [
                            'title' => 'Tandha Asih & Amplop Digital',
                            'note' => 'Donga pangestu panjenengan dados kanugrahan ingkang tanpa upami tumrap sri penganten. Menawi kersa maringi tandha asih, saged lumantar saluran digital ing ngandhap punika:',
                            'accounts' => [
                                ['bank' => 'BCA', 'number' => '882-019-3321', 'holder' => 'Raden Rama Wijaya'],
                                ['bank' => 'Bank Mandiri', 'number' => '137-00-9821-332', 'holder' => 'Dyah Ayu Shinta Dewi'],
                            ],
                            'physical_gift_address' => 'Ndalem Handrawina, Jl. Taman Siswa No. 45, Keraton, Yogyakarta (Penerima: Dyah Ayu Shinta)',
                        ],
                        'RsvpSection' => [
                            'title' => 'Konfirmasi Rawuh & Serat Donga',
                            'subtitle' => 'Kabingahan tumrap kulo sakeluarga awit rawuh panjenengan',
                            'note' => 'Kanthi andhap asoring manah, nyuwun konfirmasi rawuh saderengipun 1 Desember 2026 kagem nyiapaken papan palungguhan.',
                        ],
                        'FooterSection' => [
                            'closing_quote' => 'Saking sanget ing bingahing manah, keparenga kulo sakeluarga ngaturaken agunging panuwun awit rawuh lan donga pangestu panjenengan sedaya.',
                            'family_signatures' => 'Keluarga Ageng Bpk. Danu Wijaya & Bpk. Surya Pratama',
                            'brand_credit' => 'Niskala Digital Invitation',
                        ],
                    ],
                ],
            ]
        );
    }
}
