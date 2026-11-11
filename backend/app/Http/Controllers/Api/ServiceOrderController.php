<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\ApproveServiceOrderRequest;
use App\Http\Requests\Api\RequestServiceOrderRevisionRequest;
use App\Http\Requests\Api\StoreServiceOrderRequest;
use App\Models\AuditLog;
use App\Models\Invitation;
use App\Models\ServiceOrder;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ServiceOrderController extends Controller
{
    public function __construct(private readonly AuditLogger $auditLogger) {}

    /**
     * List service orders owned by the authenticated customer (or own orders if requested by admin).
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $baseQuery = ServiceOrder::query()->where('user_id', $user->id);

        $counts = [
            'all' => (clone $baseQuery)->count(),
            'pending_review' => (clone $baseQuery)->where('status', ServiceOrder::STATUS_PENDING_REVIEW)->count(),
            'in_progress' => (clone $baseQuery)->where('status', ServiceOrder::STATUS_IN_PROGRESS)->count(),
            'client_review' => (clone $baseQuery)->where('status', ServiceOrder::STATUS_CLIENT_REVIEW)->count(),
            'completed' => (clone $baseQuery)->where('status', ServiceOrder::STATUS_COMPLETED)->count(),
            'cancelled' => (clone $baseQuery)->where('status', ServiceOrder::STATUS_CANCELLED)->count(),
        ];

        $query = ServiceOrder::with([
            'invitation:id,user_id,theme_id,title,slug,status',
            'invitation.theme:id,name,slug',
            'assignedAdmin:id,name,email',
        ])->where('user_id', $user->id);

        if ($request->filled('status') && $request->query('status') !== 'all') {
            $query->where('status', $request->query('status'));
        }

        if ($request->filled('service_type') && $request->query('service_type') !== 'all') {
            $query->where('service_type', $request->query('service_type'));
        }

        if ($request->filled('search')) {
            $search = trim((string) $request->query('search'));
            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                    ->orWhere('client_notes', 'like', "%{$search}%")
                    ->orWhereHas('invitation', fn ($invQ) => $invQ->where('title', 'like', "%{$search}%"));
            });
        }

        $perPage = min(max((int) $request->query('per_page', 15), 1), 100);
        $orders = $query->latest('id')->paginate($perPage);

        if (! $user->isAdmin()) {
            $orders->getCollection()->each->makeHidden('admin_notes');
        }

        return response()->json([
            'data' => [
                'summary' => $counts,
                'items' => $orders,
            ],
            'message' => 'Service orders retrieved successfully.',
            'errors' => null,
        ]);
    }

    /**
     * Create a new assistance request ticket for the authenticated customer.
     */
    public function store(StoreServiceOrderRequest $request): JsonResponse
    {
        $user = $request->user();
        $validated = $request->validated();

        if (! empty($validated['invitation_id'])) {
            $invitation = Invitation::findOrFail((int) $validated['invitation_id']);
            if ($user->cannot('view', $invitation)) {
                return response()->json([
                    'data' => null,
                    'message' => 'This action is unauthorized.',
                    'errors' => ['invitation_id' => ['You do not have permission to link this invitation.']],
                ], 403);
            }
        }

        $order = DB::transaction(function () use ($user, $validated, $request) {
            $order = ServiceOrder::create([
                'user_id' => $user->id,
                'invitation_id' => $validated['invitation_id'] ?? null,
                'order_number' => $this->generateOrderNumber(),
                'service_type' => $validated['service_type'],
                'status' => ServiceOrder::STATUS_PENDING_REVIEW,
                'client_notes' => $validated['client_notes'],
            ]);

            $this->auditLogger->log(
                $user,
                'service_order.created',
                $order,
                null,
                [
                    'order_number' => $order->order_number,
                    'service_type' => $order->service_type,
                    'invitation_id' => $order->invitation_id,
                ],
                $request,
            );

            return $order;
        });

        $order->load([
            'user:id,name,email',
            'invitation:id,user_id,theme_id,title,slug,status',
            'invitation.theme:id,name,slug',
            'assignedAdmin:id,name,email',
        ]);

        if (! $user->isAdmin()) {
            $order->makeHidden('admin_notes');
        }

        return response()->json([
            'data' => $order,
            'message' => 'Permintaan layanan bantuan berhasil dikirim.',
            'errors' => null,
        ], 201);
    }

    /**
     * View service order detail with access check and non-sensitive activity timeline.
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $order = ServiceOrder::with([
            'user:id,name,email',
            'invitation:id,user_id,theme_id,title,slug,status,published_at',
            'invitation.theme:id,name,slug',
            'invitation.events',
            'assignedAdmin:id,name,email',
        ])->findOrFail($id);

        if ($user->cannot('view', $order)) {
            return $this->unauthorizedOrderResponse();
        }

        $timeline = AuditLog::with('user:id,name,role_id', 'user.role:id,role_name')
            ->where(function ($q) use ($order) {
                $q->where('target_type', ServiceOrder::class)
                    ->where('target_id', $order->id);

                if ($order->invitation_id) {
                    $q->orWhere(function ($invQ) use ($order) {
                        $invQ->where('target_type', Invitation::class)
                            ->where('target_id', $order->invitation_id);
                    });
                }
            })
            ->latest('id')
            ->limit(25)
            ->get()
            ->map(function (AuditLog $log) use ($user) {
                $details = $log->details ?? [];
                if (! $user->isAdmin()) {
                    unset($details['admin_notes']);
                }

                return [
                    'id' => $log->id,
                    'action' => $log->action,
                    'actor' => $log->user ? [
                        'id' => $log->user->id,
                        'name' => $log->user->name,
                        'role' => $log->user->role?->role_name,
                    ] : null,
                    'details' => $details,
                    'created_at' => $log->created_at,
                ];
            })
            ->values();

        if (! $user->isAdmin()) {
            $order->makeHidden('admin_notes');
        }

        $payload = $order->toArray();
        $payload['timeline'] = $timeline;

        return response()->json([
            'data' => $payload,
            'message' => 'Service order retrieved successfully.',
            'errors' => null,
        ]);
    }

    /**
     * Customer approves the drafted invitation delivered for review.
     */
    public function approve(ApproveServiceOrderRequest $request, int $id): JsonResponse
    {
        $user = $request->user();
        $order = ServiceOrder::with(['invitation.content'])->findOrFail($id);

        if ($user->cannot('approve', $order)) {
            return $this->unauthorizedOrderResponse();
        }

        if ($order->status !== ServiceOrder::STATUS_CLIENT_REVIEW) {
            return response()->json([
                'data' => null,
                'message' => 'Tiket hanya dapat disetujui ketika berstatus Menunggu Review Pelanggan (client_review).',
                'errors' => ['status' => ['Service order must be in client_review status before approval.']],
            ], 422);
        }

        $validated = $request->validated();
        $shouldPublish = (bool) ($validated['publish_invitation'] ?? false);

        if ($shouldPublish) {
            if (! $order->invitation) {
                return response()->json([
                    'data' => null,
                    'message' => 'Undangan belum tertaut ke tiket ini sehingga tidak dapat langsung dipublikasikan.',
                    'errors' => ['invitation_id' => ['No invitation is linked to this service order.']],
                ], 422);
            }

            $sections = $order->invitation->content?->sections_data ?? [];
            if (empty($sections)) {
                return response()->json([
                    'data' => null,
                    'message' => 'Undangan belum memiliki konten section sehingga belum dapat dipublikasikan.',
                    'errors' => ['sections_data' => ['At least one content section is required before publishing.']],
                ], 422);
            }
        }

        DB::transaction(function () use ($order, $validated, $shouldPublish, $user, $request) {
            $notes = $order->client_notes;
            if (! empty($validated['client_notes'])) {
                $notes = trim((string) $notes) !== ''
                    ? $notes."\n\n[Persetujuan Pelanggan]: ".$validated['client_notes']
                    : $validated['client_notes'];
            }

            $order->update([
                'status' => ServiceOrder::STATUS_COMPLETED,
                'completed_at' => now(),
                'client_notes' => $notes,
            ]);

            $publishedNow = false;
            if ($shouldPublish && $order->invitation && $order->invitation->status !== 'published') {
                $order->invitation->update([
                    'status' => 'published',
                    'published_at' => now(),
                ]);
                $publishedNow = true;

                $this->auditLogger->log(
                    $user,
                    'invitation.published',
                    $order->invitation,
                    null,
                    [
                        'via_service_order' => $order->order_number,
                        'slug' => $order->invitation->slug,
                    ],
                    $request,
                );
            }

            $this->auditLogger->log(
                $user,
                'service_order.approved',
                $order,
                null,
                [
                    'order_number' => $order->order_number,
                    'old_status' => ServiceOrder::STATUS_CLIENT_REVIEW,
                    'new_status' => ServiceOrder::STATUS_COMPLETED,
                    'published_invitation' => $publishedNow,
                ],
                $request,
            );
        });

        $order->refresh()->load([
            'user:id,name,email',
            'invitation:id,user_id,theme_id,title,slug,status,published_at',
            'invitation.theme:id,name,slug',
            'assignedAdmin:id,name,email',
        ]);

        if (! $user->isAdmin()) {
            $order->makeHidden('admin_notes');
        }

        return response()->json([
            'data' => $order,
            'message' => 'Hasil pengerjaan telah disetujui dan tiket layanan dinyatakan selesai.',
            'errors' => null,
        ]);
    }

    /**
     * Customer requests a revision when reviewing drafted invitation (ClientReview -> InProgress).
     */
    public function requestRevision(RequestServiceOrderRevisionRequest $request, int $id): JsonResponse
    {
        $user = $request->user();
        $order = ServiceOrder::findOrFail($id);

        if ($user->cannot('requestRevision', $order)) {
            return $this->unauthorizedOrderResponse();
        }

        if ($order->status !== ServiceOrder::STATUS_CLIENT_REVIEW) {
            return response()->json([
                'data' => null,
                'message' => 'Permintaan revisi hanya dapat dilakukan pada status Menunggu Review Pelanggan.',
                'errors' => ['status' => ['Service order must be in client_review status to request revision.']],
            ], 422);
        }

        $revisionNotes = $request->validated()['revision_notes'];

        DB::transaction(function () use ($order, $revisionNotes, $user, $request) {
            $stamp = now()->format('Y-m-d H:i');
            $updatedNotes = trim((string) $order->client_notes) !== ''
                ? $order->client_notes."\n\n[Revisi Pelanggan {$stamp}]: ".$revisionNotes
                : "[Revisi Pelanggan {$stamp}]: ".$revisionNotes;

            $order->update([
                'status' => ServiceOrder::STATUS_IN_PROGRESS,
                'client_notes' => $updatedNotes,
            ]);

            $this->auditLogger->log(
                $user,
                'service_order.revision_requested',
                $order,
                null,
                [
                    'order_number' => $order->order_number,
                    'old_status' => ServiceOrder::STATUS_CLIENT_REVIEW,
                    'new_status' => ServiceOrder::STATUS_IN_PROGRESS,
                    'revision_notes' => $revisionNotes,
                ],
                $request,
            );
        });

        $order->refresh()->load([
            'user:id,name,email',
            'invitation:id,user_id,theme_id,title,slug,status',
            'assignedAdmin:id,name,email',
        ]);

        if (! $user->isAdmin()) {
            $order->makeHidden('admin_notes');
        }

        return response()->json([
            'data' => $order,
            'message' => 'Permintaan revisi berhasil dikirim kembali ke tim admin.',
            'errors' => null,
        ]);
    }

    /**
     * Customer cancels an open ticket (PendingReview or InProgress -> Cancelled).
     */
    public function cancel(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $order = ServiceOrder::findOrFail($id);

        if ($user->cannot('cancel', $order)) {
            return $this->unauthorizedOrderResponse();
        }

        if (! in_array($order->status, [ServiceOrder::STATUS_PENDING_REVIEW, ServiceOrder::STATUS_IN_PROGRESS], true)) {
            return response()->json([
                'data' => null,
                'message' => 'Tiket tidak dapat dibatalkan pada status saat ini.',
                'errors' => ['status' => ['Only pending_review or in_progress orders can be cancelled.']],
            ], 422);
        }

        $oldStatus = $order->status;

        DB::transaction(function () use ($order, $oldStatus, $user, $request) {
            $order->update(['status' => ServiceOrder::STATUS_CANCELLED]);

            $this->auditLogger->log(
                $user,
                'service_order.cancelled',
                $order,
                null,
                [
                    'order_number' => $order->order_number,
                    'old_status' => $oldStatus,
                    'new_status' => ServiceOrder::STATUS_CANCELLED,
                ],
                $request,
            );
        });

        $order->refresh()->load(['invitation:id,title,slug,status', 'assignedAdmin:id,name,email']);

        if (! $user->isAdmin()) {
            $order->makeHidden('admin_notes');
        }

        return response()->json([
            'data' => $order,
            'message' => 'Tiket layanan berhasil dibatalkan.',
            'errors' => null,
        ]);
    }

    private function generateOrderNumber(): string
    {
        $ym = now()->format('Ym');
        $prefix = "SRV-{$ym}-";

        $lastNumber = ServiceOrder::where('order_number', 'like', "{$prefix}%")
            ->orderByDesc('order_number')
            ->value('order_number');

        $seq = 1;
        if (is_string($lastNumber) && preg_match('/-(\d+)$/', $lastNumber, $matches)) {
            $seq = ((int) $matches[1]) + 1;
        }

        do {
            $candidate = $prefix.str_pad((string) $seq, 4, '0', STR_PAD_LEFT);
            $seq++;
        } while (ServiceOrder::where('order_number', $candidate)->exists());

        return $candidate;
    }

    private function unauthorizedOrderResponse(): JsonResponse
    {
        return response()->json([
            'data' => null,
            'message' => 'This action is unauthorized.',
            'errors' => ['authorization' => ['You do not have permission to access this service order.']],
        ], 403);
    }
}
