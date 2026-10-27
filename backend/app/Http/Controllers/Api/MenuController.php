<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Menus;
use Illuminate\Http\Request;

class MenuController extends Controller
{
    public function index()
    {
        return response()->json([
            'data' => Menus::with('parent')->orderBy('menu_order')->get(),
            'message' => 'OK',
            'errors' => null
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'menu_name' => 'required|string|max:255',
            'menu_path' => 'required|string|max:255|unique:menus,menu_path',
            'menu_icon' => 'nullable|string|max:100',
            'menu_parent_id' => 'nullable|exists:menus,id',
            'menu_order' => 'nullable|integer',
        ]);

        $menu = Menus::create($data);

        return response()->json([
            'data' => $menu,
            'message' => 'Created',
            'errors' => null,
        ], 201);
    }

    public function show($id)
    {
        return response()->json([
            'data' => Menus::with('parent')->findOrFail($id),
            'message' => 'OK',
            'errors' => null,
        ]);
    }

    public function update(Request $request, $id)
    {
        $menu = Menus::findOrFail($id);

        $data = $request->validate([
            'menu_name' => 'required|string|max:255',
            'menu_path' => 'required|string|max:255|unique:menus,menu_path,'.$id,
            'menu_icon' => 'nullable|string|max:100',
            'menu_parent_id' => [
                'nullable',
                'exists:menus,id',
                function ($attribute, $value, $fail) use ($id) {
                    if ((int) $value === (int) $id) {
                        $fail('A menu cannot be its own parent.');
                    }
                },
            ],
            'menu_order' => 'nullable|integer',
        ]);

        $menu->update($data);

        return response()->json([
            'data' => $menu,
            'message' => 'Updated',
            'errors' => null,
        ]);
    }

    public function destroy($id)
    {
        $menu = Menus::findOrFail($id);
        $menu->delete();

        return response()->json([
            'data' => true,
            'message' => 'Deleted',
            'errors' => null
        ]);
    }

    public function tree()
    {
        $menus = Menus::whereNull('menu_parent_id')
            ->with('children.children')
            ->orderBy('menu_order')
            ->get();

        return response()->json([
            'data' => $menus,
            'message' => 'OK',
            'errors' => null
        ]);
    }
}
