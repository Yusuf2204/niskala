<?php

namespace Tests\Feature;

use App\Models\Music;
use App\Models\Roles;
use App\Models\User;
use Database\Seeders\MusicSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class MusicApiTest extends TestCase
{
    use RefreshDatabase;

    protected User $customer;
    protected User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(MusicSeeder::class);

        $customerRole = Roles::firstOrCreate(['role_name' => 'customer']);
        $adminRole = Roles::firstOrCreate(['role_name' => 'admin']);

        $this->customer = User::firstOrCreate(
            ['email' => 'customer_music@example.com'],
            ['name' => 'Customer Music', 'password' => bcrypt('password123'), 'role_id' => $customerRole->id]
        );

        $this->admin = User::firstOrCreate(
            ['email' => 'admin_music@example.com'],
            ['name' => 'Admin Music', 'password' => bcrypt('password123'), 'role_id' => $adminRole->id]
        );
    }

    public function test_can_list_active_music_tracks(): void
    {
        $response = $this->getJson('/api/v1/music');

        $response->assertStatus(200)
            ->assertJsonPath('message', 'Music tracks retrieved successfully.')
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'title', 'artist', 'file_path', 'category', 'duration_seconds', 'is_active'],
                ],
            ]);

        $this->assertGreaterThanOrEqual(3, count($response->json('data')));
    }

    public function test_authenticated_user_can_upload_music(): void
    {
        Storage::fake('public');
        Sanctum::actingAs($this->customer);

        $file = UploadedFile::fake()->create('custom-song.mp3', 2048, 'audio/mpeg');

        $response = $this->postJson('/api/v1/music', [
            'title' => 'Custom Romantic Melody',
            'artist' => 'Local Artist',
            'category' => 'wedding',
            'duration_seconds' => 180,
            'file' => $file,
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.title', 'Custom Romantic Melody');

        $this->assertDatabaseHas('ms_music', [
            'title' => 'Custom Romantic Melody',
            'category' => 'wedding',
        ]);
    }

    public function test_only_admin_can_delete_music(): void
    {
        $track = Music::first();

        // Customer attempts to delete -> 403
        Sanctum::actingAs($this->customer);
        $resForbidden = $this->deleteJson("/api/v1/music/{$track->id}");
        $resForbidden->assertStatus(403);

        // Admin deletes -> 200
        Sanctum::actingAs($this->admin);
        $resSuccess = $this->deleteJson("/api/v1/music/{$track->id}");
        $resSuccess->assertStatus(200);

        $this->assertDatabaseMissing('ms_music', ['id' => $track->id]);
    }
}

