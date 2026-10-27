<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\User;
use App\Services\NavigationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function __construct(private readonly NavigationService $navigation) {}

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            return response()->json([
                'data' => null,
                'message' => 'Invalid credentials',
                'errors' => ['auth' => ['Email or password incorrect']],
            ], 401);
        }

        // Keep one active API token per user.
        $user->tokens()->delete();

        $expiresAt = config('sanctum.expiration')
            ? now()->addMinutes((int) config('sanctum.expiration'))
            : null;

        $accessToken = $user->createToken('cms-token', ['cms:access'], $expiresAt);

        return response()->json([
            'data' => [
                'token' => $accessToken->plainTextToken,
                'user' => $user,
                'company' => Company::first(),
                'navigation' => $this->navigation->forRole($user->role_id),
            ],
            'message' => 'Login successful',
            'errors' => null,
        ]);
    }

    public function me(Request $request)
    {
        $data = [
            'user' => $request->user(),
            'company' => Company::first(),
            'navigation' => $this->navigation->forRole($request->user()->role_id),
        ];

        return response()->json([
            'data' => $data,
            'message' => 'OK',
            'errors' => null,
        ]);
    }

    public function logout(Request $request)
    {
        $token = $request->user()?->currentAccessToken();

        if ($token && method_exists($token, 'delete')) {
            $token->delete();
        }

        if (app()->bound('auth')) {
            app('auth')->forgetGuards();
        }

        return response()->json([
            'data' => null,
            'message' => 'Logged out',
            'errors' => null,
        ]);
    }
}
