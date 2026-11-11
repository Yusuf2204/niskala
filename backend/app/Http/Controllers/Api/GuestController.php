<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\AuthorizesInvitationAccess;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\StoreGuestRequest;
use App\Http\Requests\Api\UpdateGuestRequest;
use App\Models\Guest;
use App\Models\Invitation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class GuestController extends Controller
{
    use AuthorizesInvitationAccess;

    /**
     * List guests for an invitation with category filter, search, and summary totals.
     */
    public function index(Request $request, int $id): JsonResponse
    {
        $invitation = Invitation::findOrFail($id);
        if ($denied = $this->authorizeInvitation($request, $invitation, 'view')) {
            return $denied;
        }

        $query = $invitation->guests();

        if ($request->filled('category') && $request->query('category') !== 'all') {
            $query->where('category', $request->query('category'));
        }

        if ($request->filled('search')) {
            $search = trim((string) $request->query('search'));
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('phone_number', 'like', "%{$search}%");
            });
        }

        $perPage = min(max((int) $request->query('per_page', 50), 1), 200);
        $guests = $query->orderBy('name')->paginate($perPage);

        $summary = [
            'total_guests' => (int) $invitation->guests()->count(),
            'total_pax_allocated' => (int) $invitation->guests()->sum('pax_allocated'),
        ];

        return response()->json([
            'data' => [
                'invitation' => [
                    'id' => $invitation->id,
                    'title' => $invitation->title,
                    'slug' => $invitation->slug,
                    'status' => $invitation->status,
                ],
                'summary' => $summary,
                'items' => $guests,
            ],
            'message' => 'Guests retrieved successfully.',
            'errors' => null,
        ]);
    }

    /**
     * Store single or batch guests for an invitation.
     */
    public function store(StoreGuestRequest $request, int $id): JsonResponse
    {
        $invitation = Invitation::findOrFail($id);
        if ($denied = $this->authorizeInvitation($request, $invitation, 'update')) {
            return $denied;
        }

        $validated = $request->validated();
        $isBatch = isset($validated['guests']) && is_array($validated['guests']);
        $rows = $isBatch
            ? $validated['guests']
            : [[
                'name' => $validated['name'],
                'phone_number' => $validated['phone_number'] ?? null,
                'category' => $validated['category'] ?? 'General',
                'pax_allocated' => $validated['pax_allocated'] ?? 1,
            ]];

        $created = DB::transaction(function () use ($invitation, $rows) {
            $records = [];
            foreach ($rows as $row) {
                $records[] = $invitation->guests()->create([
                    'name' => $row['name'],
                    'slug_token' => $this->generateUniqueToken(),
                    'phone_number' => $row['phone_number'] ?? null,
                    'category' => $row['category'] ?? 'General',
                    'pax_allocated' => (int) ($row['pax_allocated'] ?? 1),
                ]);
            }

            return $records;
        });

        return response()->json([
            'data' => $isBatch ? $created : $created[0],
            'message' => $isBatch
                ? count($created).' guests added successfully.'
                : 'Guest added successfully.',
            'errors' => null,
        ], 201);
    }

    /**
     * Update a guest belonging to an invitation.
     */
    public function update(UpdateGuestRequest $request, int $id, int $guestId): JsonResponse
    {
        $invitation = Invitation::findOrFail($id);
        if ($denied = $this->authorizeInvitation($request, $invitation, 'update')) {
            return $denied;
        }

        $guest = $invitation->guests()->findOrFail($guestId);
        $guest->update($request->validated());

        return response()->json([
            'data' => $guest->fresh(),
            'message' => 'Guest updated successfully.',
            'errors' => null,
        ]);
    }

    /**
     * Delete a guest belonging to an invitation.
     */
    public function destroy(Request $request, int $id, int $guestId): JsonResponse
    {
        $invitation = Invitation::findOrFail($id);
        if ($denied = $this->authorizeInvitation($request, $invitation, 'update')) {
            return $denied;
        }

        $guest = $invitation->guests()->findOrFail($guestId);
        $guest->delete();

        return response()->json([
            'data' => null,
            'message' => 'Guest deleted successfully.',
            'errors' => null,
        ]);
    }

    /**
     * Generate a unique URL-safe guest token for personalized tracking links.
     */
    private function generateUniqueToken(): string
    {
        do {
            $token = Str::lower(Str::random(10));
        } while (Guest::where('slug_token', $token)->exists());

        return $token;
    }
}
