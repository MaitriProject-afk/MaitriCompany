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
        Schema::create('employee_applications', function (Blueprint $table) {
            $table->id();
            $table->string('ticket_number')->unique();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('recruitment_division_id')->nullable()->constrained('recruitment_divisions')->nullOnDelete();
            $table->string('position_title');
            $table->string('full_name');
            $table->string('email');
            $table->string('sa_phone');
            $table->string('sa_id_card');
            $table->integer('age')->nullable();
            $table->string('domicile')->nullable();
            $table->json('licenses')->nullable();
            $table->string('experience_level')->nullable();
            $table->string('shift')->nullable();
            $table->text('motivation')->nullable();
            $table->json('ooc_answers')->nullable();
            $table->string('status')->default('pending');
            $table->text('admin_notes')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('employee_applications');
    }
};
