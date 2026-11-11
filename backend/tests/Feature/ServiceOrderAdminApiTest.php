<?php

namespace Tests\Feature;

use App\Models\AuditLog;
use App\Models\Invitation;
use App\Models\Roles;
use App\Models\ServiceOrder;
use App\Models\Theme;
use App\Models\User;
use App\Services\AuditLogger;
use Database\Seeders\ThemeSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ServiceOrderAdminApiTest extends TestCase
{
    use RefreshDatabase;

    protected User $customerA;
    protected User $customerB;
    protected User $adminUser;
    protected Theme $theme;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(ThemeSeeder::class);
        $this->theme = Theme::first();

        $customerRole = Roles::firstOrCreate(['role_name' => 'user']);
        $adminRole = Roles::firstOrCreate(['role_name' => 'admin']);

        $this->customerA = User::firstOrCreate(
            ['email' => 'service_customer_a@example.com'],
            [
                'name' => 'Pelanggan A',
                'password' => bcrypt('password123'),
                'role_id' => $customerRole->id,
            ]
        );

        $this->customerB = User::firstOrCreate(
            ['email' => 'service_customer_b@example.com'],
            [
                'name' => 'Pelanggan B',
                'password' => bcrypt('password123'),
                'role_id' => $customerRole->id,
            ]
        );

        $this->adminUser = User::firstOrCreate(
            ['email' => 'service_admin@example.com'],
            [
                'name' => 'Admin Layanan',
                'password' => bcrypt('password123'),
                'role_id' => $adminRole->id,
            ]
        );
    }

    public function test_full_service_order_workflow_from_creation_to_revision_and_approval_with_audit_logs(): void
    {
        Sanctum::actingAs($this->customerA);

        $invitation = Invitation::create([
            'user_id' => $this->customerA->id,
            'theme_id' => $this->theme->id,
            'title' => 'Pernikahan Bima & Arimbi',
            'event_type' => 'wedding',
            'slug' => 'bima-arimbi-srv',
            'status' => 'draft',
        ]);
        $invitation->content()->create([
            'schema_version' => '1.0.0',
            'sections_data' => [
                ['id' => 'hero-1', 'type' => 'HeroCover', 'order' => 0, 'props' => ['title' => 'Bima & Arimbi']],
            ],
        ]);

        // 1. Customer submits assistance ticket with XSS payload stripped cleanly
        $createRes = $this->postJson('/api/v1/service-orders', [
            'service_type' => 'custom_styling',
            'invitation_id' => $invitation->id,
            'client_notes' => 'Tolong rapikan bagian acara.<script>alert(1)</script> Terima kasih.',
        ]);

        $createRes->assertStatus(201)
            ->assertJsonPath('data.status', 'pending_review')
            ->assertJsonPath('data.service_type', 'custom_styling');

        $orderId = $createRes->json('data.id');
        $orderNumber = $createRes->json('data.order_number');
        $this->assertMatchesRegularExpression('/^SRV-\d{6}-\d{4}$/', $orderNumber);
        $this->assertStringNotContainsString('<script>', $createRes->json('data.client_notes'));

        // Customer list should not expose admin_notes
        $listRes = $this->getJson('/api/v1/service-orders');
        $listRes->assertStatus(200)
            ->assertJsonPath('data.summary.pending_review', 1);
        $this->assertArrayNotHasKey('admin_notes', $listRes->json('data.items.data.0'));

        // 2. Admin claims/assigns ticket and starts progress
        Sanctum::actingAs($this->adminUser);
        $assignRes = $this->putJson("/api/v1/admin/service-orders/{$orderId}/assign", [
            'assigned_admin_id' => $this->adminUser->id,
            'start_progress' => true,
        ]);
        $assignRes->assertStatus(200)
            ->assertJsonPath('data.assigned_admin_id', $this->adminUser->id)
            ->assertJsonPath('data.status', 'in_progress');

        // 3. Admin edits customer invitation via Visual Editor API & sends for client review
        $this->putJson("/api/v1/invitations/{$invitation->id}/content", [
            'sections_data' => [
                ['id' => 'hero-1', 'type' => 'HeroCover', 'order' => 0, 'props' => ['title' => 'Bima & Arimbi Edited']],
            ],
        ])->assertStatus(200);

        $reviewRes = $this->putJson("/api/v1/admin/service-orders/{$orderId}/status", [
            'status' => 'client_review',
            'admin_notes' => 'Internal note: Cek font selesai.',
        ]);
        $reviewRes->assertStatus(200)
            ->assertJsonPath('data.status', 'client_review')
            ->assertJsonPath('data.admin_notes', 'Internal note: Cek font selesai.');

        // 4. Customer views ticket (internal admin_notes stays hidden!) and requests revision
        Sanctum::actingAs($this->customerA);
        $showRes = $this->getJson("/api/v1/service-orders/{$orderId}");
        $showRes->assertStatus(200);
        $this->assertArrayNotHasKey('admin_notes', $showRes->json('data'));

        $revRes = $this->postJson("/api/v1/service-orders/{$orderId}/request-revision", [
            'revision_notes' => 'Mohon ubah tanggal akad ke hari Minggu.',
        ]);
        $revRes->assertStatus(200)
            ->assertJsonPath('data.status', 'in_progress');
        $this->assertStringContainsString('Mohon ubah tanggal akad ke hari Minggu.', $revRes->json('data.client_notes'));

        // 5. Admin marks client_review again, customer approves and publishes invitation
        Sanctum::actingAs($this->adminUser);
        $this->putJson("/api/v1/admin/service-orders/{$orderId}/status", [
            'status' => 'client_review',
        ])->assertStatus(200);

        Sanctum::actingAs($this->customerA);
        $approveRes = $this->postJson("/api/v1/service-orders/{$orderId}/approve", [
            'publish_invitation' => true,
            'client_notes' => 'Sudah pas sekali!',
        ]);
        $approveRes->assertStatus(200)
            ->assertJsonPath('data.status', 'completed')
            ->assertJsonPath('data.invitation.status', 'published');

        $this->assertNotNull(ServiceOrder::find($orderId)->completed_at);

        // 6. Verify log_audits recorded ticket & admin invitation actions
        $this->assertDatabaseHas('log_audits', [
            'action' => 'service_order.created',
            'target_type' => ServiceOrder::class,
            'target_id' => $orderId,
        ]);
        $this->assertDatabaseHas('log_audits', [
            'action' => 'invitation.admin_content_updated',
            'target_type' => Invitation::class,
            'target_id' => $invitation->id,
            'user_id' => $this->adminUser->id,
        ]);
        $this->assertDatabaseHas('log_audits', [
            'action' => 'service_order.status_updated',
            'target_type' => ServiceOrder::class,
            'target_id' => $orderId,
        ]);
        $this->assertDatabaseHas('log_audits', [
            'action' => 'service_order.approved',
            'target_type' => ServiceOrder::class,
            'target_id' => $orderId,
        ]);
    }

    public function test_admin_can_create_invitation_for_customer_ticket_and_access_admin_dashboards(): void
    {
        Sanctum::actingAs($this->customerA);

        $orderRes = $this->postJson('/api/v1/service-orders', [
            'service_type' => 'full_creation',
            'client_notes' => 'Belum buat undangan sama sekali, tolong buatkan paket lengkap Adat Jawa.',
        ])->assertStatus(201);

        $orderId = $orderRes->json('data.id');
        $beforeInvCount = Invitation::count();

        Sanctum::actingAs($this->adminUser);

        $createInvRes = $this->postJson("/api/v1/admin/service-orders/{$orderId}/create-invitation", [
            'title' => 'Pernikahan Nakula & Sadewa',
            'theme_id' => $this->theme->id,
            'event_type' => 'wedding',
            'event_title' => 'Akad Nikah',
            'event_date' => '2027-01-15',
            'location_name' => 'Pendopo Agung',
            'address' => 'Yogyakarta',
        ]);

        $createInvRes->assertStatus(201)
            ->assertJsonPath('data.order.status', 'in_progress')
            ->assertJsonPath('data.invitation.user_id', $this->customerA->id);

        $createdInvId = $createInvRes->json('data.invitation.id');

        // Verify /api/v1/admin/invitations & /api/v1/admin/audit-logs work for admin
        $adminInvRes = $this->getJson('/api/v1/admin/invitations');
        $adminInvRes->assertStatus(200)
            ->assertJsonPath('data.summary.all', $beforeInvCount + 1)
            ->assertJsonPath('data.items.data.0.user.email', $this->customerA->email);

        $filteredInvRes = $this->getJson("/api/v1/admin/invitations?user_id={$this->customerA->id}");
        $filteredInvRes->assertStatus(200)
            ->assertJsonPath('data.items.data.0.id', $createdInvId)
            ->assertJsonPath('data.items.data.0.user.email', $this->customerA->email);

        $auditRes = $this->getJson('/api/v1/admin/audit-logs?action=service_order.invitation_created');
        $auditRes->assertStatus(200);
        $this->assertGreaterThanOrEqual(1, count($auditRes->json('data.items.data')));
        $this->assertDatabaseHas('log_audits', [
            'action' => 'service_order.invitation_created',
            'target_id' => $orderId,
        ]);

        // Customer A now sees the linked invitation on their ticket
        Sanctum::actingAs($this->customerA);
        $this->getJson("/api/v1/service-orders/{$orderId}")
            ->assertStatus(200)
            ->assertJsonPath('data.invitation.id', $createdInvId);
    }

    public function test_non_admin_is_blocked_from_admin_endpoints_and_anti_idor_protects_orders(): void
    {
        $customerBInvitation = Invitation::create([
            'user_id' => $this->customerB->id,
            'title' => 'Undangan Rahasia B',
            'event_type' => 'general',
            'slug' => 'rahasia-b',
            'status' => 'draft',
        ]);

        Sanctum::actingAs($this->customerA);

        // Customer A cannot link Customer B's invitation when creating a ticket
        $this->postJson('/api/v1/service-orders', [
            'service_type' => 'review',
            'invitation_id' => $customerBInvitation->id,
            'client_notes' => 'Coba menautkan undangan orang lain.',
        ])->assertStatus(403);

        // Customer A creates their own order
        $orderA = ServiceOrder::create([
            'user_id' => $this->customerA->id,
            'order_number' => 'SRV-202611-0099',
            'service_type' => 'full_creation',
            'status' => 'client_review',
            'client_notes' => 'Catatan milik A',
        ]);

        // Non-admin blocked from all /api/v1/admin/* endpoints with 403
        $this->getJson('/api/v1/admin/service-orders')->assertStatus(403);
        $this->putJson("/api/v1/admin/service-orders/{$orderA->id}/status", ['status' => 'in_progress'])->assertStatus(403);
        $this->putJson("/api/v1/admin/service-orders/{$orderA->id}/assign", ['assigned_admin_id' => $this->adminUser->id])->assertStatus(403);
        $this->postJson("/api/v1/admin/service-orders/{$orderA->id}/create-invitation", ['title' => 'Hack'])->assertStatus(403);
        $this->getJson('/api/v1/admin/invitations')->assertStatus(403);
        $this->getJson('/api/v1/admin/audit-logs')->assertStatus(403);

        // Customer B blocked from accessing or acting on Customer A's ticket (Anti-IDOR)
        Sanctum::actingAs($this->customerB);
        $this->getJson("/api/v1/service-orders/{$orderA->id}")->assertStatus(403);
        $this->postJson("/api/v1/service-orders/{$orderA->id}/approve")->assertStatus(403);
        $this->postJson("/api/v1/service-orders/{$orderA->id}/request-revision", ['revision_notes' => 'Ubah judul'])->assertStatus(403);
        $this->postJson("/api/v1/service-orders/{$orderA->id}/cancel")->assertStatus(403);
    }

    public function test_state_transition_validation_and_audit_log_redaction(): void
    {
        $order = ServiceOrder::create([
            'user_id' => $this->customerA->id,
            'order_number' => 'SRV-202611-0100',
            'service_type' => 'review',
            'status' => 'pending_review',
            'client_notes' => 'Tolong review undangan saya.',
        ]);

        $otherInv = Invitation::create([
            'user_id' => $this->customerB->id,
            'title' => 'Milik B',
            'event_type' => 'wedding',
            'slug' => 'milik-b',
            'status' => 'draft',
        ]);

        Sanctum::actingAs($this->adminUser);

        // Cannot jump directly pending_review -> completed
        $this->putJson("/api/v1/admin/service-orders/{$order->id}/status", [
            'status' => 'completed',
        ])->assertStatus(422);

        // Cannot move to client_review without linked invitation
        $this->putJson("/api/v1/admin/service-orders/{$order->id}/status", ['status' => 'in_progress'])->assertStatus(200);
        $this->putJson("/api/v1/admin/service-orders/{$order->id}/status", [
            'status' => 'client_review',
        ])->assertStatus(422);

        // Cannot link another customer's invitation to order
        $this->putJson("/api/v1/admin/service-orders/{$order->id}/status", [
            'status' => 'in_progress',
            'invitation_id' => $otherInv->id,
        ])->assertStatus(422);

        // Cannot assign a non-admin user
        $this->putJson("/api/v1/admin/service-orders/{$order->id}/assign", [
            'assigned_admin_id' => $this->customerB->id,
        ])->assertStatus(422);

        // Customer can cancel open ticket
        Sanctum::actingAs($this->customerA);
        $this->postJson("/api/v1/service-orders/{$order->id}/cancel")
            ->assertStatus(200)
            ->assertJsonPath('data.status', 'cancelled');

        // Cancelled ticket is terminal and cannot reopen
        Sanctum::actingAs($this->adminUser);
        $this->putJson("/api/v1/admin/service-orders/{$order->id}/status", [
            'status' => 'in_progress',
        ])->assertStatus(422);

        // AuditLogger redacts secrets/tokens
        $logger = app(AuditLogger::class);
        $log = $logger->log($this->adminUser, 'test.redaction', $order, null, [
            'token' => 'secret-bearer-token',
            'nested' => ['password' => 'my-pass', 'safe' => 'ok'],
        ]);
        $fresh = AuditLog::find($log->id);
        $this->assertSame('[REDACTED]', $fresh->details['token']);
        $this->assertSame('[REDACTED]', $fresh->details['nested']['password']);
        $this->assertSame('ok', $fresh->details['nested']['safe']);
    }
}
