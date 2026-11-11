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
        Schema::table('tr_invitations', function (Blueprint $table) {
            $table->dropForeign(['theme_id']);
            $table->foreignId('theme_id')->nullable()->change()->constrained('ms_themes')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tr_invitations', function (Blueprint $table) {
            $table->dropForeign(['theme_id']);
            $table->foreignId('theme_id')->nullable(false)->change()->constrained('ms_themes')->restrictOnDelete();
        });
    }
};

