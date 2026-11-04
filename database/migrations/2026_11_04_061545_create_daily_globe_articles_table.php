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
        Schema::create('daily_globe_articles', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('short_title')->nullable();
            $table->string('slug')->unique();
            $table->text('subtitle')->nullable();
            $table->text('excerpt');
            $table->longText('content')->nullable();
            $table->json('content_blocks')->nullable();
            $table->json('layout_settings')->nullable();
            $table->string('category')->default('investigasi');
            $table->string('category_label')->default('Investigasi Khusus');
            $table->string('badge')->nullable();
            $table->string('location')->nullable();
            $table->string('author')->default('Redaksi The Daily Globes');
            $table->string('author_role')->nullable();
            $table->string('published_date')->nullable();
            $table->string('published_time')->nullable();
            $table->string('read_time')->default('4 Menit Baca');
            $table->unsignedInteger('views_count')->default(120);
            $table->text('image')->nullable();
            $table->text('image_caption')->nullable();
            $table->text('secondary_image')->nullable();
            $table->text('secondary_caption')->nullable();
            $table->text('quote')->nullable();
            $table->string('quote_author')->nullable();
            $table->json('metrics')->nullable();
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_published')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('daily_globe_articles');
    }
};
