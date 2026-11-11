<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\StoreInvitationRequest;
use App\Http\Requests\Api\UpdateInvitationContentRequest;
use App\Http\Requests\Api\UpdateInvitationRequest;
use App\Models\Invitation;
use App\Services\AuditLogger;
use App\Services\InvitationCreationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class InvitationController extends Controller
{
    public function __construct(
        private readonly InvitationCreationService $creator,
        private readonly AuditLogger $auditLogger,
    ) {}

    /**
     * Display a paginated listing of invitations.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $relations = ['theme:id,name,slug,thumbnail', 'events'];
        if ($user->isAdmin()) {
            $relations[] = 'user:id,name,email';
        }

        $query = Invitation::with($relations);

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
        $invitation = $this->creator->createDraftForUser($request->user(), $request->validated());

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
    public function showPublic(Request $request, string $slug): JsonResponse
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

        $guestContext = null;
        $guestToken = trim((string) $request->query('c', ''));
        if ($guestToken !== '') {
            $guest = $invitation->guests()->where('slug_token', $guestToken)->first();
            if ($guest) {
                $guestContext = [
                    'name' => $guest->name,
                    'category' => $guest->category,
                    'pax_allocated' => $guest->pax_allocated,
                    'token' => $guest->slug_token,
                ];
            }
        }

        $payload = $invitation->toArray();
        $payload['guest_context'] = $guestContext;

        return response()->json([
            'data' => $payload,
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

        $validated = $request->validated();
        $invitation->update($validated);
        $invitation->load(['theme', 'content', 'events']);

        if ($request->user()->isAdmin()) {
            $this->auditLogger->log(
                $request->user(),
                'invitation.admin_updated',
                $invitation,
                null,
                [
                    'owner_id' => $invitation->user_id,
                    'slug' => $invitation->slug,
                    'changed_fields' => array_keys($validated),
                ],
                $request,
            );
        }

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

        if ($request->user()->isAdmin()) {
            $this->auditLogger->log(
                $request->user(),
                'invitation.admin_content_updated',
                $invitation,
                null,
                [
                    'owner_id' => $invitation->user_id,
                    'slug' => $invitation->slug,
                    'section_count' => count($validated['sections_data']),
                ],
                $request,
            );
        }

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

        $type = $request->input('type', 'general');
        $isAudio = $type === 'music';

        $rules = [
            'file' => $isAudio
                ? ['required', 'file', 'mimes:mp3,wav,ogg,audio/mpeg', 'max:10240']
                : ['required', 'file', 'image', 'mimes:jpeg,png,jpg,webp,gif', 'max:5120'],
            'type' => ['nullable', 'string', 'in:cover,photo,gallery,music,general'],
        ];

        $validated = $request->validate($rules);

        $folder = 'invitations/' . $invitation->id . '/' . ($validated['type'] ?? 'general');
        $disk = config('filesystems.default') === 's3' ? 's3' : 'public';
        $path = $request->file('file')->store($folder, $disk);

        if ($request->user()->isAdmin()) {
            $this->auditLogger->log(
                $request->user(),
                'invitation.admin_media_uploaded',
                $invitation,
                null,
                [
                    'owner_id' => $invitation->user_id,
                    'slug' => $invitation->slug,
                    'media_type' => $validated['type'] ?? 'general',
                ],
                $request,
            );
        }

        return response()->json([
            'data' => [
                'file_path' => Storage::disk($disk)->url($path),
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

        $this->auditLogger->log(
            $request->user(),
            'invitation.published',
            $invitation,
            null,
            [
                'owner_id' => $invitation->user_id,
                'slug' => $invitation->slug,
                'actor_is_admin' => $request->user()->isAdmin(),
            ],
            $request,
        );

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

        $this->auditLogger->log(
            $request->user(),
            'invitation.archived',
            $invitation,
            null,
            [
                'owner_id' => $invitation->user_id,
                'slug' => $invitation->slug,
                'actor_is_admin' => $request->user()->isAdmin(),
            ],
            $request,
        );

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

        $snapshot = [
            'owner_id' => $invitation->user_id,
            'slug' => $invitation->slug,
            'title' => $invitation->title,
            'actor_is_admin' => $request->user()->isAdmin(),
        ];

        $invitation->delete();

        $this->auditLogger->log(
            $request->user(),
            'invitation.deleted',
            Invitation::class,
            $id,
            $snapshot,
            $request,
        );

        return response()->json([
            'data' => null,
            'message' => 'Invitation deleted successfully.',
            'errors' => null,
        ]);
    }
}

