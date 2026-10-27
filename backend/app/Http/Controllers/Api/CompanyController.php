<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Company;
use Illuminate\Http\Request;

class CompanyController extends Controller
{
    public function show()
    {
        $company = Company::firstOrCreate(
            ['id' => 1],
            [
                'comp_name' => 'CMS Template',
                'app_title' => 'CMS Template',
            ]
        );

        return response()->json([
            'data' => $company,
            'message' => 'OK',
            'errors' => null,
        ]);
    }

    public function update(Request $request)
    {
        $company = Company::firstOrCreate(
            ['id' => 1],
            [
                'comp_name' => 'CMS Template',
                'app_title' => 'CMS Template',
            ]
        );

        $data = $request->validate([
            'comp_name' => 'required|string|max:255',
            'comp_logo' => 'nullable|string',
            'fav_icon' => 'nullable|string',
            'app_title' => 'nullable|string|max:255',
        ]);

        $company->update($data);

        return response()->json([
            'data' => $company,
            'message' => 'Updated',
            'errors' => null,
        ]);
    }
}
