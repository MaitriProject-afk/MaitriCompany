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
        Schema::create('daily_globe_settings', function (Blueprint $table) {
            $table->id();
            $table->string('edition_date')->default('Selasa, 13 Oktober 2026');
            $table->json('edition_meta')->nullable();
            $table->json('breaking_news')->nullable();
            $table->json('weather_report')->nullable();
            $table->json('market_index')->nullable();
            $table->json('community_channels')->nullable();
            $table->json('categories')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('daily_globe_settings');
    }
};
