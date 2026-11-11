<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\AuthorizesInvitationAccess;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\ModerateRsvpRequest;
use App\Http\Requests\Api\StorePublicRsvpRequest;
use App\Models\Invitation;
use App\Models\Rsvp;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class RsvpController extends Controller
{
    use AuthorizesInvitationAccess;

    /**
     * Public endpoint: paginated visible wishes/greetings for a published invitation.
     */
    public function wishes(Request $request, string $slug): JsonResponse
    {
        $invitation = $this->findPublishedInvitationBySlug($slug);
        if (! $invitation) {
            return $this->publishedNotFoundResponse();
        }

        $perPage = min(max((int) $request->query('per_page', 10), 1), 50);

        $wishes = $invitation->rsvps()
            ->where('is_hidden', false)
            ->latest('id')
            ->select(['id', 'guest_name', 'attendance_status', 'pax_count', 'message', 'created_at'])
            ->paginate($perPage);

        return response()->json([
            'data' => $wishes,
            'message' => 'Wishes retrieved successfully.',
            'errors' => null,
        ]);
    }

    /**
     * Public endpoint: submit RSVP confirmation and wish on a published invitation.
     */
    public function storePublic(StorePublicRsvpRequest $request, string $slug): JsonResponse
    {
        $invitation = $this->findPublishedInvitationBySlug($slug);
        if (! $invitation) {
            return $this->publishedNotFoundResponse();
        }

        $validated = $request->validated();

        $guestId = null;
        if (! empty($validated['guest_token'])) {
            $guest = $invitation->guests()->where('slug_token', $validated['guest_token'])->first();
            $guestId = $guest?->id;
        }

        $status = $validated['attendance_status'];
        $paxCount = $status === 'not_attending'
            ? 0
            : max((int) ($validated['pax_count'] ?? 1), 1);

        $rsvp = $invitation->rsvps()->create([
            'guest_id' => $guestId,
            'guest_name' => $validated['guest_name'],
            'attendance_status' => $status,
            'pax_count' => $paxCount,
            'message' => $validated['message'] ?? null,
            'ip_address' => $request->ip(),
            'user_agent' => substr((string) $request->userAgent(), 0, 500),
            'is_hidden' => false,
        ]);

        return response()->json([
            'data' => [
                'id' => $rsvp->id,
                'guest_name' => $rsvp->guest_name,
                'attendance_status' => $rsvp->attendance_status,
                'pax_count' => $rsvp->pax_count,
                'message' => $rsvp->message,
                'created_at' => $rsvp->created_at,
            ],
            'message' => 'Terima kasih! Konfirmasi kehadiran dan doa restu Anda telah tercatat.',
            'errors' => null,
        ], 201);
    }

    /**
     * Protected endpoint: list RSVPs and attendance summary for host/admin.
     */
    public function index(Request $request, int $id): JsonResponse
    {
        $invitation = Invitation::findOrFail($id);
        if ($denied = $this->authorizeInvitation($request, $invitation, 'view')) {
            return $denied;
        }

        $query = $invitation->rsvps()->with('guest:id,name,category');

        if ($request->filled('attendance_status') && $request->query('attendance_status') !== 'all') {
            $query->where('attendance_status', $request->query('attendance_status'));
        }

        if ($request->filled('is_hidden') && $request->query('is_hidden') !== 'all') {
            $query->where('is_hidden', filter_var($request->query('is_hidden'), FILTER_VALIDATE_BOOLEAN));
        }

        if ($request->filled('search')) {
            $search = trim((string) $request->query('search'));
            $query->where(function ($q) use ($search) {
                $q->where('guest_name', 'like', "%{$search}%")
                    ->orWhere('message', 'like', "%{$search}%");
            });
        }

        $perPage = min(max((int) $request->query('per_page', 20), 1), 100);
        $rsvps = $query->latest('id')->paginate($perPage);

        $summary = $this->buildSummary($invitation);

        return response()->json([
            'data' => [
                'invitation' => [
                    'id' => $invitation->id,
                    'title' => $invitation->title,
                    'slug' => $invitation->slug,
                    'status' => $invitation->status,
                ],
                'summary' => $summary,
                'items' => $rsvps,
            ],
            'message' => 'RSVPs retrieved successfully.',
            'errors' => null,
        ]);
    }

    /**
     * Protected endpoint: toggle hidden/visible moderation flag on an RSVP greeting.
     */
    public function moderate(ModerateRsvpRequest $request, int $id, int $rsvpId): JsonResponse
    {
        $invitation = Invitation::findOrFail($id);
        if ($denied = $this->authorizeInvitation($request, $invitation, 'update')) {
            return $denied;
        }

        $rsvp = $invitation->rsvps()->findOrFail($rsvpId);
        $rsvp->update([
            'is_hidden' => (bool) $request->validated()['is_hidden'],
        ]);

        return response()->json([
            'data' => $rsvp->fresh(),
            'message' => $rsvp->is_hidden
                ? 'Ucapan berhasil disembunyikan dari publik.'
                : 'Ucapan ditampilkan kembali ke publik.',
            'errors' => null,
        ]);
    }

    /**
     * Protected endpoint: export RSVP summary & guest greetings to UTF-8 BOM CSV.
     */
    public function export(Request $request, int $id): JsonResponse|StreamedResponse
    {
        $invitation = Invitation::findOrFail($id);
        if ($denied = $this->authorizeInvitation($request, $invitation, 'view')) {
            return $denied;
        }

        $filename = 'rsvp-'.$invitation->slug.'-'.now()->format('Ymd-His').'.csv';

        return response()->streamDownload(function () use ($invitation) {
            $handle = fopen('php://output', 'w');
            // UTF-8 BOM so Excel on Windows/macOS detects Indonesian characters properly
            fwrite($handle, "\xEF\xBB\xBF");

            fputcsv($handle, [
                'No',
                'Nama Tamu',
                'Kategori Tamu',
                'Status Kehadiran',
                'Jumlah Tamu (Pax)',
                'Ucapan & Doa',
                'Status Tampil',
                'Waktu Konfirmasi',
            ]);

            $statusLabels = [
                'attending' => 'Hadir',
                'not_attending' => 'Tidak Hadir',
                'tentative' => 'Ragu-ragu',
            ];

            $rowNumber = 1;
            $invitation->rsvps()
                ->with('guest:id,category')
                ->reorder('id', 'asc')
                ->chunk(200, function ($chunk) use ($handle, &$rowNumber, $statusLabels) {
                    foreach ($chunk as $rsvp) {
                        fputcsv($handle, [
                            $rowNumber++,
                            $this->escapeCsvCell($rsvp->guest_name),
                            $this->escapeCsvCell($rsvp->guest?->category ?? 'Umum'),
                            $statusLabels[$rsvp->attendance_status] ?? $rsvp->attendance_status,
                            $rsvp->pax_count,
                            $this->escapeCsvCell($rsvp->message ?? ''),
                            $rsvp->is_hidden ? 'Disembunyikan' : 'Ditampilkan',
                            optional($rsvp->created_at)->format('Y-m-d H:i:s'),
                        ]);
                    }
                });

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    private function buildSummary(Invitation $invitation): array
    {
        $base = Rsvp::where('invitation_id', $invitation->id);

        return [
            'total_submissions' => (int) (clone $base)->count(),
            'attending_count' => (int) (clone $base)->where('attendance_status', 'attending')->count(),
            'not_attending_count' => (int) (clone $base)->where('attendance_status', 'not_attending')->count(),
            'tentative_count' => (int) (clone $base)->where('attendance_status', 'tentative')->count(),
            'total_attending_pax' => (int) (clone $base)->where('attendance_status', 'attending')->sum('pax_count'),
            'hidden_count' => (int) (clone $base)->where('is_hidden', true)->count(),
        ];
    }

    /**
     * Mitigate CSV formula injection when opening exports in Excel/Google Sheets.
     */
    private function escapeCsvCell(string $value): string
    {
        if ($value !== '' && preg_match('/^[=+\-@\t\r]/', $value)) {
            return "'".$value;
        }

        return $value;
    }
}
