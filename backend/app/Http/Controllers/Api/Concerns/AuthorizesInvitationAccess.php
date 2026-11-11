<?php

namespace App\Http\Controllers\Api\Concerns;

use App\Models\Invitation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

trait AuthorizesInvitationAccess
{
    /**
     * Authorize an authenticated user against an invitation via InvitationPolicy.
     */
    protected function authorizeInvitation(Request $request, Invitation $invitation, string $ability = 'view'): ?JsonResponse
    {
        if ($request->user()->cannot($ability, $invitation)) {
            return response()->json([
                'data' => null,
                'message' => 'This action is unauthorized.',
                'errors' => ['authorization' => ['You do not have permission to access this invitation.']],
            ], 403);
        }

        return null;
    }

    /**
     * Load a published invitation or return null.
     */
    protected function findPublishedInvitationBySlug(string $slug): ?Invitation
    {
        $invitation = Invitation::where('slug', $slug)->first();

        if (! $invitation || $invitation->status !== 'published') {
            return null;
        }

        return $invitation;
    }

    /**
     * Standardized 404 response for hidden/draft/missing public invitations.
     */
    protected function publishedNotFoundResponse(): JsonResponse
    {
        return response()->json([
            'data' => null,
            'message' => 'Undangan tidak ditemukan atau belum dipublikasikan.',
            'errors' => ['slug' => ['This invitation is private, draft, or does not exist.']],
        ], 404);
    }
}
