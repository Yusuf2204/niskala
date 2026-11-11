<?php

namespace App\Policies;

use App\Models\ServiceOrder;
use App\Models\User;

class ServiceOrderPolicy
{
    /**
     * Perform pre-authorization checks so admins can review and fulfill tickets.
     */
    public function before(User $user, string $ability): ?bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        return null;
    }

    public function view(User $user, ServiceOrder $serviceOrder): bool
    {
        return (int) $user->id === (int) $serviceOrder->user_id;
    }

    public function approve(User $user, ServiceOrder $serviceOrder): bool
    {
        return (int) $user->id === (int) $serviceOrder->user_id;
    }

    public function requestRevision(User $user, ServiceOrder $serviceOrder): bool
    {
        return (int) $user->id === (int) $serviceOrder->user_id;
    }

    public function cancel(User $user, ServiceOrder $serviceOrder): bool
    {
        return (int) $user->id === (int) $serviceOrder->user_id;
    }
}
