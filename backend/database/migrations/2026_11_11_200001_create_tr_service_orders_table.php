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
        Schema::create('tr_service_orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('invitation_id')->nullable()->constrained('tr_invitations')->nullOnDelete();
            $table->string('order_number', 50)->unique();
            $table->enum('service_type', ['full_creation', 'custom_styling', 'data_entry', 'review'])->default('full_creation');
            $table->enum('status', ['pending_review', 'in_progress', 'client_review', 'completed', 'cancelled'])->default('pending_review');
            $table->text('client_notes')->nullable()->comment('Catatan atau instruksi khusus dari pelanggan');
            $table->text('admin_notes')->nullable()->comment('Catatan internal tim admin');
            $table->foreignId('assigned_admin_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->index('status', 'idx_service_status');
            $table->index('user_id', 'idx_service_user');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tr_service_orders');
    }
};
