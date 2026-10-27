<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Music;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MusicController extends Controller
{
    /**
     * Display a listing of active music tracks.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Music::query();

        // Admin can view all including inactive if requested
        if (! $request->user()?->isAdmin() || ! $request->boolean('include_inactive')) {
            $query->where('is_active', true);
        }

        if ($request->filled('category')) {
            $query->where('category', $request->query('category'));
        }

        if ($request->filled('search')) {
            $search = $request->query('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('artist', 'like', "%{$search}%");
            });
        }

        $tracks = $query->orderBy('title')->get();

        return response()->json([
            'data' => $tracks,
            'message' => 'Music tracks retrieved successfully.',
            'errors' => null,
        ]);
    }

    /**
     * Store a newly created music track.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:150',
            'artist' => 'nullable|string|max:100',
            'category' => 'nullable|string|max:50',
            'duration_seconds' => 'nullable|integer',
            'file' => 'required|file|mimes:mp3,wav,ogg,audio/mpeg|max:10240',
        ]);

        $path = $request->file('file')->store('music', 'public');
        $publicUrl = '/storage/'.$path;

        $music = Music::create([
            'title' => $validated['title'],
            'artist' => $validated['artist'] ?? null,
            'file_path' => $publicUrl,
            'category' => $validated['category'] ?? 'wedding',
            'duration_seconds' => $validated['duration_seconds'] ?? null,
            'is_active' => true,
        ]);

        return response()->json([
            'data' => $music,
            'message' => 'Music track uploaded successfully.',
            'errors' => null,
        ], 201);
    }

    /**
     * Remove the specified music track.
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        if (! $request->user()?->isAdmin()) {
            return response()->json([
                'data' => null,
                'message' => 'This action is unauthorized.',
                'errors' => ['authorization' => ['Only administrators can delete master music tracks.']],
            ], 403);
        }

        $music = Music::findOrFail($id);

        if ($music->file_path && str_starts_with($music->file_path, '/storage/music/')) {
            $relative = str_replace('/storage/', '', $music->file_path);
            Storage::disk('public')->delete($relative);
        }

        $music->delete();

        return response()->json([
            'data' => null,
            'message' => 'Music track deleted successfully.',
            'errors' => null,
        ]);
    }
}
