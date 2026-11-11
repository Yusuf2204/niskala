<?php

use App\Http\Controllers\Api\AdminOperationsController;
use App\Http\Controllers\Api\AuthController;
// Route Controllers
use App\Http\Controllers\Api\CompanyController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\GuestController;
use App\Http\Controllers\Api\InvitationController;
use App\Http\Controllers\Api\MenuController;
use App\Http\Controllers\Api\MusicController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\RoleMenuController;
use App\Http\Controllers\Api\RsvpController;
use App\Http\Controllers\Api\ServiceOrderController;
use App\Http\Controllers\Api\ThemeController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

// MAIN
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:5,1')->name('login');
Route::get('company', [CompanyController::class, 'show']);

// Catalog Public & Authenticated (PRD 01, PRD 02, PRD 04, PRD 05)
Route::prefix('v1')->group(function () {
    Route::get('themes', [ThemeController::class, 'index']);
    Route::get('themes/{id}', [ThemeController::class, 'show']);
    Route::get('music', [MusicController::class, 'index']);
    Route::get('public/invitations/{slug}', [InvitationController::class, 'showPublic']);
    Route::get('public/invitations/{slug}/wishes', [RsvpController::class, 'wishes']);
    Route::post('public/invitations/{slug}/rsvps', [RsvpController::class, 'storePublic'])
        ->middleware('throttle:5,1');
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/dashboard-summary', [DashboardController::class, 'summary']);
    Route::get('profile', [UserController::class, 'profile']);
    Route::put('profile', [UserController::class, 'updateProfile']);
    Route::post('profile/avatar', [UserController::class, 'uploadAvatar']);
    Route::post('change-password', [UserController::class, 'changePassword']);

    // Invitations & Master Management (PRD 01 & PRD 02)
    Route::prefix('v1')->group(function () {
        Route::get('profile', [UserController::class, 'profile']);
        Route::put('profile', [UserController::class, 'updateProfile']);
        Route::post('profile/avatar', [UserController::class, 'uploadAvatar']);
        Route::apiResource('invitations', InvitationController::class);
        Route::put('invitations/{id}/content', [InvitationController::class, 'updateContent']);
        Route::post('invitations/{id}/media', [InvitationController::class, 'uploadMedia']);
        Route::post('invitations/{id}/publish', [InvitationController::class, 'publish']);
        Route::post('invitations/{id}/archive', [InvitationController::class, 'archive']);
        Route::get('invitations/{id}/guests', [GuestController::class, 'index']);
        Route::post('invitations/{id}/guests', [GuestController::class, 'store']);
        Route::put('invitations/{id}/guests/{guestId}', [GuestController::class, 'update']);
        Route::delete('invitations/{id}/guests/{guestId}', [GuestController::class, 'destroy']);
        Route::get('invitations/{id}/rsvps', [RsvpController::class, 'index']);
        Route::put('invitations/{id}/rsvps/{rsvpId}/moderate', [RsvpController::class, 'moderate']);
        Route::get('invitations/{id}/rsvps/export', [RsvpController::class, 'export']);
        Route::post('music', [MusicController::class, 'store']);
        Route::delete('music/{id}', [MusicController::class, 'destroy']);

        // Service Orders (PRD 06 - Client)
        Route::get('service-orders', [ServiceOrderController::class, 'index']);
        Route::post('service-orders', [ServiceOrderController::class, 'store']);
        Route::get('service-orders/{id}', [ServiceOrderController::class, 'show']);
        Route::post('service-orders/{id}/approve', [ServiceOrderController::class, 'approve']);
        Route::post('service-orders/{id}/request-revision', [ServiceOrderController::class, 'requestRevision']);
        Route::post('service-orders/{id}/cancel', [ServiceOrderController::class, 'cancel']);

        // Admin Operations & Audit Trail (PRD 06 - Admin Only)
        Route::middleware('role.admin')->prefix('admin')->group(function () {
            Route::get('service-orders', [AdminOperationsController::class, 'serviceOrders']);
            Route::put('service-orders/{id}/status', [AdminOperationsController::class, 'updateServiceOrderStatus']);
            Route::put('service-orders/{id}/assign', [AdminOperationsController::class, 'assignServiceOrder']);
            Route::post('service-orders/{id}/create-invitation', [AdminOperationsController::class, 'createInvitationForOrder']);
            Route::get('invitations', [AdminOperationsController::class, 'invitations']);
            Route::get('audit-logs', [AdminOperationsController::class, 'auditLogs']);
        });
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
