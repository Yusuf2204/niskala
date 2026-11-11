<?php

namespace App\OpenApi;

use OpenApi\Annotations as OA;

/**
 * @OA\Schema(
 *     schema="ServiceOrder",
 *     @OA\Property(property="id", type="integer", example=1),
 *     @OA\Property(property="user_id", type="integer", example=2),
 *     @OA\Property(property="invitation_id", type="integer", nullable=true, example=5),
 *     @OA\Property(property="order_number", type="string", example="SRV-202611-0001"),
 *     @OA\Property(property="service_type", type="string", enum={"full_creation", "custom_styling", "data_entry", "review"}, example="full_creation"),
 *     @OA\Property(property="status", type="string", enum={"pending_review", "in_progress", "client_review", "completed", "cancelled"}, example="pending_review"),
 *     @OA\Property(property="client_notes", type="string", nullable=true),
 *     @OA\Property(property="admin_notes", type="string", nullable=true),
 *     @OA\Property(property="assigned_admin_id", type="integer", nullable=true, example=1),
 *     @OA\Property(property="completed_at", type="string", format="date-time", nullable=true),
 *     @OA\Property(property="created_at", type="string", format="date-time"),
 *     @OA\Property(property="updated_at", type="string", format="date-time")
 * )
 *
 * @OA\Schema(
 *     schema="AuditLog",
 *     @OA\Property(property="id", type="integer", example=10),
 *     @OA\Property(property="user_id", type="integer", example=1),
 *     @OA\Property(property="action", type="string", example="service_order.status_updated"),
 *     @OA\Property(property="target_type", type="string", example="App\\Models\\ServiceOrder"),
 *     @OA\Property(property="target_id", type="integer", example=1),
 *     @OA\Property(property="details", type="object", nullable=true),
 *     @OA\Property(property="ip_address", type="string", nullable=true, example="127.0.0.1"),
 *     @OA\Property(property="created_at", type="string", format="date-time")
 * )
 *
 * @OA\Get(
 *     path="/v1/service-orders",
 *     tags={"Service Orders & Admin"},
 *     security={{"bearerAuth":{}}},
 *     summary="List authenticated customer's service orders",
 *     @OA\Parameter(name="status", in="query", required=false, @OA\Schema(type="string")),
 *     @OA\Parameter(name="service_type", in="query", required=false, @OA\Schema(type="string")),
 *     @OA\Parameter(name="search", in="query", required=false, @OA\Schema(type="string")),
 *     @OA\Response(response=200, description="Paginated customer service orders")
 * )
 *
 * @OA\Post(
 *     path="/v1/service-orders",
 *     tags={"Service Orders & Admin"},
 *     security={{"bearerAuth":{}}},
 *     summary="Create a new service order assistance request",
 *     @OA\RequestBody(
 *         required=true,
 *         @OA\JsonContent(
 *             required={"service_type", "client_notes"},
 *             @OA\Property(property="service_type", type="string", enum={"full_creation", "custom_styling", "data_entry", "review"}, example="full_creation"),
 *             @OA\Property(property="invitation_id", type="integer", nullable=true, example=1),
 *             @OA\Property(property="client_notes", type="string", example="Mohon bantu susunkan undangan Adat Jawa untuk acara tanggal 12 Desember.")
 *         )
 *     ),
 *     @OA\Response(response=201, description="Service order created"),
 *     @OA\Response(response=403, description="Forbidden if linking another user's invitation"),
 *     @OA\Response(response=422, description="Validation error")
 * )
 *
 * @OA\Get(
 *     path="/v1/service-orders/{id}",
 *     tags={"Service Orders & Admin"},
 *     security={{"bearerAuth":{}}},
 *     summary="Get service order details and activity timeline",
 *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer", example=1)),
 *     @OA\Response(response=200, description="Service order detail"),
 *     @OA\Response(response=403, description="Forbidden")
 * )
 *
 * @OA\Post(
 *     path="/v1/service-orders/{id}/approve",
 *     tags={"Service Orders & Admin"},
 *     security={{"bearerAuth":{}}},
 *     summary="Approve drafted work when order status is client_review",
 *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer", example=1)),
 *     @OA\RequestBody(
 *         required=false,
 *         @OA\JsonContent(
 *             @OA\Property(property="publish_invitation", type="boolean", example=true),
 *             @OA\Property(property="client_notes", type="string", nullable=true, example="Sudah sesuai, siap dipublikasikan.")
 *         )
 *     ),
 *     @OA\Response(response=200, description="Service order approved and completed"),
 *     @OA\Response(response=403, description="Forbidden"),
 *     @OA\Response(response=422, description="Invalid status transition")
 * )
 *
 * @OA\Post(
 *     path="/v1/service-orders/{id}/request-revision",
 *     tags={"Service Orders & Admin"},
 *     security={{"bearerAuth":{}}},
 *     summary="Request revision on client_review order and move back to in_progress",
 *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer", example=1)),
 *     @OA\RequestBody(
 *         required=true,
 *         @OA\JsonContent(
 *             required={"revision_notes"},
 *             @OA\Property(property="revision_notes", type="string", example="Mohon ubah jam resepsi menjadi 13:00 WIB.")
 *         )
 *     ),
 *     @OA\Response(response=200, description="Order moved back to in_progress"),
 *     @OA\Response(response=403, description="Forbidden"),
 *     @OA\Response(response=422, description="Invalid status transition")
 * )
 *
 * @OA\Post(
 *     path="/v1/service-orders/{id}/cancel",
 *     tags={"Service Orders & Admin"},
 *     security={{"bearerAuth":{}}},
 *     summary="Cancel an open pending_review or in_progress service order",
 *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer", example=1)),
 *     @OA\Response(response=200, description="Service order cancelled"),
 *     @OA\Response(response=403, description="Forbidden"),
 *     @OA\Response(response=422, description="Cannot cancel in current status")
 * )
 *
 * @OA\Get(
 *     path="/v1/admin/service-orders",
 *     tags={"Service Orders & Admin"},
 *     security={{"bearerAuth":{}}},
 *     summary="Admin queue: list all customer service orders",
 *     @OA\Parameter(name="status", in="query", required=false, @OA\Schema(type="string")),
 *     @OA\Parameter(name="service_type", in="query", required=false, @OA\Schema(type="string")),
 *     @OA\Parameter(name="assigned_admin_id", in="query", required=false, @OA\Schema(type="string")),
 *     @OA\Response(response=200, description="All service orders queue"),
 *     @OA\Response(response=403, description="Admin access required")
 * )
 *
 * @OA\Put(
 *     path="/v1/admin/service-orders/{id}/status",
 *     tags={"Service Orders & Admin"},
 *     security={{"bearerAuth":{}}},
 *     summary="Admin updates service order workflow status, notes, or linked invitation",
 *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer", example=1)),
 *     @OA\RequestBody(
 *         required=true,
 *         @OA\JsonContent(
 *             required={"status"},
 *             @OA\Property(property="status", type="string", enum={"pending_review", "in_progress", "client_review", "completed", "cancelled"}, example="client_review"),
 *             @OA\Property(property="admin_notes", type="string", nullable=true),
 *             @OA\Property(property="invitation_id", type="integer", nullable=true)
 *         )
 *     ),
 *     @OA\Response(response=200, description="Service order status updated"),
 *     @OA\Response(response=403, description="Admin access required"),
 *     @OA\Response(response=422, description="Invalid status transition or invitation ownership mismatch")
 * )
 *
 * @OA\Put(
 *     path="/v1/admin/service-orders/{id}/assign",
 *     tags={"Service Orders & Admin"},
 *     security={{"bearerAuth":{}}},
 *     summary="Admin assigns a ticket to an admin operator",
 *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer", example=1)),
 *     @OA\RequestBody(
 *         required=true,
 *         @OA\JsonContent(
 *             @OA\Property(property="assigned_admin_id", type="integer", nullable=true, example=1),
 *             @OA\Property(property="start_progress", type="boolean", example=true)
 *         )
 *     ),
 *     @OA\Response(response=200, description="Assignee updated"),
 *     @OA\Response(response=403, description="Admin access required")
 * )
 *
 * @OA\Post(
 *     path="/v1/admin/service-orders/{id}/create-invitation",
 *     tags={"Service Orders & Admin"},
 *     security={{"bearerAuth":{}}},
 *     summary="Admin creates a draft invitation on behalf of the ticket customer and links it",
 *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer", example=1)),
 *     @OA\Response(response=201, description="Draft invitation created for customer and linked"),
 *     @OA\Response(response=403, description="Admin access required"),
 *     @OA\Response(response=422, description="Validation or ticket state error")
 * )
 *
 * @OA\Get(
 *     path="/v1/admin/invitations",
 *     tags={"Service Orders & Admin"},
 *     security={{"bearerAuth":{}}},
 *     summary="Admin: list all customer invitations across the platform",
 *     @OA\Parameter(name="status", in="query", required=false, @OA\Schema(type="string")),
 *     @OA\Parameter(name="search", in="query", required=false, @OA\Schema(type="string")),
 *     @OA\Response(response=200, description="All platform invitations"),
 *     @OA\Response(response=403, description="Admin access required")
 * )
 *
 * @OA\Get(
 *     path="/v1/admin/audit-logs",
 *     tags={"Service Orders & Admin"},
 *     security={{"bearerAuth":{}}},
 *     summary="Admin: view operational audit trail logs",
 *     @OA\Parameter(name="action", in="query", required=false, @OA\Schema(type="string")),
 *     @OA\Parameter(name="target_type", in="query", required=false, @OA\Schema(type="string")),
 *     @OA\Parameter(name="search", in="query", required=false, @OA\Schema(type="string")),
 *     @OA\Response(response=200, description="Paginated audit logs"),
 *     @OA\Response(response=403, description="Admin access required")
 * )
 */
class ServiceOrderDocumentation {}
