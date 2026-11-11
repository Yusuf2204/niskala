<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\AssignServiceOrderRequest;
use App\Http\Requests\Api\CreateServiceOrderInvitationRequest;
use App\Http\Requests\Api\UpdateServiceOrderStatusRequest;
use App\Models\AuditLog;
use App\Models\Invitation;
use App\Models\ServiceOrder;
use App\Models\User;
use App\Services\AuditLogger;
use App\Services\InvitationCreationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminOperationsController extends Controller
{
    public function __construct(
        private readonly AuditLogger $auditLogger,
        private readonly InvitationCreationService $invitationCreator,
    ) {}

    /**
     * List all customer service orders for admin queue management.
     */
    public function serviceOrders(Request $request): JsonResponse
    {
        $counts = [
            'all' => ServiceOrder::count(),
            'pending_review' => ServiceOrder::where('status', ServiceOrder::STATUS_PENDING_REVIEW)->count(),
            'in_progress' => ServiceOrder::where('status', ServiceOrder::STATUS_IN_PROGRESS)->count(),
            'client_review' => ServiceOrder::where('status', ServiceOrder::STATUS_CLIENT_REVIEW)->count(),
            'completed' => ServiceOrder::where('status', ServiceOrder::STATUS_COMPLETED)->count(),
            'cancelled' => ServiceOrder::where('status', ServiceOrder::STATUS_CANCELLED)->count(),
            'unassigned' => ServiceOrder::whereNull('assigned_admin_id')
                ->whereIn('status', [ServiceOrder::STATUS_PENDING_REVIEW, ServiceOrder::STATUS_IN_PROGRESS])
                ->count(),
        ];

        $query = ServiceOrder::with([
            'user:id,name,email',
            'invitation:id,user_id,theme_id,title,slug,status',
            'invitation.theme:id,name,slug',
            'assignedAdmin:id,name,email',
        ]);

        if ($request->filled('status') && $request->query('status') !== 'all') {
            $query->where('status', $request->query('status'));
        }

        if ($request->filled('service_type') && $request->query('service_type') !== 'all') {
            $query->where('service_type', $request->query('service_type'));
        }

        if ($request->filled('assigned_admin_id')) {
            $assigned = $request->query('assigned_admin_id');
            if ($assigned === 'unassigned') {
                $query->whereNull('assigned_admin_id');
            } elseif ($assigned !== 'all') {
                $query->where('assigned_admin_id', (int) $assigned);
            }
        }

        if ($request->filled('search')) {
            $search = trim((string) $request->query('search'));
            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                    ->orWhere('client_notes', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($uq) use ($search) {
                        $uq->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    })
                    ->orWhereHas('invitation', function ($iq) use ($search) {
                        $iq->where('title', 'like', "%{$search}%")
                            ->orWhere('slug', 'like', "%{$search}%");
                    });
            });
        }

        $perPage = min(max((int) $request->query('per_page', 15), 1), 100);
        $orders = $query->latest('id')->paginate($perPage);

        $admins = User::query()
            ->whereHas('role', fn ($q) => $q->where('role_name', 'admin'))
            ->select(['id', 'name', 'email'])
            ->orderBy('name')
            ->get();

        return response()->json([
            'data' => [
                'summary' => $counts,
                'admins' => $admins,
                'items' => $orders,
            ],
            'message' => 'Admin service orders retrieved successfully.',
            'errors' => null,
        ]);
    }

    /**
     * Admin assigns or unassigns an admin handler for a service order.
     */
    public function assignServiceOrder(AssignServiceOrderRequest $request, int $id): JsonResponse
    {
        $order = ServiceOrder::findOrFail($id);
        $validated = $request->validated();
        $assigneeId = $validated['assigned_admin_id'] ?? null;

        if ($assigneeId !== null) {
            $assignee = User::with('role:id,role_name')->findOrFail((int) $assigneeId);
            if (! $assignee->isAdmin()) {
                return response()->json([
                    'data' => null,
                    'message' => 'Pengguna yang ditugaskan harus memiliki role admin.',
                    'errors' => ['assigned_admin_id' => ['Selected user must have admin role.']],
                ], 422);
            }
        }

        $oldAssignedId = $order->assigned_admin_id;
        $oldStatus = $order->status;
        $newStatus = $oldStatus;

        if ($assigneeId !== null && ($validated['start_progress'] ?? false) && $order->status === ServiceOrder::STATUS_PENDING_REVIEW) {
            $newStatus = ServiceOrder::STATUS_IN_PROGRESS;
        }

        DB::transaction(function () use ($order, $assigneeId, $oldAssignedId, $oldStatus, $newStatus, $request) {
            $order->update([
                'assigned_admin_id' => $assigneeId,
                'status' => $newStatus,
            ]);

            $this->auditLogger->log(
                $request->user(),
                'service_order.assigned',
                $order,
                null,
                [
                    'order_number' => $order->order_number,
                    'old_assigned_admin_id' => $oldAssignedId,
                    'new_assigned_admin_id' => $assigneeId,
                    'old_status' => $oldStatus,
                    'new_status' => $newStatus,
                ],
                $request,
            );
        });

        $order->refresh()->load([
            'user:id,name,email',
            'invitation:id,user_id,theme_id,title,slug,status',
            'assignedAdmin:id,name,email',
        ]);

        return response()->json([
            'data' => $order,
            'message' => 'Penanggung jawab tiket berhasil diperbarui.',
            'errors' => null,
        ]);
    }

    /**
     * Admin updates service order status, internal notes, or linked customer invitation.
     */
    public function updateServiceOrderStatus(UpdateServiceOrderStatusRequest $request, int $id): JsonResponse
    {
        $order = ServiceOrder::findOrFail($id);
        $validated = $request->validated();
        $targetStatus = $validated['status'];

        if (! $order->canTransitionTo($targetStatus)) {
            return response()->json([
                'data' => null,
                'message' => "Transisi status dari '{$order->status}' ke '{$targetStatus}' tidak diizinkan.",
                'errors' => ['status' => ["Transition from {$order->status} to {$targetStatus} is not allowed."]],
            ], 422);
        }

        if (array_key_exists('invitation_id', $validated) && $validated['invitation_id'] !== null) {
            $invitation = Invitation::findOrFail((int) $validated['invitation_id']);
            if ((int) $invitation->user_id !== (int) $order->user_id) {
                return response()->json([
                    'data' => null,
                    'message' => 'Undangan yang ditautkan harus dimiliki oleh pelanggan pembuat tiket ini.',
                    'errors' => ['invitation_id' => ['Linked invitation must belong to the service order owner.']],
                ], 422);
            }
        }

        if ($targetStatus === ServiceOrder::STATUS_CLIENT_REVIEW) {
            $resolvedInvitationId = array_key_exists('invitation_id', $validated)
                ? $validated['invitation_id']
                : $order->invitation_id;

            if (! $resolvedInvitationId) {
                return response()->json([
                    'data' => null,
                    'message' => 'Tautkan atau buatkan draf undangan terlebih dahulu sebelum mengirim pratinjau ke pelanggan.',
                    'errors' => ['invitation_id' => ['An invitation must be linked before moving to client_review.']],
                ], 422);
            }
        }

        $oldStatus = $order->status;
        $oldInvitationId = $order->invitation_id;

        DB::transaction(function () use ($order, $validated, $targetStatus, $oldStatus, $oldInvitationId, $request) {
            $updates = [
                'status' => $targetStatus,
            ];

            if (array_key_exists('admin_notes', $validated)) {
                $updates['admin_notes'] = $validated['admin_notes'];
            }

            if (array_key_exists('invitation_id', $validated)) {
                $updates['invitation_id'] = $validated['invitation_id'];
            }

            if ($targetStatus === ServiceOrder::STATUS_IN_PROGRESS && $order->assigned_admin_id === null) {
                $updates['assigned_admin_id'] = $request->user()->id;
            }

            if ($targetStatus === ServiceOrder::STATUS_COMPLETED && $order->completed_at === null) {
                $updates['completed_at'] = now();
            }

            $order->update($updates);

            $this->auditLogger->log(
                $request->user(),
                'service_order.status_updated',
                $order,
                null,
                [
                    'order_number' => $order->order_number,
                    'old_status' => $oldStatus,
                    'new_status' => $targetStatus,
                    'old_invitation_id' => $oldInvitationId,
                    'new_invitation_id' => $order->invitation_id,
                    'has_admin_notes' => ! empty($order->admin_notes),
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

        return response()->json([
            'data' => $order,
            'message' => 'Status tiket layanan berhasil diperbarui.',
            'errors' => null,
        ]);
    }

    /**
     * Admin creates a draft invitation owned by the ticket's customer and links it to the order.
     */
    public function createInvitationForOrder(CreateServiceOrderInvitationRequest $request, int $id): JsonResponse
    {
        $order = ServiceOrder::with('user')->findOrFail($id);

        if ($order->isTerminal()) {
            return response()->json([
                'data' => null,
                'message' => 'Tiket yang sudah selesai atau dibatalkan tidak dapat dibuatkan undangan baru.',
                'errors' => ['status' => ['Cannot create invitation for completed or cancelled order.']],
            ], 422);
        }

        if ($order->invitation_id !== null) {
            return response()->json([
                'data' => null,
                'message' => 'Tiket ini sudah tertaut ke sebuah undangan.',
                'errors' => ['invitation_id' => ['Service order already has a linked invitation.']],
            ], 422);
        }

        $validated = $request->validated();

        $invitation = DB::transaction(function () use ($order, $validated, $request) {
            $invitation = $this->invitationCreator->createDraftForUser($order->user, $validated);

            $oldStatus = $order->status;
            $newStatus = $order->status === ServiceOrder::STATUS_PENDING_REVIEW
                ? ServiceOrder::STATUS_IN_PROGRESS
                : $order->status;

            $order->update([
                'invitation_id' => $invitation->id,
                'assigned_admin_id' => $order->assigned_admin_id ?? $request->user()->id,
                'status' => $newStatus,
            ]);

            $this->auditLogger->log(
                $request->user(),
                'service_order.invitation_created',
                $order,
                null,
                [
                    'order_number' => $order->order_number,
                    'customer_id' => $order->user_id,
                    'invitation_id' => $invitation->id,
                    'slug' => $invitation->slug,
                    'old_status' => $oldStatus,
                    'new_status' => $newStatus,
                ],
                $request,
            );

            return $invitation;
        });

        $order->refresh()->load([
            'user:id,name,email',
            'invitation:id,user_id,theme_id,title,slug,status',
            'invitation.theme:id,name,slug',
            'assignedAdmin:id,name,email',
        ]);

        return response()->json([
            'data' => [
                'order' => $order,
                'invitation' => $invitation,
            ],
            'message' => 'Draf undangan berhasil dibuat atas nama pelanggan dan ditautkan ke tiket.',
            'errors' => null,
        ], 201);
    }

    /**
     * Admin endpoint: list all invitations across all customers with owner and ticket count metadata.
     */
    public function invitations(Request $request): JsonResponse
    {
        $query = Invitation::with(['user:id,name,email', 'theme:id,name,slug,thumbnail', 'events'])
            ->withCount(['guests', 'rsvps', 'serviceOrders']);

        if ($request->filled('status') && $request->query('status') !== 'all') {
            $query->where('status', $request->query('status'));
        }

        if ($request->filled('event_type') && $request->query('event_type') !== 'all') {
            $query->where('event_type', $request->query('event_type'));
        }

        if ($request->filled('user_id')) {
            $query->where('user_id', (int) $request->query('user_id'));
        }

        if ($request->filled('search')) {
            $search = trim((string) $request->query('search'));
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($uq) use ($search) {
                        $uq->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
            });
        }

        $perPage = min(max((int) $request->query('per_page', 15), 1), 100);
        $invitations = $query->latest('id')->paginate($perPage);

        $summary = [
            'all' => Invitation::count(),
            'draft' => Invitation::where('status', 'draft')->count(),
            'published' => Invitation::where('status', 'published')->count(),
            'archived' => Invitation::where('status', 'archived')->count(),
        ];

        return response()->json([
            'data' => [
                'summary' => $summary,
                'items' => $invitations,
            ],
            'message' => 'Admin invitations retrieved successfully.',
            'errors' => null,
        ]);
    }

    /**
     * Admin endpoint: paginated audit log history across platform operations.
     */
    public function auditLogs(Request $request): JsonResponse
    {
        $query = AuditLog::with(['user:id,name,email,role_id', 'user.role:id,role_name']);

        if ($request->filled('action') && $request->query('action') !== 'all') {
            $query->where('action', $request->query('action'));
        }

        if ($request->filled('target_type') && $request->query('target_type') !== 'all') {
            $query->where('target_type', $request->query('target_type'));
        }

        if ($request->filled('user_id')) {
            $query->where('user_id', (int) $request->query('user_id'));
        }

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->query('date_from'));
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->query('date_to'));
        }

        if ($request->filled('search')) {
            $search = trim((string) $request->query('search'));
            $query->where(function ($q) use ($search) {
                $q->where('action', 'like', "%{$search}%")
                    ->orWhere('target_type', 'like', "%{$search}%")
                    ->orWhere('ip_address', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($uq) use ($search) {
                        $uq->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
            });
        }

        $perPage = min(max((int) $request->query('per_page', 25), 1), 100);
        $logs = $query->latest('id')->paginate($perPage);

        $availableActions = AuditLog::query()
            ->select('action')
            ->distinct()
            ->orderBy('action')
            ->pluck('action');

        return response()->json([
            'data' => [
                'available_actions' => $availableActions,
                'items' => $logs,
            ],
            'message' => 'Audit logs retrieved successfully.',
            'errors' => null,
        ]);
    }
}
