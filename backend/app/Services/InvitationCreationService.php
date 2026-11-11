<?php

namespace App\Services;

use App\Models\Invitation;
use App\Models\Theme;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class InvitationCreationService
{
    private const RESERVED_SLUGS = [
        'admin',
        'api',
        'dashboard',
        'public',
        'storage',
        'docs',
        'settings',
        'themes',
        'up',
    ];

    /**
     * Create a draft invitation with default theme sections/settings and optional event session.
     */
    public function createDraftForUser(User $owner, array $validated): Invitation
    {
        $slug = ! empty($validated['slug'])
            ? $validated['slug']
            : $this->generateUniqueSlug($validated['title']);

        $themeId = $validated['theme_id'] ?? null;
        $theme = $themeId ? Theme::find($themeId) : null;

        $invitation = DB::transaction(function () use ($owner, $validated, $slug, $theme, $themeId) {
            $invitation = Invitation::create([
                'user_id' => $owner->id,
                'theme_id' => $themeId,
                'title' => $validated['title'],
                'event_type' => $validated['event_type'] ?? 'wedding',
                'slug' => $slug,
                'status' => 'draft',
                'cover_image' => $validated['cover_image'] ?? null,
                'meta_description' => $validated['meta_description'] ?? null,
            ]);

            $defaultConfig = $theme?->default_config ?? [];
            $defaultSections = $defaultConfig['default_sections'] ?? [
                'HeroCover',
                'CoupleProfile',
                'EventSchedule',
                'FooterSection',
            ];
            $sectionPresets = $defaultConfig['section_presets'] ?? [];

            $sectionsData = [];
            foreach ($defaultSections as $index => $sectionType) {
                $props = $sectionPresets[$sectionType] ?? [];
                if ($sectionType === 'HeroCover' && empty($props['title'])) {
                    $props['title'] = $validated['title'];
                }

                $sectionsData[] = [
                    'id' => Str::slug($sectionType).'-'.Str::random(6),
                    'type' => $sectionType,
                    'order' => $index,
                    'props' => $props,
                ];
            }

            $invitation->content()->create([
                'schema_version' => '1.0.0',
                'sections_data' => $sectionsData,
                'music_url' => $defaultConfig['default_music_url'] ?? null,
                'settings' => [
                    'palette' => $defaultConfig['palette'] ?? null,
                    'typography' => $defaultConfig['typography'] ?? null,
                ],
            ]);

            if (! empty($validated['event_title']) && ! empty($validated['event_date'])) {
                $invitation->events()->create([
                    'event_title' => $validated['event_title'],
                    'event_date' => $validated['event_date'],
                    'start_time' => $validated['start_time'] ?? '09:00',
                    'end_time' => $validated['end_time'] ?? null,
                    'time_zone' => $validated['time_zone'] ?? 'WIB',
                    'location_name' => $validated['location_name'] ?? 'Lokasi Acara',
                    'address' => $validated['address'] ?? 'Alamat Acara',
                    'google_maps_url' => $validated['google_maps_url'] ?? null,
                ]);
            }

            return $invitation;
        });

        return $invitation->load(['theme', 'content', 'events']);
    }

    /**
     * Generate unique URL-safe slug from title while avoiding reserved routes.
     */
    public function generateUniqueSlug(string $title): string
    {
        $base = Str::slug($title);
        if (empty($base)) {
            $base = 'undangan';
        }

        $slug = $base;
        $counter = 1;

        while (Invitation::where('slug', $slug)->exists() || in_array($slug, self::RESERVED_SLUGS, true)) {
            $slug = $base.'-'.Str::lower(Str::random(5));
            $counter++;
            if ($counter > 10) {
                $slug = $base.'-'.time();
                break;
            }
        }

        return $slug;
    }
}
