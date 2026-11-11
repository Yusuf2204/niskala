<?php

namespace Database\Seeders;

use App\Models\Menus;
use Illuminate\Database\Seeder;

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
        // 1. Dashboard
        Menus::updateOrCreate(
            ['menu_path' => '/dashboard'],
            [
                'menu_name' => 'Dashboard',
                'menu_icon' => 'cilSpeedometer',
                'menu_parent_id' => null,
                'menu_order' => 1,
            ]
        );

        // 2. Master
        $master = Menus::updateOrCreate(
            ['menu_path' => '/master'],
            [
                'menu_name' => 'Master',
                'menu_icon' => 'cilLayers',
                'menu_parent_id' => null,
                'menu_order' => 2,
            ]
        );

        $this->seedChildren($master->id, [
            ['menu_name' => 'Tema Desain', 'menu_path' => '/master/themes', 'menu_order' => 1],
            ['menu_name' => 'Musik Latar', 'menu_path' => '/master/music', 'menu_order' => 2],
        ]);

        // 3. Undangan
        $invitations = Menus::updateOrCreate(
            ['menu_path' => '/invitations'],
            [
                'menu_name' => 'Undangan',
                'menu_icon' => 'cilEnvelopeClosed',
                'menu_parent_id' => null,
                'menu_order' => 3,
            ]
        );

        $this->seedChildren($invitations->id, [
            ['menu_name' => 'Daftar Undangan', 'menu_path' => '/invitations/list', 'menu_order' => 1],
            ['menu_name' => 'Buat Undangan', 'menu_path' => '/invitations/create', 'menu_order' => 2],
        ]);

        // 4. Tamu & RSVP
        $guests = Menus::updateOrCreate(
            ['menu_path' => '/guests'],
            [
                'menu_name' => 'Tamu & RSVP',
                'menu_icon' => 'cilPeople',
                'menu_parent_id' => null,
                'menu_order' => 4,
            ]
        );

        $this->seedChildren($guests->id, [
            ['menu_name' => 'Buku Tamu', 'menu_path' => '/guests/list', 'menu_order' => 1],
            ['menu_name' => 'Rekap RSVP & Doa', 'menu_path' => '/guests/rsvp', 'menu_order' => 2],
        ]);

        // 5. Layanan Bantuan
        Menus::updateOrCreate(
            ['menu_path' => '/service-orders'],
            [
                'menu_name' => 'Layanan Bantuan',
                'menu_icon' => 'cilNotes',
                'menu_parent_id' => null,
                'menu_order' => 5,
            ]
        );

        // 6. Operasional Admin (PRD 06 - Admin Only via RoleMenuSeeder)
        $adminOps = Menus::updateOrCreate(
            ['menu_path' => '/admin'],
            [
                'menu_name' => 'Operasional Admin',
                'menu_icon' => 'cilShieldAlt',
                'menu_parent_id' => null,
                'menu_order' => 6,
            ]
        );

        $this->seedChildren($adminOps->id, [
            ['menu_name' => 'Semua Undangan Klien', 'menu_path' => '/admin/invitations', 'menu_order' => 1],
            ['menu_name' => 'Audit Logs', 'menu_path' => '/admin/audit-logs', 'menu_order' => 2],
        ]);

        // 7. Setup
        $setup = Menus::updateOrCreate(
            ['menu_path' => '/setup'],
            [
                'menu_name' => 'Setup',
                'menu_icon' => 'cilSettings',
                'menu_parent_id' => null,
                'menu_order' => 7,
            ]
        );

        $this->seedChildren($setup->id, [
            ['menu_name' => 'Company', 'menu_path' => '/setup/company', 'menu_order' => 1],
            ['menu_name' => 'Users', 'menu_path' => '/setup/users', 'menu_order' => 2],
            ['menu_name' => 'Roles', 'menu_path' => '/setup/roles', 'menu_order' => 3],
            ['menu_name' => 'Menus', 'menu_path' => '/setup/menus', 'menu_order' => 4],
            ['menu_name' => 'Role Permissions', 'menu_path' => '/setup/role-permissions', 'menu_order' => 5],
            ['menu_name' => 'Change Password', 'menu_path' => '/setup/change-password', 'menu_order' => 6],
        ]);
    }

    /**
     * Upsert submenu items without icons so only top-level header menus display icons.
     *
     * @param  array<int, array{menu_name: string, menu_path: string, menu_order: int}>  $children
     */
    private function seedChildren(int $parentId, array $children): void
    {
        foreach ($children as $child) {
            Menus::updateOrCreate(
                ['menu_path' => $child['menu_path']],
                [
                    'menu_name' => $child['menu_name'],
                    // Clear legacy submenu icons on re-seed as requested.
                    'menu_icon' => null,
                    'menu_parent_id' => $parentId,
                    'menu_order' => $child['menu_order'],
                ]
            );
        }
    }
}
