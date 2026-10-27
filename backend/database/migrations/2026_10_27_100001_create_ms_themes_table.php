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
        Schema::create('ms_themes', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->string('slug', 100)->unique();
            $table->enum('category', ['wedding', 'birthday', 'general'])->default('wedding');
            $table->text('description')->nullable();
            $table->string('thumbnail', 255)->nullable();
            $table->json('default_config')->nullable()->comment('Default palette, fonts, and section presets');
            $table->boolean('is_active')->default(true);
            $table->string('version', 20)->default('1.0.0');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ms_themes');
    }
};
