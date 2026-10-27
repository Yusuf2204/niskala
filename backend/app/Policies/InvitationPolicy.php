<?php

namespace App\Policies;

use App\Models\Invitation;
use App\Models\User;

class InvitationPolicy
{
    /**
     * Perform pre-authorization checks.
     */
    public function before(User $user, string $ability): ?bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        return null;
    }

    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Invitation $invitation): bool
    {
        return (int) $user->id === (int) $invitation->user_id;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Invitation $invitation): bool
    {
        return (int) $user->id === (int) $invitation->user_id;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Invitation $invitation): bool
    {
        return (int) $user->id === (int) $invitation->user_id;
    }

    /**
     * Determine whether the user can publish the model.
     */
    public function publish(User $user, Invitation $invitation): bool
    {
        return (int) $user->id === (int) $invitation->user_id;
    }

    /**
     * Determine whether the user can archive the model.
     */
    public function archive(User $user, Invitation $invitation): bool
    {
        return (int) $user->id === (int) $invitation->user_id;
    }
}
