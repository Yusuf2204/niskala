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
        Schema::create('tr_guests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('invitation_id')->constrained('tr_invitations')->cascadeOnDelete();
            $table->string('name', 150);
            $table->string('slug_token', 64)->nullable()->comment('Unique token for personalized link tracking');
            $table->string('phone_number', 30)->nullable();
            $table->string('category', 50)->default('General')->comment('VIP, Family, Colleague, Friend, General');
            $table->unsignedTinyInteger('pax_allocated')->default(1)->comment('Number of seats reserved for this guest');
            $table->timestamps();

            $table->index('invitation_id', 'idx_guests_invitation');
            $table->unique('slug_token', 'uq_guests_token');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tr_guests');
    }
};
