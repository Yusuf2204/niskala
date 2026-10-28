<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\StoreInvitationRequest;
use App\Http\Requests\Api\UpdateInvitationContentRequest;
use App\Http\Requests\Api\UpdateInvitationRequest;
use App\Models\Invitation;
use App\Models\Theme;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class InvitationController extends Controller
{
    /**
     * Display a paginated listing of invitations.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = Invitation::with(['theme:id,name,slug,thumbnail', 'events']);

        if (! $user->isAdmin()) {
            $query->where('user_id', $user->id);
        } elseif ($request->filled('user_id')) {
            $query->where('user_id', (int) $request->query('user_id'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->query('status'));
        }

        if ($request->filled('search')) {
            $search = $request->query('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%");
            });
        }

        $perPage = min(max((int) $request->query('per_page', 15), 1), 100);
        $invitations = $query->latest('id')->paginate($perPage);

        return response()->json([
            'data' => $invitations,
            'message' => 'Invitations retrieved successfully.',
            'errors' => null,
        ]);
    }

    /**
     * Store a newly created invitation in storage.
     */
    public function store(StoreInvitationRequest $request): JsonResponse
    {
        $user = $request->user();
        $validated = $request->validated();

        $slug = ! empty($validated['slug'])
            ? $validated['slug']
            : $this->generateUniqueSlug($validated['title']);

        $theme = Theme::findOrFail($validated['theme_id']);

        $invitation = DB::transaction(function () use ($user, $validated, $slug, $theme) {
            $invitation = Invitation::create([
                'user_id' => $user->id,
                'theme_id' => $theme->id,
                'title' => $validated['title'],
                'event_type' => $validated['event_type'] ?? 'wedding',
                'slug' => $slug,
                'status' => 'draft',
                'cover_image' => $validated['cover_image'] ?? null,
                'meta_description' => $validated['meta_description'] ?? null,
            ]);

            // Initialize default content based on theme configuration
            $defaultConfig = $theme->default_config ?? [];
            $defaultSections = $defaultConfig['default_sections'] ?? [
                'HeroCover',
                'CoupleProfile',
                'EventSchedule',
                'FooterSection',
            ];

            $sectionsData = [];
            foreach ($defaultSections as $index => $sectionType) {
                $sectionsData[] = [
                    'id' => Str::slug($sectionType).'-'.Str::random(6),
                    'type' => $sectionType,
                    'order' => $index,
                    'props' => [
                        'title' => $sectionType === 'HeroCover' ? $validated['title'] : '',
                    ],
                ];
            }

            $invitation->content()->create([
                'schema_version' => '1.0.0',
                'sections_data' => $sectionsData,
                'music_url' => null,
                'settings' => [
                    'palette' => $defaultConfig['palette'] ?? null,
                    'typography' => $defaultConfig['typography'] ?? null,
                ],
            ]);

            // Create initial event if event fields are provided
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

        $invitation->load(['theme', 'content', 'events']);

        return response()->json([
            'data' => $invitation,
            'message' => 'Invitation created successfully as draft.',
            'errors' => null,
        ], 201);
    }

    /**
     * Display the specified invitation.
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $invitation = Invitation::with(['theme', 'content', 'events'])->findOrFail($id);

        if ($request->user()->cannot('view', $invitation)) {
            return response()->json([
                'data' => null,
                'message' => 'This action is unauthorized.',
                'errors' => ['authorization' => ['You do not have permission to view this invitation.']],
            ], 403);
        }

        return response()->json([
            'data' => $invitation,
            'message' => 'Invitation details retrieved successfully.',
            'errors' => null,
        ]);
    }

    /**
     * Display the published invitation for public view by slug.
     */
    public function showPublic(string $slug): JsonResponse
    {
        $invitation = Invitation::with(['theme', 'content', 'events'])
            ->where('slug', $slug)
            ->first();

        if (! $invitation || $invitation->status !== 'published') {
            return response()->json([
                'data' => null,
                'message' => 'Undangan tidak ditemukan atau belum dipublikasikan.',
                'errors' => ['slug' => ['This invitation is private, draft, or does not exist.']],
            ], 404);
        }

        return response()->json([
            'data' => $invitation,
            'message' => 'Public invitation retrieved successfully.',
            'errors' => null,
        ]);
    }

    /**
     * Update the specified invitation basic info.
     */
    public function update(UpdateInvitationRequest $request, int $id): JsonResponse
    {
        $invitation = Invitation::findOrFail($id);

        if ($request->user()->cannot('update', $invitation)) {
            return response()->json([
                'data' => null,
                'message' => 'This action is unauthorized.',
                'errors' => ['authorization' => ['You do not have permission to update this invitation.']],
            ], 403);
        }

        $invitation->update($request->validated());
        $invitation->load(['theme', 'content', 'events']);

        return response()->json([
            'data' => $invitation,
            'message' => 'Invitation updated successfully.',
            'errors' => null,
        ]);
    }

    /**
     * Update invitation sections content.
     */
    public function updateContent(UpdateInvitationContentRequest $request, int $id): JsonResponse
    {
        $invitation = Invitation::findOrFail($id);

        if ($request->user()->cannot('update', $invitation)) {
            return response()->json([
                'data' => null,
                'message' => 'This action is unauthorized.',
                'errors' => ['authorization' => ['You do not have permission to update this invitation content.']],
            ], 403);
        }

        $validated = $request->validated();

        $content = $invitation->content()->updateOrCreate(
            ['invitation_id' => $invitation->id],
            [
                'schema_version' => $validated['schema_version'] ?? '1.0.0',
                'sections_data' => $validated['sections_data'],
                'music_url' => array_key_exists('music_url', $validated) ? $validated['music_url'] : $invitation->content?->music_url,
                'settings' => array_key_exists('settings', $validated) ? $validated['settings'] : $invitation->content?->settings,
            ]
        );

        return response()->json([
            'data' => $content,
            'message' => 'Invitation content updated successfully.',
            'errors' => null,
        ]);
    }

    /**
     * Upload media file for an invitation.
     */
    public function uploadMedia(Request $request, int $id): JsonResponse
    {
        $invitation = Invitation::findOrFail($id);

        if ($request->user()->cannot('update', $invitation)) {
            return response()->json([
                'data' => null,
                'message' => 'This action is unauthorized.',
                'errors' => ['authorization' => ['You do not have permission to upload media for this invitation.']],
            ], 403);
        }

        $validated = $request->validate([
            'file' => ['required', 'file', 'image', 'mimes:jpeg,png,jpg,webp,gif', 'max:5120'],
            'type' => ['nullable', 'string', 'in:cover,photo,gallery,general'],
        ]);

        $folder = 'invitations/' . $invitation->id . '/' . ($validated['type'] ?? 'general');
        $path = $request->file('file')->store($folder, 'public');

        return response()->json([
            'data' => [
                'file_path' => '/storage/' . $path,
                'filename' => $request->file('file')->getClientOriginalName(),
                'size' => $request->file('file')->getSize(),
                'mime_type' => $request->file('file')->getMimeType(),
            ],
            'message' => 'Media uploaded successfully.',
            'errors' => null,
        ], 201);
    }

    /**
     * Publish the specified invitation.
     */
    public function publish(Request $request, int $id): JsonResponse
    {
        $invitation = Invitation::with('content')->findOrFail($id);

        if ($request->user()->cannot('publish', $invitation)) {
            return response()->json([
                'data' => null,
                'message' => 'This action is unauthorized.',
                'errors' => ['authorization' => ['You do not have permission to publish this invitation.']],
            ], 403);
        }

        $sections = $invitation->content?->sections_data ?? [];
        if (empty($sections)) {
            return response()->json([
                'data' => null,
                'message' => 'Cannot publish an invitation without content sections.',
                'errors' => [
                    'sections_data' => ['At least one content section is required before publishing.'],
                ],
            ], 422);
        }

        $invitation->update([
            'status' => 'published',
            'published_at' => now(),
        ]);

        $invitation->load(['theme', 'content', 'events']);

        return response()->json([
            'data' => $invitation,
            'message' => 'Invitation published successfully.',
            'errors' => null,
        ]);
    }

    /**
     * Archive the specified invitation.
     */
    public function archive(Request $request, int $id): JsonResponse
    {
        $invitation = Invitation::findOrFail($id);

        if ($request->user()->cannot('archive', $invitation)) {
            return response()->json([
                'data' => null,
                'message' => 'This action is unauthorized.',
                'errors' => ['authorization' => ['You do not have permission to archive this invitation.']],
            ], 403);
        }

        $invitation->update([
            'status' => 'archived',
        ]);

        $invitation->load(['theme', 'content', 'events']);

        return response()->json([
            'data' => $invitation,
            'message' => 'Invitation archived successfully.',
            'errors' => null,
        ]);
    }

    /**
     * Remove the specified invitation from storage.
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $invitation = Invitation::findOrFail($id);

        if ($request->user()->cannot('delete', $invitation)) {
            return response()->json([
                'data' => null,
                'message' => 'This action is unauthorized.',
                'errors' => ['authorization' => ['You do not have permission to delete this invitation.']],
            ], 403);
        }

        $invitation->delete();

        return response()->json([
            'data' => null,
            'message' => 'Invitation deleted successfully.',
            'errors' => null,
        ]);
    }

    /**
     * Generate unique slug from title.
     */
    protected function generateUniqueSlug(string $title): string
    {
        $base = Str::slug($title);
        if (empty($base)) {
            $base = 'undangan';
        }

        $reserved = ['admin', 'api', 'dashboard', 'public', 'storage', 'docs', 'settings', 'themes', 'up'];
        $slug = $base;
        $counter = 1;

        while (Invitation::where('slug', $slug)->exists() || in_array($slug, $reserved, true)) {
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

