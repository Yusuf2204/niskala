<?php

use App\Http\Controllers\Api\AuthController;
// Route Controllers
use App\Http\Controllers\Api\CompanyController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\InvitationController;
use App\Http\Controllers\Api\MenuController;
use App\Http\Controllers\Api\MusicController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\RoleMenuController;
use App\Http\Controllers\Api\ThemeController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

// MAIN
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:5,1')->name('login');
Route::get('company', [CompanyController::class, 'show']);

// Catalog Public & Authenticated (PRD 01 & PRD 02)
Route::prefix('v1')->group(function () {
    Route::get('themes', [ThemeController::class, 'index']);
    Route::get('themes/{id}', [ThemeController::class, 'show']);
    Route::get('music', [MusicController::class, 'index']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/dashboard-summary', [DashboardController::class, 'summary']);
    Route::post('change-password', [UserController::class, 'changePassword']);

    // Invitations & Master Management (PRD 01 & PRD 02)
    Route::prefix('v1')->group(function () {
        Route::apiResource('invitations', InvitationController::class);
        Route::put('invitations/{id}/content', [InvitationController::class, 'updateContent']);
        Route::post('invitations/{id}/publish', [InvitationController::class, 'publish']);
        Route::post('invitations/{id}/archive', [InvitationController::class, 'archive']);
        Route::post('music', [MusicController::class, 'store']);
        Route::delete('music/{id}', [MusicController::class, 'destroy']);
    });

    // Setup (Admin only)
    Route::middleware('role.admin')->group(function () {
        Route::apiResource('users', UserController::class);
        Route::apiResource('roles', RoleController::class)->except(['show']);
        Route::apiResource('menus', MenuController::class);
        Route::get('menus-tree', [MenuController::class, 'tree']);
        Route::get('role-menus/{role}', [RoleMenuController::class, 'show']);
        Route::post('role-menus/{role}', [RoleMenuController::class, 'store']);
        Route::put('company', [CompanyController::class, 'update']);
    });
});
