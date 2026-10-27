<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\Menus;
use App\Models\Roles;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class CmsStressTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        config([
            'auth.admin.email' => 'admin@example.com',
            'auth.admin.password' => 'secret12345678',
            'auth.admin.name' => 'Super Admin',
        ]);
    }

    public function test_seeder_idempotency_on_multiple_runs(): void
    {
        // First run
        $this->seed(DatabaseSeeder::class);
        $roleCountInitial = Roles::count();
        $menuCountInitial = Menus::count();
        $companyCountInitial = Company::count();
        $userCountInitial = User::count();

        // Second run (simulating re-deploy or re-run)
        $this->seed(DatabaseSeeder::class);

        $this->assertSame($roleCountInitial, Roles::count(), 'Roles duplicated after second seed run');
        $this->assertSame($menuCountInitial, Menus::count(), 'Menus duplicated after second seed run');
        $this->assertSame($companyCountInitial, Company::count(), 'Companies duplicated after second seed run');
        $this->assertSame($userCountInitial, User::count(), 'Users duplicated after second seed run');
    }

    public function test_authentication_flow_and_token_generation(): void
    {
        $this->seed(DatabaseSeeder::class);

        // Invalid credentials
        $response = $this->postJson('/api/login', [
            'email' => 'admin@example.com',
            'password' => 'wrong-password',
        ]);
        $response->assertStatus(401)
            ->assertJson(['message' => 'Invalid credentials']);

        // Valid credentials
        $loginRes = $this->postJson('/api/login', [
            'email' => 'admin@example.com',
            'password' => 'secret12345678',
        ]);
        $loginRes->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'token',
                    'user' => ['id', 'name', 'email', 'role_id'],
                    'company',
                    'navigation',
                ],
                'message',
            ]);

        $token = $loginRes->json('data.token');

        // /api/me with token
        $meRes = $this->withHeader('Authorization', 'Bearer '.$token)->getJson('/api/me');
        $meRes->assertStatus(200)
            ->assertJsonPath('data.user.email', 'admin@example.com');

        // /api/logout
        $logoutRes = $this->withHeader('Authorization', 'Bearer '.$token)->postJson('/api/logout');
        $logoutRes->assertStatus(200);

        // Revoked token should no longer work
        $afterLogoutRes = $this->withHeader('Authorization', 'Bearer '.$token)->getJson('/api/me');
        $afterLogoutRes->assertStatus(401);
    }

    public function test_role_based_access_control_blocks_non_admin_users(): void
    {
        $this->seed(DatabaseSeeder::class);

        $userRole = Roles::where('role_name', 'user')->first();
        $regularUser = User::create([
            'name' => 'Regular User',
            'email' => 'regular@example.com',
            'password' => Hash::make('password123'),
            'role_id' => $userRole->id,
        ]);

        $loginRes = $this->postJson('/api/login', [
            'email' => 'regular@example.com',
            'password' => 'password123',
        ]);
        $token = $loginRes->json('data.token');
        $headers = ['Authorization' => 'Bearer '.$token];

        // Access to dashboard summary allowed for all authenticated users
        $this->withHeaders($headers)->getJson('/api/dashboard-summary')->assertStatus(200);

        // Access to Setup resources MUST return 403 Forbidden
        $this->withHeaders($headers)->getJson('/api/users')->assertStatus(403);
        $this->withHeaders($headers)->postJson('/api/users', [
            'name' => 'Hacker',
            'email' => 'hacker@example.com',
            'password' => 'secret123',
            'role_id' => 1,
        ])->assertStatus(403);

        $this->withHeaders($headers)->getJson('/api/roles')->assertStatus(403);
        $this->withHeaders($headers)->postJson('/api/roles', ['role_name' => 'superadmin'])->assertStatus(403);
        $this->withHeaders($headers)->getJson('/api/menus')->assertStatus(403);
        $this->withHeaders($headers)->postJson('/api/menus', [
            'menu_name' => 'Hack Menu',
            'menu_path' => '/hack',
        ])->assertStatus(403);

        $this->withHeaders($headers)->putJson('/api/company', [
            'comp_name' => 'Hacked Company',
        ])->assertStatus(403);

        $this->withHeaders($headers)->postJson('/api/role-menus/1', [
            'menu_ids' => [1, 2],
        ])->assertStatus(403);
    }

    public function test_admin_cannot_delete_own_account_or_default_admin_role(): void
    {
        $this->seed(DatabaseSeeder::class);

        $admin = User::where('email', 'admin@example.com')->first();
        $loginRes = $this->postJson('/api/login', [
            'email' => 'admin@example.com',
            'password' => 'secret12345678',
        ]);
        $headers = ['Authorization' => 'Bearer '.$loginRes->json('data.token')];

        // Attempt to delete self
        $deleteSelfRes = $this->withHeaders($headers)->deleteJson('/api/users/'.$admin->id);
        $deleteSelfRes->assertStatus(422)
            ->assertJsonPath('message', 'You cannot delete your own account.');

        // Attempt to delete admin role (ID 1 / role_name 'admin')
        $adminRole = Roles::where('role_name', 'admin')->first();
        $deleteRoleRes = $this->withHeaders($headers)->deleteJson('/api/roles/'.$adminRole->id);
        $deleteRoleRes->assertStatus(422)
            ->assertJsonPath('message', 'The default admin role cannot be deleted.');
    }

    public function test_menu_validation_and_prevent_self_parenting(): void
    {
        $this->seed(DatabaseSeeder::class);

        $admin = User::where('email', 'admin@example.com')->first();
        $loginRes = $this->postJson('/api/login', [
            'email' => 'admin@example.com',
            'password' => 'secret12345678',
        ]);
        $headers = ['Authorization' => 'Bearer '.$loginRes->json('data.token')];

        $dashboard = Menus::where('menu_path', '/dashboard')->first();

        // Attempt to set dashboard's parent to itself
        $selfParentRes = $this->withHeaders($headers)->putJson('/api/menus/'.$dashboard->id, [
            'menu_name' => 'Dashboard Updated',
            'menu_path' => '/dashboard',
            'menu_parent_id' => $dashboard->id,
        ]);
        $selfParentRes->assertStatus(422)
            ->assertJsonValidationErrors(['menu_parent_id']);
    }

    public function test_change_password_flow(): void
    {
        $this->seed(DatabaseSeeder::class);

        $loginRes = $this->postJson('/api/login', [
            'email' => 'admin@example.com',
            'password' => 'secret12345678',
        ]);
        $headers = ['Authorization' => 'Bearer '.$loginRes->json('data.token')];

        // Wrong current password
        $wrongPassRes = $this->withHeaders($headers)->postJson('/api/change-password', [
            'current_password' => 'wrong',
            'new_password' => 'brandnewpassword123',
            'confirm_password' => 'brandnewpassword123',
        ]);
        $wrongPassRes->assertStatus(422);

        // Mismatched confirmation
        $mismatchRes = $this->withHeaders($headers)->postJson('/api/change-password', [
            'current_password' => 'secret12345678',
            'new_password' => 'brandnewpassword123',
            'confirm_password' => 'differentpassword',
        ]);
        $mismatchRes->assertStatus(422);

        // Successful password change
        $successRes = $this->withHeaders($headers)->postJson('/api/change-password', [
            'current_password' => 'secret12345678',
            'new_password' => 'brandnewpassword123',
            'confirm_password' => 'brandnewpassword123',
        ]);
        $successRes->assertStatus(200);

        // Login with old password fails
        $this->postJson('/api/login', [
            'email' => 'admin@example.com',
            'password' => 'secret12345678',
        ])->assertStatus(401);

        // Login with new password succeeds
        $this->postJson('/api/login', [
            'email' => 'admin@example.com',
            'password' => 'brandnewpassword123',
        ])->assertStatus(200);
    }

    public function test_user_crud_and_validation_edge_cases(): void
    {
        $this->seed(DatabaseSeeder::class);

        $loginRes = $this->postJson('/api/login', [
            'email' => 'admin@example.com',
            'password' => 'secret12345678',
        ]);
        $headers = ['Authorization' => 'Bearer '.$loginRes->json('data.token')];
        $userRole = Roles::where('role_name', 'user')->first();

        // 1. Create user successfully
        $createRes = $this->withHeaders($headers)->postJson('/api/users', [
            'name' => 'Tester One',
            'email' => 'tester1@example.com',
            'password' => 'password123',
            'role_id' => $userRole->id,
        ]);
        $createRes->assertStatus(201);
        $newUserId = $createRes->json('data.id');

        // 2. Duplicate email rejected
        $this->withHeaders($headers)->postJson('/api/users', [
            'name' => 'Tester Duplicate',
            'email' => 'tester1@example.com',
            'password' => 'password123',
            'role_id' => $userRole->id,
        ])->assertStatus(422)->assertJsonValidationErrors(['email']);

        // 3. Short password rejected
        $this->withHeaders($headers)->postJson('/api/users', [
            'name' => 'Tester Short',
            'email' => 'testers@example.com',
            'password' => '12345',
            'role_id' => $userRole->id,
        ])->assertStatus(422)->assertJsonValidationErrors(['password']);

        // 4. Invalid role_id rejected
        $this->withHeaders($headers)->postJson('/api/users', [
            'name' => 'Tester Role',
            'email' => 'testerole@example.com',
            'password' => 'password123',
            'role_id' => 99999,
        ])->assertStatus(422)->assertJsonValidationErrors(['role_id']);

        // 5. Update with same email succeeds
        $this->withHeaders($headers)->putJson('/api/users/'.$newUserId, [
            'name' => 'Tester Updated',
            'email' => 'tester1@example.com',
            'role_id' => $userRole->id,
        ])->assertStatus(200)->assertJsonPath('data.name', 'Tester Updated');

        // 6. Update with duplicate email rejected
        $this->withHeaders($headers)->putJson('/api/users/'.$newUserId, [
            'name' => 'Tester Updated',
            'email' => 'admin@example.com',
            'role_id' => $userRole->id,
        ])->assertStatus(422)->assertJsonValidationErrors(['email']);

        // 7. Delete user succeeds
        $this->withHeaders($headers)->deleteJson('/api/users/'.$newUserId)->assertStatus(200);
        $this->assertNull(User::find($newUserId));
    }

    public function test_role_crud_and_permissions_sync(): void
    {
        $this->seed(DatabaseSeeder::class);

        $loginRes = $this->postJson('/api/login', [
            'email' => 'admin@example.com',
            'password' => 'secret12345678',
        ]);
        $headers = ['Authorization' => 'Bearer '.$loginRes->json('data.token')];

        // 1. Create custom role
        $roleRes = $this->withHeaders($headers)->postJson('/api/roles', [
            'role_name' => 'editor',
        ]);
        $roleRes->assertStatus(201);
        $roleId = $roleRes->json('data.id');

        // 2. Duplicate role_name rejected
        $this->withHeaders($headers)->postJson('/api/roles', [
            'role_name' => 'editor',
        ])->assertStatus(422)->assertJsonValidationErrors(['role_name']);

        // 3. Sync permissions for custom role
        $allMenuIds = Menus::pluck('id')->take(2)->toArray();
        $syncRes = $this->withHeaders($headers)->postJson('/api/role-menus/'.$roleId, [
            'menu_ids' => $allMenuIds,
        ]);
        $syncRes->assertStatus(200);

        // 4. Fetch navigation for custom role
        $navRes = $this->withHeaders($headers)->getJson('/api/role-menus/'.$roleId);
        $navRes->assertStatus(200);

        // 5. Delete custom role succeeds
        $this->withHeaders($headers)->deleteJson('/api/roles/'.$roleId)->assertStatus(200);
        $this->assertNull(Roles::find($roleId));
    }

    public function test_menu_tree_structure_and_hierarchy(): void
    {
        $this->seed(DatabaseSeeder::class);

        $loginRes = $this->postJson('/api/login', [
            'email' => 'admin@example.com',
            'password' => 'secret12345678',
        ]);
        $headers = ['Authorization' => 'Bearer '.$loginRes->json('data.token')];

        // Fetch tree
        $treeRes = $this->withHeaders($headers)->getJson('/api/menus-tree');
        $treeRes->assertStatus(200)->assertJsonStructure([
            'data' => [
                '*' => [
                    'id',
                    'menu_name',
                    'menu_path',
                    'children',
                ],
            ],
            'message',
        ]);
    }

    public function test_company_public_access_and_admin_update(): void
    {
        $this->seed(DatabaseSeeder::class);

        // Public read (no auth required)
        $publicRes = $this->getJson('/api/company');
        $publicRes->assertStatus(200)->assertJsonStructure([
            'data' => ['id', 'comp_name'],
        ]);

        // Admin update
        $loginRes = $this->postJson('/api/login', [
            'email' => 'admin@example.com',
            'password' => 'secret12345678',
        ]);
        $headers = ['Authorization' => 'Bearer '.$loginRes->json('data.token')];

        $updateRes = $this->withHeaders($headers)->putJson('/api/company', [
            'comp_name' => 'Super CMS Corp',
            'app_title' => 'Super Portal',
        ]);
        $updateRes->assertStatus(200)
            ->assertJsonPath('data.comp_name', 'Super CMS Corp')
            ->assertJsonPath('data.app_title', 'Super Portal');
    }

    public function test_login_rate_limiting_throttle(): void
    {
        $this->seed(DatabaseSeeder::class);

        // 5 allowed attempts
        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/login', [
                'email' => 'attacker@example.com',
                'password' => 'badpass'.$i,
            ])->assertStatus(401);
        }

        // 6th attempt must be 429 Too Many Requests
        $throttleRes = $this->postJson('/api/login', [
            'email' => 'attacker@example.com',
            'password' => 'badpass6',
        ]);
        $throttleRes->assertStatus(429);
    }
}
