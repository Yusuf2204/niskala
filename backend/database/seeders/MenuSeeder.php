<?php

namespace Database\Seeders;

use App\Models\Menus;
use Illuminate\Database\Seeder;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class MenuSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * Idempotent per menu item (keyed by the unique `menu_path` column) so
     * this seeder can be re-run safely and will update menu order, icon, and parent
     * on an existing database.
     */
    public function run(): void
    {
        $dashboard = Menus::updateOrCreate(
            ['menu_path' => '/dashboard'],
            [
                'menu_name' => 'Dashboard',
                'menu_icon' => 'cilSpeedometer',
                'menu_parent_id' => null,
                'menu_order' => 0,
            ]
        );

        $setup = Menus::updateOrCreate(
            ['menu_path' => '/setup'],
            [
                'menu_name' => 'Setup',
                'menu_icon' => 'cilSettings',
                'menu_parent_id' => null,
                'menu_order' => 1,
            ]
        );

        $setupChildren = [
            ['menu_name' => 'Company', 'menu_path' => '/setup/company', 'menu_order' => 1],
            ['menu_name' => 'Users', 'menu_path' => '/setup/users', 'menu_order' => 2],
            ['menu_name' => 'Roles', 'menu_path' => '/setup/roles', 'menu_order' => 3],
            ['menu_name' => 'Menus', 'menu_path' => '/setup/menus', 'menu_order' => 4],
            ['menu_name' => 'Role Permissions', 'menu_path' => '/setup/role-permissions', 'menu_order' => 5],
            ['menu_name' => 'Change Password', 'menu_path' => '/setup/change-password', 'menu_order' => 6],
        ];

        foreach ($setupChildren as $child) {
            Menus::updateOrCreate(
                ['menu_path' => $child['menu_path']],
                [
                    'menu_name' => $child['menu_name'],
                    'menu_parent_id' => $setup->id,
                    'menu_order' => $child['menu_order'],
                ]
            );
        }
    }
}
