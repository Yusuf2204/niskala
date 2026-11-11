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
        Schema::create('tr_rsvps', function (Blueprint $table) {
            $table->id();
            $table->foreignId('invitation_id')->constrained('tr_invitations')->cascadeOnDelete();
            $table->foreignId('guest_id')->nullable()->constrained('tr_guests')->nullOnDelete();
            $table->string('guest_name', 150);
            $table->enum('attendance_status', ['attending', 'not_attending', 'tentative']);
            $table->unsignedTinyInteger('pax_count')->default(1);
            $table->text('message')->nullable()->comment('Ucapan selamat dan doa restu');
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->boolean('is_hidden')->default(false)->comment('Moderation flag for inappropriate greetings');
            $table->timestamps();

            $table->index(['invitation_id', 'attendance_status'], 'idx_rsvps_invitation_status');
            $table->index(['invitation_id', 'is_hidden', 'id'], 'idx_rsvps_public_feed');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tr_rsvps');
    }
};
