<?php

namespace Tests\Feature;

use App\Models\Guest;
use App\Models\Invitation;
use App\Models\Roles;
use App\Models\Rsvp;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class GuestRsvpApiTest extends TestCase
{
    use RefreshDatabase;

    protected User $owner;
    protected User $otherUser;
    protected User $adminUser;
    protected Invitation $publishedInvitation;
    protected Invitation $draftInvitation;

    protected function setUp(): void
    {
        parent::setUp();

        $customerRole = Roles::firstOrCreate(['role_name' => 'customer']);
        $adminRole = Roles::firstOrCreate(['role_name' => 'admin']);

        $this->owner = User::firstOrCreate(
            ['email' => 'rsvp_owner@example.com'],
            [
                'name' => 'Owner User',
                'password' => bcrypt('password123'),
                'role_id' => $customerRole->id,
            ]
        );

        $this->otherUser = User::firstOrCreate(
            ['email' => 'rsvp_other@example.com'],
            [
                'name' => 'Other User',
                'password' => bcrypt('password123'),
                'role_id' => $customerRole->id,
            ]
        );

        $this->adminUser = User::firstOrCreate(
            ['email' => 'rsvp_admin@example.com'],
            [
                'name' => 'Admin User',
                'password' => bcrypt('password123'),
                'role_id' => $adminRole->id,
            ]
        );

        $this->publishedInvitation = Invitation::create([
            'user_id' => $this->owner->id,
            'title' => 'Pernikahan Published Test',
            'event_type' => 'wedding',
            'slug' => 'published-test-wedding',
            'status' => 'published',
            'published_at' => now(),
        ]);

        $this->draftInvitation = Invitation::create([
            'user_id' => $this->owner->id,
            'title' => 'Pernikahan Draft Test',
            'event_type' => 'wedding',
            'slug' => 'draft-test-wedding',
            'status' => 'draft',
        ]);
    }

    public function test_owner_can_crud_single_and_batch_guests_and_anti_idor_blocks_others(): void
    {
        Sanctum::actingAs($this->owner);

        // Single add
        $single = $this->postJson("/api/v1/invitations/{$this->publishedInvitation->id}/guests", [
            'name' => 'Bapak Surya',
            'phone_number' => '628123456789',
            'category' => 'VIP',
            'pax_allocated' => 2,
        ]);

        $single->assertStatus(201)
            ->assertJsonPath('data.name', 'Bapak Surya')
            ->assertJsonPath('data.category', 'VIP')
            ->assertJsonPath('data.pax_allocated', 2);

        $guestId = $single->json('data.id');
        $this->assertNotEmpty($single->json('data.slug_token'));

        // Batch add
        $batch = $this->postJson("/api/v1/invitations/{$this->publishedInvitation->id}/guests", [
            'guests' => [
                ['name' => 'Keluarga Budi', 'category' => 'Family', 'pax_allocated' => 4],
                ['name' => 'Rekan Kantor', 'category' => 'Colleague', 'pax_allocated' => 1],
            ],
        ]);
        $batch->assertStatus(201);
        $this->assertCount(2, $batch->json('data'));

        // Update single guest
        $this->putJson("/api/v1/invitations/{$this->publishedInvitation->id}/guests/{$guestId}", [
            'name' => 'Bapak Surya Pratama',
            'pax_allocated' => 3,
        ])->assertStatus(200)
            ->assertJsonPath('data.name', 'Bapak Surya Pratama')
            ->assertJsonPath('data.pax_allocated', 3);

        // List with summary & filter
        $list = $this->getJson("/api/v1/invitations/{$this->publishedInvitation->id}/guests?category=VIP");
        $list->assertStatus(200)
            ->assertJsonPath('data.summary.total_guests', 3)
            ->assertJsonPath('data.summary.total_pax_allocated', 8);
        $this->assertCount(1, $list->json('data.items.data'));

        // Anti-IDOR check by another user
        Sanctum::actingAs($this->otherUser);
        $this->getJson("/api/v1/invitations/{$this->publishedInvitation->id}/guests")->assertStatus(403);
        $this->postJson("/api/v1/invitations/{$this->publishedInvitation->id}/guests", [
            'name' => 'Penyusup',
        ])->assertStatus(403);
        $this->deleteJson("/api/v1/invitations/{$this->publishedInvitation->id}/guests/{$guestId}")->assertStatus(403);

        // Owner delete succeeds
        Sanctum::actingAs($this->owner);
        $this->deleteJson("/api/v1/invitations/{$this->publishedInvitation->id}/guests/{$guestId}")
            ->assertStatus(200);
        $this->assertDatabaseMissing('tr_guests', ['id' => $guestId]);
    }

    public function test_public_rsvp_sanitizes_xss_links_guest_token_and_blocks_drafts(): void
    {
        $guest = Guest::create([
            'invitation_id' => $this->publishedInvitation->id,
            'name' => 'Ibu Ratna',
            'slug_token' => 'ratna-vip-token',
            'phone_number' => '628999999999',
            'category' => 'Family',
            'pax_allocated' => 2,
        ]);

        // Show public resolves safe guest_context via ?c= without leaking phone_number
        $publicRes = $this->getJson("/api/v1/public/invitations/{$this->publishedInvitation->slug}?c=ratna-vip-token");
        $publicRes->assertStatus(200)
            ->assertJsonPath('data.guest_context.name', 'Ibu Ratna')
            ->assertJsonPath('data.guest_context.token', 'ratna-vip-token');
        $this->assertArrayNotHasKey('phone_number', $publicRes->json('data.guest_context'));

        // Draft blocks RSVP & wishes
        $this->postJson("/api/v1/public/invitations/{$this->draftInvitation->slug}/rsvps", [
            'guest_name' => 'Budi',
            'attendance_status' => 'attending',
            'pax_count' => 1,
        ])->assertStatus(404);
        $this->getJson("/api/v1/public/invitations/{$this->draftInvitation->slug}/wishes")->assertStatus(404);

        // Published RSVP submission with XSS payload
        $rsvpRes = $this->postJson("/api/v1/public/invitations/{$this->publishedInvitation->slug}/rsvps", [
            'guest_name' => '<script>alert(1)</script><b>Ibu Ratna</b>',
            'attendance_status' => 'attending',
            'pax_count' => 2,
            'message' => '<script>evil()</script>Selamat menempuh hidup baru! <i>Barakallah</i>',
            'guest_token' => 'ratna-vip-token',
        ]);

        $rsvpRes->assertStatus(201)
            ->assertJsonPath('data.guest_name', 'Ibu Ratna')
            ->assertJsonPath('data.message', 'Selamat menempuh hidup baru! Barakallah');

        $this->assertArrayNotHasKey('ip_address', $rsvpRes->json('data'));
        $this->assertDatabaseHas('tr_rsvps', [
            'invitation_id' => $this->publishedInvitation->id,
            'guest_id' => $guest->id,
            'guest_name' => 'Ibu Ratna',
            'attendance_status' => 'attending',
            'pax_count' => 2,
        ]);

        // Public wishes response does not leak ip_address / user_agent
        $wishesRes = $this->getJson("/api/v1/public/invitations/{$this->publishedInvitation->slug}/wishes");
        $wishesRes->assertStatus(200);
        $firstWish = $wishesRes->json('data.data.0');
        $this->assertArrayNotHasKey('ip_address', $firstWish);
        $this->assertArrayNotHasKey('user_agent', $firstWish);
    }

    public function test_public_rsvp_rate_limiting_throttles_excessive_requests(): void
    {
        for ($i = 1; $i <= 5; $i++) {
            $this->postJson("/api/v1/public/invitations/{$this->publishedInvitation->slug}/rsvps", [
                'guest_name' => "Tamu {$i}",
                'attendance_status' => 'attending',
                'pax_count' => 1,
                'message' => "Ucapan ke {$i}",
            ])->assertStatus(201);
        }

        // 6th request within 1 minute from same IP must return 429 Too Many Requests
        $this->postJson("/api/v1/public/invitations/{$this->publishedInvitation->slug}/rsvps", [
            'guest_name' => 'Spammer',
            'attendance_status' => 'attending',
            'pax_count' => 1,
        ])->assertStatus(429);
    }

    public function test_moderation_summary_and_csv_export_with_anti_idor(): void
    {
        $rsvp1 = Rsvp::create([
            'invitation_id' => $this->publishedInvitation->id,
            'guest_name' => 'Andi',
            'attendance_status' => 'attending',
            'pax_count' => 3,
            'message' => 'Hadir siap meramaikan!',
        ]);
        $rsvp2 = Rsvp::create([
            'invitation_id' => $this->publishedInvitation->id,
            'guest_name' => '=CMD("calc")',
            'attendance_status' => 'not_attending',
            'pax_count' => 0,
            'message' => 'Maaf berhalangan',
        ]);
        Rsvp::create([
            'invitation_id' => $this->publishedInvitation->id,
            'guest_name' => 'Citra',
            'attendance_status' => 'tentative',
            'pax_count' => 2,
            'message' => 'InsyaAllah hadir',
        ]);

        // Unauthorized user cannot list, moderate, or export
        Sanctum::actingAs($this->otherUser);
        $this->getJson("/api/v1/invitations/{$this->publishedInvitation->id}/rsvps")->assertStatus(403);
        $this->putJson("/api/v1/invitations/{$this->publishedInvitation->id}/rsvps/{$rsvp1->id}/moderate", [
            'is_hidden' => true,
        ])->assertStatus(403);
        $this->get("/api/v1/invitations/{$this->publishedInvitation->id}/rsvps/export")->assertStatus(403);

        // Owner moderates $rsvp1 to hidden
        Sanctum::actingAs($this->owner);
        $this->putJson("/api/v1/invitations/{$this->publishedInvitation->id}/rsvps/{$rsvp1->id}/moderate", [
            'is_hidden' => true,
        ])->assertStatus(200)->assertJsonPath('data.is_hidden', true);

        // Hidden item is omitted from public wishes
        $wishes = $this->getJson("/api/v1/public/invitations/{$this->publishedInvitation->slug}/wishes");
        $wishes->assertStatus(200);
        $wishIds = array_column($wishes->json('data.data'), 'id');
        $this->assertNotContains($rsvp1->id, $wishIds);
        $this->assertContains($rsvp2->id, $wishIds);

        // Owner sees accurate summary
        $summaryRes = $this->getJson("/api/v1/invitations/{$this->publishedInvitation->id}/rsvps");
        $summaryRes->assertStatus(200)
            ->assertJsonPath('data.summary.total_submissions', 3)
            ->assertJsonPath('data.summary.attending_count', 1)
            ->assertJsonPath('data.summary.not_attending_count', 1)
            ->assertJsonPath('data.summary.tentative_count', 1)
            ->assertJsonPath('data.summary.total_attending_pax', 3)
            ->assertJsonPath('data.summary.hidden_count', 1);

        // Admin can export CSV cleanly with formula escape
        Sanctum::actingAs($this->adminUser);
        $exportRes = $this->get("/api/v1/invitations/{$this->publishedInvitation->id}/rsvps/export");
        $exportRes->assertStatus(200);
        $csvContent = $exportRes->streamedContent();
        $this->assertStringContainsString("'=CMD", $csvContent);
        $this->assertStringContainsString('Hadir siap meramaikan!', $csvContent);
    }
}
