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
        Schema::create('recruitment_divisions', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('department');
            $table->string('icon')->default('local_shipping');
            $table->text('description');
            $table->json('qualifications')->nullable();
            $table->boolean('is_active')->default(true);
            $table->integer('quota')->nullable();
            $table->string('badge')->nullable();
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('recruitment_divisions');
    }
};
