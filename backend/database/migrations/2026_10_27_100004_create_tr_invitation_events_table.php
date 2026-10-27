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
        Schema::create('tr_invitation_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('invitation_id')->constrained('tr_invitations')->cascadeOnDelete();
            $table->string('event_title', 150)->comment('e.g. Akad Nikah, Resepsi, Pemberkatan');
            $table->date('event_date');
            $table->time('start_time');
            $table->time('end_time')->nullable();
            $table->string('time_zone', 50)->default('WIB');
            $table->string('location_name', 255);
            $table->text('address');
            $table->text('google_maps_url')->nullable();
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->timestamps();

            $table->index(['invitation_id', 'event_date'], 'idx_events_invitation_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tr_invitation_events');
    }
};

