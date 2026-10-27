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
        Schema::create('ms_music', function (Blueprint $table) {
            $table->id();
            $table->string('title', 150);
            $table->string('artist', 100)->nullable();
            $table->string('file_path', 255);
            $table->string('category', 50)->default('wedding');
            $table->unsignedInteger('duration_seconds')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index('is_active');
            $table->index('category');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ms_music');
    }
};
