<?php

namespace App\Http\Requests\Api;

class CreateServiceOrderInvitationRequest extends StoreInvitationRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() === true;
    }
}
