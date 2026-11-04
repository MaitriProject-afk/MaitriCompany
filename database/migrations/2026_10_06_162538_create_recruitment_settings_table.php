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
        Schema::create('recruitment_settings', function (Blueprint $table) {
            $table->id();
            $table->boolean('is_recruitment_open')->default(true);
            $table->json('required_fields')->nullable();
            $table->boolean('ooc_enabled')->default(true);
            $table->json('ooc_questions')->nullable();
            $table->text('instructions')->nullable();
            $table->string('contact_person')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('recruitment_settings');
    }
};
