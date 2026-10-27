<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAdmin
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user) {
            return response()->json([
                'data' => null,
                'message' => 'Unauthenticated.',
                'errors' => null,
            ], 401);
        }

        if (! $user->relationLoaded('role')) {
            $user->load('role');
        }

        if ($user->role?->role_name !== 'admin') {
            return response()->json([
                'data' => null,
                'message' => 'Forbidden. Admin privileges required.',
                'errors' => ['auth' => ['Admin access required.']],
            ], 403);
        }

        return $next($request);
    }
}

