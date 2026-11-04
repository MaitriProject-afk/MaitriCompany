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
        if (! Schema::hasTable('radio_tracks')) {
            Schema::create('radio_tracks', function (Blueprint $table) {
                $table->id();
                $table->string('title');
                $table->string('artist')->nullable();
                $table->string('source_type', 20)->default('url'); // 'upload' | 'url'
                $table->string('audio_url', 1000);
                $table->unsignedInteger('duration_seconds')->default(180);
                $table->boolean('is_active')->default(true);
                $table->unsignedInteger('sort_order')->default(0);
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('radio_settings')) {
            Schema::create('radio_settings', function (Blueprint $table) {
                $table->id();
                $table->string('station_name')->default('The Daily Globes FM — 104.8 SAST');
                $table->string('station_tagline')->nullable();
                $table->string('stream_mode', 30)->default('playlist'); // 'playlist' | 'mic_live' | 'offline_static'
                $table->string('playlist_playback_mode', 30)->default('jockey_selected'); // 'jockey_selected' | 'sequential'
                $table->unsignedBigInteger('current_track_id')->nullable();
                $table->timestamp('playlist_started_at')->nullable();
                $table->string('dj_name')->nullable()->default('DJ Redaksi San Andreas');
                $table->string('on_air_title')->nullable()->default('Siaran Musik & Informasi San Andreas');
                $table->string('mic_stream_url', 1000)->nullable();
                $table->string('static_audio_url', 1000)->nullable();
                $table->boolean('is_public_player_enabled')->default(true);
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('radio_settings');
        Schema::dropIfExists('radio_tracks');
    }
};
