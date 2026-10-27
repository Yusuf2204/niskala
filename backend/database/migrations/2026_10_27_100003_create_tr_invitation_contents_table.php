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
        Schema::create('tr_invitation_contents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('invitation_id')->unique()->constrained('tr_invitations')->cascadeOnDelete();
            $table->string('schema_version', 20)->default('1.0.0');
            $table->json('sections_data')->comment('Ordered array of section objects with ID, type, and validated props');
            $table->string('music_url', 255)->nullable();
            $table->json('settings')->nullable()->comment('Custom typography, colors, animations');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tr_invitation_contents');
    }
};
