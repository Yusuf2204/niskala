<?php

namespace Tests\Feature;

use App\Models\Invitation;
use App\Models\Roles;
use App\Models\Theme;
use App\Models\User;
use Database\Seeders\ThemeSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class InvitationApiTest extends TestCase
{
    use RefreshDatabase;

    protected Theme $theme;
    protected User $userA;
    protected User $userB;
    protected User $adminUser;

    protected function setUp(): void
    {
        parent::setUp();

        $this->theme = Theme::firstOrCreate(
            ['slug' => 'test-theme'],
            [
                'name' => 'Test Theme',
                'category' => 'wedding',
                'description' => 'Test theme for testing',
                'is_active' => true,
                'version' => '1.0.0',
            ]
        );

        $customerRole = Roles::firstOrCreate(['role_name' => 'customer']);
        $adminRole = Roles::firstOrCreate(['role_name' => 'admin']);

        $this->userA = User::firstOrCreate(
            ['email' => 'test_usera@example.com'],
            [
                'name' => 'Test User A',
                'password' => bcrypt('password123'),
                'role_id' => $customerRole->id,
            ]
        );

        $this->userB = User::firstOrCreate(
            ['email' => 'test_userb@example.com'],
            [
                'name' => 'Test User B',
                'password' => bcrypt('password123'),
                'role_id' => $customerRole->id,
            ]
        );

        $this->adminUser = User::firstOrCreate(
            ['email' => 'test_admin@example.com'],
            [
                'name' => 'Test Admin',
                'password' => bcrypt('password123'),
                'role_id' => $adminRole->id,
            ]
        );
    }

    public function test_can_list_active_themes(): void
    {
        $response = $this->getJson('/api/v1/themes');

        $response->assertStatus(200)
            ->assertJsonPath('message', 'Themes retrieved successfully.');

        $this->assertIsArray($response->json('data'));
    }

    public function test_authenticated_user_can_create_draft_invitation_without_theme(): void
    {
        Sanctum::actingAs($this->userA);

        $payload = [
            'title' => 'Pernikahan Tanpa Tema',
            'event_type' => 'wedding',
        ];

        $response = $this->postJson('/api/v1/invitations', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('data.title', 'Pernikahan Tanpa Tema')
            ->assertJsonPath('data.theme_id', null)
            ->assertJsonPath('data.status', 'draft');

        $this->assertDatabaseHas('tr_invitations', [
            'title' => 'Pernikahan Tanpa Tema',
            'theme_id' => null,
            'status' => 'draft',
        ]);
    }

    public function test_authenticated_user_can_create_draft_invitation(): void
    {
        Sanctum::actingAs($this->userA);

        $payload = [
            'title' => 'Rama & Shinta Wedding',
            'theme_id' => $this->theme->id,
            'event_type' => 'wedding',
            'slug' => 'rama-shinta-2026',
            'event_title' => 'Akad Nikah',
            'event_date' => '2026-12-25',
            'start_time' => '09:00',
            'location_name' => 'Gedung Kesenian',
            'address' => 'Jl. Budaya No. 1, Jakarta',
        ];

        $response = $this->postJson('/api/v1/invitations', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('data.title', 'Rama & Shinta Wedding')
            ->assertJsonPath('data.slug', 'rama-shinta-2026')
            ->assertJsonPath('data.status', 'draft')
            ->assertJsonPath('data.published_at', null);

        $invitationId = $response->json('data.id');

        $this->assertDatabaseHas('tr_invitations', [
            'id' => $invitationId,
            'user_id' => $this->userA->id,
            'status' => 'draft',
            'slug' => 'rama-shinta-2026',
        ]);

        $this->assertDatabaseHas('tr_invitation_contents', [
            'invitation_id' => $invitationId,
        ]);

        $this->assertDatabaseHas('tr_invitation_events', [
            'invitation_id' => $invitationId,
            'event_title' => 'Akad Nikah',
        ]);
    }

    public function test_reserved_slugs_are_rejected(): void
    {
        Sanctum::actingAs($this->userA);

        $reservedSlugs = ['admin', 'api', 'dashboard', 'public', 'storage', 'login', 'logout'];

        foreach ($reservedSlugs as $slug) {
            $response = $this->postJson('/api/v1/invitations', [
                'title' => 'Reserved Test',
                'theme_id' => $this->theme->id,
                'slug' => $slug,
            ]);

            $response->assertStatus(422)
                ->assertJsonValidationErrors(['slug']);
        }
    }

    public function test_duplicate_slug_is_rejected(): void
    {
        Sanctum::actingAs($this->userA);

        $payload = [
            'title' => 'First Invitation',
            'theme_id' => $this->theme->id,
            'slug' => 'unique-wedding-slug',
        ];

        $this->postJson('/api/v1/invitations', $payload)->assertStatus(201);

        // Attempt to create another invitation with the same slug
        Sanctum::actingAs($this->userB);
        $duplicateResponse = $this->postJson('/api/v1/invitations', [
            'title' => 'Duplicate Attempt',
            'theme_id' => $this->theme->id,
            'slug' => 'unique-wedding-slug',
        ]);

        $duplicateResponse->assertStatus(422)
            ->assertJsonValidationErrors(['slug']);
    }

    public function test_anti_idor_protection_blocks_unauthorized_user(): void
    {
        // User A creates an invitation
        Sanctum::actingAs($this->userA);
        $createResponse = $this->postJson('/api/v1/invitations', [
            'title' => "User A's Private Invitation",
            'theme_id' => $this->theme->id,
            'slug' => 'user-a-private',
        ]);
        $invitationId = $createResponse->json('data.id');

        // User B attempts to view User A's invitation
        Sanctum::actingAs($this->userB);
        $viewResponse = $this->getJson("/api/v1/invitations/{$invitationId}");
        $viewResponse->assertStatus(403);

        // User B attempts to update User A's invitation
        $updateResponse = $this->putJson("/api/v1/invitations/{$invitationId}", [
            'title' => 'Hijacked Title',
        ]);
        $updateResponse->assertStatus(403);

        // User B attempts to update User A's invitation content
        $updateContentResponse = $this->putJson("/api/v1/invitations/{$invitationId}/content", [
            'sections_data' => [
                ['id' => 'sec-1', 'type' => 'HeroCover', 'props' => []],
            ],
        ]);
        $updateContentResponse->assertStatus(403);

        // User B attempts to publish User A's invitation
        $publishResponse = $this->postJson("/api/v1/invitations/{$invitationId}/publish");
        $publishResponse->assertStatus(403);

        // User B attempts to archive User A's invitation
        $archiveResponse = $this->postJson("/api/v1/invitations/{$invitationId}/archive");
        $archiveResponse->assertStatus(403);

        // User B attempts to delete User A's invitation
        $deleteResponse = $this->deleteJson("/api/v1/invitations/{$invitationId}");
        $deleteResponse->assertStatus(403);

        // Verify the database record was untouched
        $this->assertDatabaseHas('tr_invitations', [
            'id' => $invitationId,
            'title' => "User A's Private Invitation",
        ]);
    }

    public function test_admin_can_access_and_manage_any_invitation(): void
    {
        // User A creates an invitation
        Sanctum::actingAs($this->userA);
        $createResponse = $this->postJson('/api/v1/invitations', [
            'title' => "User A's Invitation",
            'theme_id' => $this->theme->id,
            'slug' => 'user-a-admin-test',
        ]);
        $invitationId = $createResponse->json('data.id');

        // Admin can view
        Sanctum::actingAs($this->adminUser);
        $viewResponse = $this->getJson("/api/v1/invitations/{$invitationId}");
        $viewResponse->assertStatus(200)
            ->assertJsonPath('data.title', "User A's Invitation");

        // Admin can update
        $updateResponse = $this->putJson("/api/v1/invitations/{$invitationId}", [
            'title' => 'Admin Assisted Title',
        ]);
        $updateResponse->assertStatus(200)
            ->assertJsonPath('data.title', 'Admin Assisted Title');
    }

    public function test_invitation_lifecycle_publish_and_archive(): void
    {
        Sanctum::actingAs($this->userA);

        $createResponse = $this->postJson('/api/v1/invitations', [
            'title' => 'Lifecycle Test',
            'theme_id' => $this->theme->id,
            'slug' => 'lifecycle-test-slug',
        ]);
        $invitationId = $createResponse->json('data.id');

        // Initially draft
        $this->assertEquals('draft', Invitation::find($invitationId)->status);

        // Publish
        $publishResponse = $this->postJson("/api/v1/invitations/{$invitationId}/publish");
        $publishResponse->assertStatus(200)
            ->assertJsonPath('data.status', 'published');

        $invitation = Invitation::find($invitationId);
        $this->assertEquals('published', $invitation->status);
        $this->assertNotNull($invitation->published_at);

        // Archive
        $archiveResponse = $this->postJson("/api/v1/invitations/{$invitationId}/archive");
        $archiveResponse->assertStatus(200)
            ->assertJsonPath('data.status', 'archived');

        $this->assertEquals('archived', Invitation::find($invitationId)->status);
    }

    public function test_update_invitation_content(): void
    {
        Sanctum::actingAs($this->userA);

        $createResponse = $this->postJson('/api/v1/invitations', [
            'title' => 'Content Update Test',
            'theme_id' => $this->theme->id,
            'slug' => 'content-update-slug',
        ]);
        $invitationId = $createResponse->json('data.id');

        $newSections = [
            [
                'id' => 'hero-1',
                'type' => 'HeroCover',
                'order' => 0,
                'props' => ['heading' => 'Welcome to our wedding!'],
            ],
            [
                'id' => 'event-1',
                'type' => 'EventSchedule',
                'order' => 1,
                'props' => ['venue' => 'Main Hall'],
            ],
        ];

        $contentResponse = $this->putJson("/api/v1/invitations/{$invitationId}/content", [
            'sections_data' => $newSections,
            'music_url' => 'https://example.com/audio/song.mp3',
            'settings' => ['primary_color' => '#A68B65'],
        ]);

        $contentResponse->assertStatus(200)
            ->assertJsonPath('data.music_url', 'https://example.com/audio/song.mp3')
            ->assertJsonPath('data.sections_data.0.type', 'HeroCover');

        $invitation = Invitation::with('content')->find($invitationId);
        $this->assertCount(2, $invitation->content->sections_data);
        $this->assertEquals('#A68B65', $invitation->content->settings['primary_color']);
    }

    public function test_upload_media_and_idor_protection(): void
    {
        Storage::fake('public');

        Sanctum::actingAs($this->userA);

        $createResponse = $this->postJson('/api/v1/invitations', [
            'title' => 'Media Test Invitation',
            'theme_id' => $this->theme->id,
            'slug' => 'media-test-slug',
        ]);
        $invitationId = $createResponse->json('data.id');

        $fakeImage = UploadedFile::fake()->image('couple.jpg', 600, 600);

        // User A uploads to User A's invitation -> Success
        $uploadResponse = $this->postJson("/api/v1/invitations/{$invitationId}/media", [
            'file' => $fakeImage,
            'type' => 'photo',
        ]);

        $uploadResponse->assertStatus(201)
            ->assertJsonPath('message', 'Media uploaded successfully.')
            ->assertJsonStructure(['data' => ['file_path', 'filename', 'size', 'mime_type']]);

        // User B tries to upload to User A's invitation -> 403 IDOR blocked
        Sanctum::actingAs($this->userB);
        $unauthorizedResponse = $this->postJson("/api/v1/invitations/{$invitationId}/media", [
            'file' => UploadedFile::fake()->image('hacker.jpg', 600, 600),
            'type' => 'photo',
        ]);

        $unauthorizedResponse->assertStatus(403);
    }

    public function test_show_public_returns_404_when_invitation_is_draft_or_unknown(): void
    {
        Sanctum::actingAs($this->userA);

        $createResponse = $this->postJson('/api/v1/invitations', [
            'title' => 'Draft Public Test',
            'theme_id' => $this->theme->id,
            'slug' => 'draft-public-test',
        ]);
        $invitationId = $createResponse->json('data.id');

        // Unauthenticated request to draft slug -> 404
        $publicRes = $this->getJson('/api/v1/public/invitations/draft-public-test');
        $publicRes->assertStatus(404)
            ->assertJsonPath('message', 'Undangan tidak ditemukan atau belum dipublikasikan.');

        // Unknown slug -> 404
        $notFoundRes = $this->getJson('/api/v1/public/invitations/non-existent-slug-xyz');
        $notFoundRes->assertStatus(404);
    }

    public function test_show_public_returns_200_when_invitation_is_published(): void
    {
        Sanctum::actingAs($this->userA);

        $createResponse = $this->postJson('/api/v1/invitations', [
            'title' => 'Published Public Test',
            'theme_id' => $this->theme->id,
            'slug' => 'published-public-test',
        ]);
        $invitationId = $createResponse->json('data.id');

        // Publish the invitation
        $this->postJson("/api/v1/invitations/{$invitationId}/publish")->assertStatus(200);

        // Guest accesses public slug unauthenticated -> 200 OK
        $publicRes = $this->getJson('/api/v1/public/invitations/published-public-test');
        $publicRes->assertStatus(200)
            ->assertJsonPath('data.slug', 'published-public-test')
            ->assertJsonPath('data.status', 'published')
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'title',
                    'slug',
                    'status',
                    'theme',
                    'content',
                    'events',
                ],
            ]);
    }
}
