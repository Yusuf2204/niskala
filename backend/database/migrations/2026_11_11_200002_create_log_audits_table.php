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
        Schema::create('log_audits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('action', 100)->comment('e.g. invitation.published, service_order.status_updated');
            $table->string('target_type', 100)->comment('e.g. App\\Models\\Invitation');
            $table->unsignedBigInteger('target_id');
            $table->json('details')->nullable()->comment('Snapshot metadata perubahan yang dilakukan');
            $table->string('ip_address', 45)->nullable();
            $table->timestamp('created_at')->nullable();

            $table->index(['action', 'target_type', 'target_id'], 'idx_audit_action_target');
            $table->index('created_at', 'idx_audit_created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('log_audits');
    }
};
