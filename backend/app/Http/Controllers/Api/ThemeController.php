<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Theme;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ThemeController extends Controller
{
    /**
     * Display a listing of active themes.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Theme::where('is_active', true);

        if ($request->filled('category')) {
            $query->where('category', $request->query('category'));
        }

        $themes = $query->orderBy('name')->get();

        return response()->json([
            'data' => $themes,
            'message' => 'Themes retrieved successfully.',
            'errors' => null,
        ]);
    }

    /**
     * Display the specified theme.
     */
    public function show(int $id): JsonResponse
    {
        $theme = Theme::where('is_active', true)->findOrFail($id);

        return response()->json([
            'data' => $theme,
            'message' => 'Theme details retrieved successfully.',
            'errors' => null,
        ]);
    }
}
