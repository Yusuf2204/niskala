<?php

namespace App\OpenApi;

use OpenApi\Annotations as OA;

/**
 * @OA\Schema(
 *     schema="Theme",
 *     @OA\Property(property="id", type="integer", example=1),
 *     @OA\Property(property="name", type="string", example="Classic Ivory"),
 *     @OA\Property(property="slug", type="string", example="classic-ivory"),
 *     @OA\Property(property="category", type="string", example="wedding"),
 *     @OA\Property(property="description", type="string", example="Tema klasik bernuansa hangat dan elegan."),
 *     @OA\Property(property="thumbnail", type="string", example="/assets/themes/classic-ivory.jpg"),
 *     @OA\Property(property="default_config", type="object"),
 *     @OA\Property(property="is_active", type="boolean", example=true),
 *     @OA\Property(property="version", type="string", example="1.0.0"),
 *     @OA\Property(property="created_at", type="string", format="date-time"),
 *     @OA\Property(property="updated_at", type="string", format="date-time")
 * )
 *
 * @OA\Schema(
 *     schema="InvitationEvent",
 *     @OA\Property(property="id", type="integer", example=1),
 *     @OA\Property(property="invitation_id", type="integer", example=1),
 *     @OA\Property(property="event_title", type="string", example="Akad Nikah"),
 *     @OA\Property(property="event_date", type="string", format="date", example="2026-12-12"),
 *     @OA\Property(property="start_time", type="string", example="08:00"),
 *     @OA\Property(property="end_time", type="string", nullable=true, example="10:00"),
 *     @OA\Property(property="time_zone", type="string", example="WIB"),
 *     @OA\Property(property="location_name", type="string", example="Masjid Al-Ikhlas"),
 *     @OA\Property(property="address", type="string", example="Jl. Merdeka No. 10, Jakarta"),
 *     @OA\Property(property="google_maps_url", type="string", nullable=true, example="https://maps.google.com/?q=..."),
 *     @OA\Property(property="latitude", type="number", format="float", nullable=true),
 *     @OA\Property(property="longitude", type="number", format="float", nullable=true)
 * )
 *
 * @OA\Schema(
 *     schema="InvitationContent",
 *     @OA\Property(property="id", type="integer", example=1),
 *     @OA\Property(property="invitation_id", type="integer", example=1),
 *     @OA\Property(property="schema_version", type="string", example="1.0.0"),
 *     @OA\Property(
 *         property="sections_data",
 *         type="array",
 *         @OA\Items(
 *             type="object",
 *             @OA\Property(property="id", type="string", example="hero-cover-1"),
 *             @OA\Property(property="type", type="string", example="HeroCover"),
 *             @OA\Property(property="order", type="integer", example=0),
 *             @OA\Property(property="props", type="object")
 *         )
 *     ),
 *     @OA\Property(property="music_url", type="string", nullable=true, example="/storage/music/sample.mp3"),
 *     @OA\Property(property="settings", type="object")
 * )
 *
 * @OA\Schema(
 *     schema="Invitation",
 *     @OA\Property(property="id", type="integer", example=1),
 *     @OA\Property(property="user_id", type="integer", example=1),
 *     @OA\Property(property="theme_id", type="integer", example=1),
 *     @OA\Property(property="title", type="string", example="The Wedding of Romeo & Juliet"),
 *     @OA\Property(property="event_type", type="string", enum={"wedding", "birthday", "general"}, example="wedding"),
 *     @OA\Property(property="slug", type="string", example="romeo-juliet"),
 *     @OA\Property(property="status", type="string", enum={"draft", "published", "archived"}, example="draft"),
 *     @OA\Property(property="cover_image", type="string", nullable=true, example="/storage/covers/sample.jpg"),
 *     @OA\Property(property="meta_description", type="string", nullable=true, example="Pernikahan Romeo dan Juliet."),
 *     @OA\Property(property="published_at", type="string", format="date-time", nullable=true),
 *     @OA\Property(property="created_at", type="string", format="date-time"),
 *     @OA\Property(property="updated_at", type="string", format="date-time"),
 *     @OA\Property(property="theme", ref="#/components/schemas/Theme"),
 *     @OA\Property(property="content", ref="#/components/schemas/InvitationContent"),
 *     @OA\Property(
 *         property="events",
 *         type="array",
 *         @OA\Items(ref="#/components/schemas/InvitationEvent")
 *     )
 * )
 *
 * @OA\Schema(
 *     schema="StoreInvitationInput",
 *     required={"title", "theme_id"},
 *     @OA\Property(property="title", type="string", example="The Wedding of Romeo & Juliet"),
 *     @OA\Property(property="theme_id", type="integer", example=1),
 *     @OA\Property(property="event_type", type="string", enum={"wedding", "birthday", "general"}, example="wedding"),
 *     @OA\Property(property="slug", type="string", nullable=true, example="romeo-juliet"),
 *     @OA\Property(property="cover_image", type="string", nullable=true, example="/storage/covers/sample.jpg"),
 *     @OA\Property(property="meta_description", type="string", nullable=true, example="Pernikahan Romeo & Juliet."),
 *     @OA\Property(property="event_title", type="string", nullable=true, example="Akad Nikah"),
 *     @OA\Property(property="event_date", type="string", format="date", nullable=true, example="2026-12-12"),
 *     @OA\Property(property="start_time", type="string", nullable=true, example="08:00"),
 *     @OA\Property(property="end_time", type="string", nullable=true, example="10:00"),
 *     @OA\Property(property="time_zone", type="string", nullable=true, example="WIB"),
 *     @OA\Property(property="location_name", type="string", nullable=true, example="Masjid Al-Ikhlas"),
 *     @OA\Property(property="address", type="string", nullable=true, example="Jl. Merdeka No. 10"),
 *     @OA\Property(property="google_maps_url", type="string", nullable=true, example="https://maps.google.com/?q=...")
 * )
 *
 * @OA\Schema(
 *     schema="UpdateInvitationInput",
 *     @OA\Property(property="title", type="string", example="The Wedding of Romeo & Juliet (Updated)"),
 *     @OA\Property(property="theme_id", type="integer", example=1),
 *     @OA\Property(property="event_type", type="string", enum={"wedding", "birthday", "general"}, example="wedding"),
 *     @OA\Property(property="slug", type="string", example="romeo-dan-juliet"),
 *     @OA\Property(property="cover_image", type="string", nullable=true, example="/storage/covers/updated.jpg"),
 *     @OA\Property(property="meta_description", type="string", nullable=true, example="Deskripsi meta undangan.")
 * )
 *
 * @OA\Schema(
 *     schema="UpdateInvitationContentInput",
 *     required={"sections_data"},
 *     @OA\Property(property="schema_version", type="string", example="1.0.0"),
 *     @OA\Property(
 *         property="sections_data",
 *         type="array",
 *         @OA\Items(
 *             type="object",
 *             required={"id", "type"},
 *             @OA\Property(property="id", type="string", example="hero-1"),
 *             @OA\Property(property="type", type="string", example="HeroCover"),
 *             @OA\Property(property="order", type="integer", example=0),
 *             @OA\Property(property="props", type="object")
 *         )
 *     ),
 *     @OA\Property(property="music_url", type="string", nullable=true, example="/storage/music/wedding.mp3"),
 *     @OA\Property(property="settings", type="object")
 * )
 */
class InvitationDocumentation
{
    /**
     * @OA\Get(
     *     path="/v1/themes",
     *     tags={"Themes"},
     *     summary="List all active design themes",
     *     @OA\Parameter(name="category", in="query", required=false, description="Filter by category", @OA\Schema(type="string", enum={"wedding", "birthday", "general"})),
     *     @OA\Response(
     *         response=200,
     *         description="Theme catalog list",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", type="array", @OA\Items(ref="#/components/schemas/Theme")),
     *             @OA\Property(property="message", type="string", example="Themes retrieved successfully."),
     *             @OA\Property(property="errors", nullable=true, example=null)
     *         )
     *     )
     * )
     *
     * @OA\Get(
     *     path="/v1/themes/{id}",
     *     tags={"Themes"},
     *     summary="Get details of a specific theme",
     *     @OA\Parameter(name="id", in="path", required=true, description="Theme ID", @OA\Schema(type="integer", example=1)),
     *     @OA\Response(
     *         response=200,
     *         description="Theme details",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", ref="#/components/schemas/Theme"),
     *             @OA\Property(property="message", type="string", example="Theme details retrieved successfully."),
     *             @OA\Property(property="errors", nullable=true, example=null)
     *         )
     *     ),
     *     @OA\Response(response=404, description="Theme not found")
     * )
     */
    public function themes(): void {}

    /**
     * @OA\Get(
     *     path="/v1/invitations",
     *     tags={"Invitations"},
     *     summary="List invitations for authenticated user or admin",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="status", in="query", required=false, description="Filter by status", @OA\Schema(type="string", enum={"draft", "published", "archived"})),
     *     @OA\Parameter(name="search", in="query", required=false, description="Search title or slug", @OA\Schema(type="string")),
     *     @OA\Parameter(name="user_id", in="query", required=false, description="Admin only: filter by user ID", @OA\Schema(type="integer")),
     *     @OA\Parameter(name="per_page", in="query", required=false, description="Items per page", @OA\Schema(type="integer", default=15)),
     *     @OA\Response(
     *         response=200,
     *         description="Paginated list of invitations",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", type="object"),
     *             @OA\Property(property="message", type="string", example="Invitations retrieved successfully."),
     *             @OA\Property(property="errors", nullable=true, example=null)
     *         )
     *     ),
     *     @OA\Response(response=401, description="Unauthorized")
     * )
     *
     * @OA\Post(
     *     path="/v1/invitations",
     *     tags={"Invitations"},
     *     summary="Create a new draft invitation",
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(ref="#/components/schemas/StoreInvitationInput")
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Draft invitation created",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", ref="#/components/schemas/Invitation"),
     *             @OA\Property(property="message", type="string", example="Invitation created successfully as draft."),
     *             @OA\Property(property="errors", nullable=true, example=null)
     *         )
     *     ),
     *     @OA\Response(response=401, description="Unauthorized"),
     *     @OA\Response(response=422, description="Validation error or reserved slug")
     * )
     *
     * @OA\Get(
     *     path="/v1/invitations/{id}",
     *     tags={"Invitations"},
     *     summary="Get full invitation details (owner or admin only)",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, description="Invitation ID", @OA\Schema(type="integer", example=1)),
     *     @OA\Response(
     *         response=200,
     *         description="Full invitation details",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", ref="#/components/schemas/Invitation"),
     *             @OA\Property(property="message", type="string", example="Invitation details retrieved successfully."),
     *             @OA\Property(property="errors", nullable=true, example=null)
     *         )
     *     ),
     *     @OA\Response(response=401, description="Unauthorized"),
     *     @OA\Response(response=403, description="Forbidden (Anti-IDOR)"),
     *     @OA\Response(response=404, description="Not found")
     * )
     *
     * @OA\Put(
     *     path="/v1/invitations/{id}",
     *     tags={"Invitations"},
     *     summary="Update basic invitation details",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, description="Invitation ID", @OA\Schema(type="integer", example=1)),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(ref="#/components/schemas/UpdateInvitationInput")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Invitation updated successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", ref="#/components/schemas/Invitation"),
     *             @OA\Property(property="message", type="string", example="Invitation updated successfully."),
     *             @OA\Property(property="errors", nullable=true, example=null)
     *         )
     *     ),
     *     @OA\Response(response=401, description="Unauthorized"),
     *     @OA\Response(response=403, description="Forbidden"),
     *     @OA\Response(response=422, description="Validation error")
     * )
     *
     * @OA\Delete(
     *     path="/v1/invitations/{id}",
     *     tags={"Invitations"},
     *     summary="Delete invitation",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, description="Invitation ID", @OA\Schema(type="integer", example=1)),
     *     @OA\Response(
     *         response=200,
     *         description="Invitation deleted",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", nullable=true, example=null),
     *             @OA\Property(property="message", type="string", example="Invitation deleted successfully."),
     *             @OA\Property(property="errors", nullable=true, example=null)
     *         )
     *     ),
     *     @OA\Response(response=401, description="Unauthorized"),
     *     @OA\Response(response=403, description="Forbidden"),
     *     @OA\Response(response=404, description="Not found")
     * )
     *
     * @OA\Put(
     *     path="/v1/invitations/{id}/content",
     *     tags={"Invitations"},
     *     summary="Update invitation sections and layout content",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, description="Invitation ID", @OA\Schema(type="integer", example=1)),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(ref="#/components/schemas/UpdateInvitationContentInput")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Content updated successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", ref="#/components/schemas/InvitationContent"),
     *             @OA\Property(property="message", type="string", example="Invitation content updated successfully."),
     *             @OA\Property(property="errors", nullable=true, example=null)
     *         )
     *     ),
     *     @OA\Response(response=401, description="Unauthorized"),
     *     @OA\Response(response=403, description="Forbidden"),
     *     @OA\Response(response=422, description="Validation error")
     * )
     *
     * @OA\Post(
     *     path="/v1/invitations/{id}/publish",
     *     tags={"Invitations"},
     *     summary="Publish an invitation to make it live",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, description="Invitation ID", @OA\Schema(type="integer", example=1)),
     *     @OA\Response(
     *         response=200,
     *         description="Invitation published successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", ref="#/components/schemas/Invitation"),
     *             @OA\Property(property="message", type="string", example="Invitation published successfully."),
     *             @OA\Property(property="errors", nullable=true, example=null)
     *         )
     *     ),
     *     @OA\Response(response=401, description="Unauthorized"),
     *     @OA\Response(response=403, description="Forbidden"),
     *     @OA\Response(response=422, description="Cannot publish without content sections")
     * )
     *
     * @OA\Post(
     *     path="/v1/invitations/{id}/archive",
     *     tags={"Invitations"},
     *     summary="Archive an invitation",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, description="Invitation ID", @OA\Schema(type="integer", example=1)),
     *     @OA\Response(
     *         response=200,
     *         description="Invitation archived successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", ref="#/components/schemas/Invitation"),
     *             @OA\Property(property="message", type="string", example="Invitation archived successfully."),
     *             @OA\Property(property="errors", nullable=true, example=null)
     *         )
     *     ),
     *     @OA\Response(response=401, description="Unauthorized"),
     *     @OA\Response(response=403, description="Forbidden")
     * )
     */
    public function invitations(): void {}
}

