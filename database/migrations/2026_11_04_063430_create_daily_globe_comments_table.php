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
        Schema::create('daily_globe_comments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('daily_globe_article_id')->constrained('daily_globe_articles')->cascadeOnDelete();
            $table->string('author');
            $table->string('region')->default('San Andreas');
            $table->string('role_badge')->nullable();
            $table->text('text');
            $table->string('published_time')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('daily_globe_comments');
    }
};
