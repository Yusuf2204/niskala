<?php

namespace Database\Seeders;

use App\Models\Menus;
use App\Models\Roles;
use App\Models\RoleMenus;
use Illuminate\Database\Seeder;

class RoleMenuSeeder extends Seeder
{
    public function run(): void
    {
        $admin = Roles::where('role_name', 'admin')->first();
        $userRoles = Roles::whereIn('role_name', ['user', 'customer'])->get();

        // ===== ADMIN → semua menu =====
        if ($admin) {
            $menus = Menus::all();
            RoleMenus::where('role_id', $admin->id)->delete();

            foreach ($menus as $menu) {
                RoleMenus::firstOrCreate([
                    'role_id' => $admin->id,
                    'menu_id' => $menu->id,
                ]);
            }
        }

        // ===== USER / CUSTOMER → limited functional menus =====
        $userMenuPaths = [
            '/dashboard',
            '/master',
            '/master/themes',
            '/master/music',
            '/invitations',
            '/invitations/list',
            '/invitations/create',
            '/guests',
            '/guests/list',
            '/guests/rsvp',
            '/service-orders',
            '/setup',
            '/setup/change-password',
        ];

        $userMenuIds = Menus::whereIn('menu_path', $userMenuPaths)->pluck('id')->all();

        foreach ($userRoles as $uRole) {
            RoleMenus::where('role_id', $uRole->id)->delete();
            foreach ($userMenuIds as $menuId) {
                RoleMenus::firstOrCreate([
                    'role_id' => $uRole->id,
                    'menu_id' => $menuId,
                ]);
            }
        }
    }
}
