<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('tr_invitations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('theme_id')->constrained('ms_themes')->restrictOnDelete();
            $table->string('title', 255);
            $table->enum('event_type', ['wedding', 'birthday', 'general'])->default('wedding');
            $table->string('slug', 100)->unique();
            $table->enum('status', ['draft', 'published', 'archived'])->default('draft');
            $table->string('cover_image', 255)->nullable();
            $table->text('meta_description')->nullable();
            $table->timestamp('published_at')->nullable();
            $table->timestamps();

            $table->index('slug', 'idx_invitations_slug');
            $table->index('status', 'idx_invitations_status');
            $table->index('user_id', 'idx_invitations_user');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tr_invitations');
    }
};
