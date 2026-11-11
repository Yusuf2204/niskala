<?php

namespace App\OpenApi;

use OpenApi\Annotations as OA;

/**
 * @OA\Schema(
 *     schema="Guest",
 *     @OA\Property(property="id", type="integer", example=1),
 *     @OA\Property(property="invitation_id", type="integer", example=1),
 *     @OA\Property(property="name", type="string", example="Bapak Surya & Ibu"),
 *     @OA\Property(property="slug_token", type="string", nullable=true, example="k9a2m1x8pq"),
 *     @OA\Property(property="phone_number", type="string", nullable=true, example="6281234567890"),
 *     @OA\Property(property="category", type="string", example="VIP"),
 *     @OA\Property(property="pax_allocated", type="integer", example=2),
 *     @OA\Property(property="created_at", type="string", format="date-time"),
 *     @OA\Property(property="updated_at", type="string", format="date-time")
 * )
 *
 * @OA\Schema(
 *     schema="Rsvp",
 *     @OA\Property(property="id", type="integer", example=1),
 *     @OA\Property(property="invitation_id", type="integer", example=1),
 *     @OA\Property(property="guest_id", type="integer", nullable=true, example=1),
 *     @OA\Property(property="guest_name", type="string", example="Bapak Surya"),
 *     @OA\Property(property="attendance_status", type="string", enum={"attending", "not_attending", "tentative"}, example="attending"),
 *     @OA\Property(property="pax_count", type="integer", example=2),
 *     @OA\Property(property="message", type="string", nullable=true, example="Selamat menempuh hidup baru!"),
 *     @OA\Property(property="is_hidden", type="boolean", example=false),
 *     @OA\Property(property="created_at", type="string", format="date-time"),
 *     @OA\Property(property="updated_at", type="string", format="date-time")
 * )
 *
 * @OA\Get(
 *     path="/v1/public/invitations/{slug}/wishes",
 *     tags={"Guests & RSVP"},
 *     summary="List published invitation wishes/greetings",
 *     @OA\Parameter(name="slug", in="path", required=true, @OA\Schema(type="string", example="rama-shinta")),
 *     @OA\Parameter(name="page", in="query", required=false, @OA\Schema(type="integer", example=1)),
 *     @OA\Parameter(name="per_page", in="query", required=false, @OA\Schema(type="integer", example=10)),
 *     @OA\Response(response=200, description="Paginated visible wishes"),
 *     @OA\Response(response=404, description="Invitation not found or not published")
 * )
 *
 * @OA\Post(
 *     path="/v1/public/invitations/{slug}/rsvps",
 *     tags={"Guests & RSVP"},
 *     summary="Submit public RSVP confirmation and wish (rate-limited 5 req/min/IP)",
 *     @OA\Parameter(name="slug", in="path", required=true, @OA\Schema(type="string", example="rama-shinta")),
 *     @OA\RequestBody(
 *         required=true,
 *         @OA\JsonContent(
 *             required={"guest_name", "attendance_status"},
 *             @OA\Property(property="guest_name", type="string", example="Budi Santoso"),
 *             @OA\Property(property="attendance_status", type="string", enum={"attending", "not_attending", "tentative"}, example="attending"),
 *             @OA\Property(property="pax_count", type="integer", example=2),
 *             @OA\Property(property="message", type="string", example="Semoga menjadi keluarga sakinah mawaddah warahmah."),
 *             @OA\Property(property="guest_token", type="string", nullable=true, example="k9a2m1x8pq")
 *         )
 *     ),
 *     @OA\Response(response=201, description="RSVP recorded"),
 *     @OA\Response(response=404, description="Invitation not found or not published"),
 *     @OA\Response(response=422, description="Validation error"),
 *     @OA\Response(response=429, description="Too many requests")
 * )
 *
 * @OA\Get(
 *     path="/v1/invitations/{id}/guests",
 *     tags={"Guests & RSVP"},
 *     security={{"bearerAuth":{}}},
 *     summary="List guests for an invitation",
 *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer", example=1)),
 *     @OA\Parameter(name="category", in="query", required=false, @OA\Schema(type="string")),
 *     @OA\Parameter(name="search", in="query", required=false, @OA\Schema(type="string")),
 *     @OA\Response(response=200, description="Guest listing and summary"),
 *     @OA\Response(response=403, description="Forbidden")
 * )
 *
 * @OA\Post(
 *     path="/v1/invitations/{id}/guests",
 *     tags={"Guests & RSVP"},
 *     security={{"bearerAuth":{}}},
 *     summary="Add single or batch guests to an invitation",
 *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer", example=1)),
 *     @OA\RequestBody(
 *         required=true,
 *         @OA\JsonContent(
 *             @OA\Property(property="name", type="string", example="Bapak Surya & Ibu"),
 *             @OA\Property(property="phone_number", type="string", example="6281234567890"),
 *             @OA\Property(property="category", type="string", example="VIP"),
 *             @OA\Property(property="pax_allocated", type="integer", example=2)
 *         )
 *     ),
 *     @OA\Response(response=201, description="Guest(s) created"),
 *     @OA\Response(response=403, description="Forbidden"),
 *     @OA\Response(response=422, description="Validation error")
 * )
 *
 * @OA\Put(
 *     path="/v1/invitations/{id}/guests/{guestId}",
 *     tags={"Guests & RSVP"},
 *     security={{"bearerAuth":{}}},
 *     summary="Update a guest entry",
 *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
 *     @OA\Parameter(name="guestId", in="path", required=true, @OA\Schema(type="integer")),
 *     @OA\Response(response=200, description="Guest updated"),
 *     @OA\Response(response=403, description="Forbidden")
 * )
 *
 * @OA\Delete(
 *     path="/v1/invitations/{id}/guests/{guestId}",
 *     tags={"Guests & RSVP"},
 *     security={{"bearerAuth":{}}},
 *     summary="Delete a guest entry",
 *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
 *     @OA\Parameter(name="guestId", in="path", required=true, @OA\Schema(type="integer")),
 *     @OA\Response(response=200, description="Guest deleted"),
 *     @OA\Response(response=403, description="Forbidden")
 * )
 *
 * @OA\Get(
 *     path="/v1/invitations/{id}/rsvps",
 *     tags={"Guests & RSVP"},
 *     security={{"bearerAuth":{}}},
 *     summary="List RSVP submissions and attendance totals",
 *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
 *     @OA\Parameter(name="attendance_status", in="query", required=false, @OA\Schema(type="string")),
 *     @OA\Parameter(name="search", in="query", required=false, @OA\Schema(type="string")),
 *     @OA\Response(response=200, description="RSVP list and summary"),
 *     @OA\Response(response=403, description="Forbidden")
 * )
 *
 * @OA\Put(
 *     path="/v1/invitations/{id}/rsvps/{rsvpId}/moderate",
 *     tags={"Guests & RSVP"},
 *     security={{"bearerAuth":{}}},
 *     summary="Moderate an RSVP greeting visibility",
 *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
 *     @OA\Parameter(name="rsvpId", in="path", required=true, @OA\Schema(type="integer")),
 *     @OA\RequestBody(
 *         required=true,
 *         @OA\JsonContent(
 *             required={"is_hidden"},
 *             @OA\Property(property="is_hidden", type="boolean", example=true)
 *         )
 *     ),
 *     @OA\Response(response=200, description="Moderation status updated"),
 *     @OA\Response(response=403, description="Forbidden")
 * )
 *
 * @OA\Get(
 *     path="/v1/invitations/{id}/rsvps/export",
 *     tags={"Guests & RSVP"},
 *     security={{"bearerAuth":{}}},
 *     summary="Export RSVPs as UTF-8 BOM CSV",
 *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
 *     @OA\Response(response=200, description="CSV file stream"),
 *     @OA\Response(response=403, description="Forbidden")
 * )
 */
class GuestRsvpDocumentation {}
