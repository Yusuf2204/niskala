<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class UserController extends Controller
{
    public function index() {
        return response()->json([
            'data' => User::with('role')->get(),
            'message' => 'OK',
            'errors' => null,
        ]);
    }

    public function store(Request $request) {
        $data = $request->validate([
            'name'     => 'required|string',
            'email'    => 'required|email|unique:users',
            'password' => 'required|min:6',
            'role_id'  => 'required|exists:roles,id',
        ]);

        $data['password'] = Hash::make($data['password']);

        $user = User::create($data);

        return response()->json([
            'data' => $user,
            'message' => 'User created',
            'errors' => null,
        ], 201);
    }

    public function show($id) {
        return response()->json([
            'data' => User::with('role')->findOrFail($id),
            'message' => 'OK',
            'errors' => null,
        ]);
    }

    public function update(Request $request, $id) {
        $user = User::findOrFail($id);

        $data = $request->validate([
            'name'     => 'required|string',
            'email'    => 'required|email|unique:users,email,' . $id,
            'password' => 'nullable|min:6',
            'role_id'  => 'nullable|exists:roles,id',
        ]);

        if (!empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }

        $user->update($data);

        return response()->json([
            'data' => $user,
            'message' => 'User updated',
            'errors' => null,
        ]);
    }

    public function destroy(Request $request, $id) {
        if ((int) $id === (int) ($request->user()?->id ?? Auth::id())) {
            return response()->json([
                'data' => null,
                'message' => 'You cannot delete your own account.',
                'errors' => ['user' => ['You cannot delete your own account.']],
            ], 422);
        }

        User::findOrFail($id)->delete();

        return response()->json([
            'data' => null,
            'message' => 'User deleted',
            'errors' => null,
        ]);
    }

    public function profile(Request $request)
    {
        return response()->json([
            'data' => $request->user()->load('role'),
            'message' => 'OK',
            'errors' => null,
        ]);
    }

    public function updateProfile(Request $request)
    {
        /** @var User $user */
        $user = $request->user();

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email,'.$user->id,
            'avatar' => 'nullable|string',
        ]);

        if (array_key_exists('avatar', $data) && empty($data['avatar'])) {
            $data['avatar'] = null;
        }

        $user->update($data);

        return response()->json([
            'data' => $user->fresh(['role']),
            'message' => 'Profil berhasil diperbarui',
            'errors' => null,
        ]);
    }

    public function uploadAvatar(Request $request)
    {
        /** @var User $user */
        $user = $request->user();

        if ($request->hasFile('avatar')) {
            $request->validate([
                'avatar' => ['required', 'file', 'image', 'mimes:jpeg,png,jpg,webp,gif', 'max:5120'],
            ]);

            $disk = config('filesystems.default') === 's3' ? 's3' : 'public';
            $path = $request->file('avatar')->store('avatars/' . $user->id, $disk);
            $avatarUrl = Storage::disk($disk)->url($path);
            $user->update(['avatar' => $avatarUrl]);
        } elseif ($request->filled('avatar')) {
            $data = $request->validate([
                'avatar' => ['required', 'string'],
            ]);
            $user->update(['avatar' => $data['avatar']]);
            $avatarUrl = $user->avatar;
        } else {
            return response()->json([
                'data' => null,
                'message' => 'File atau data avatar wajib disertakan.',
                'errors' => ['avatar' => ['File atau data avatar wajib disertakan.']],
            ], 422);
        }

        return response()->json([
            'data' => [
                'user' => $user->fresh(['role']),
                'avatar' => $avatarUrl,
            ],
            'message' => 'Foto profil berhasil diperbarui.',
            'errors' => null,
        ]);
    }

    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required',
            'new_password' => 'required|min:6',
            'confirm_password' => 'required|same:new_password',
        ]);

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'data' => null,
                'message' => 'Current password is incorrect',
                'errors' => ['current_password' => ['Wrong password']],
            ], 422);
        }

        $user->update([
            'password' => Hash::make($request->new_password),
        ]);

        return response()->json([
            'data' => true,
            'message' => 'Password updated',
            'errors' => null,
        ]);
    }
}
