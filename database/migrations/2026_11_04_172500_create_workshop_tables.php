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
        Schema::create('workshop_settings', function (Blueprint $table) {
            $table->id();
            $table->string('workshop_name')->default('Maitri Automotive & Workshop HQ');
            $table->json('shifts')->nullable();
            $table->unsignedInteger('weekly_ssrp_quota')->default(3);
            $table->unsignedInteger('min_weekly_duty_days')->default(6);
            $table->unsignedInteger('duty_miss_penalty_points')->default(1);
            $table->unsignedInteger('ssrp_miss_penalty_points')->default(1);
            $table->unsignedInteger('max_warning_points')->default(3);
            $table->text('sop_notice')->nullable();
            $table->timestamps();
        });

        Schema::create('workshop_duty_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->date('duty_date');
            $table->string('shift_label');
            $table->string('shift_time')->nullable();
            $table->string('proof_image');
            $table->text('caption')->nullable();
            $table->string('status')->default('approved'); // approved, pending, rejected
            $table->string('admin_note')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'duty_date']);
        });

        Schema::create('workshop_ssrp_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->date('week_start_date');
            $table->date('submission_date');
            $table->string('title');
            $table->string('proof_image');
            $table->text('description')->nullable();
            $table->string('status')->default('approved'); // approved, pending, rejected
            $table->string('admin_note')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'week_start_date']);
        });

        Schema::create('workshop_leaves', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->date('start_date');
            $table->date('end_date');
            $table->string('leave_type')->default('izin'); // izin, sakit, cuti_ooc
            $table->text('reason');
            $table->string('proof_image')->nullable();
            $table->string('status')->default('approved'); // approved, pending, rejected
            $table->string('admin_note')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'start_date', 'end_date']);
        });

        Schema::create('workshop_warning_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('issued_by')->nullable()->constrained('users')->nullOnDelete();
            $table->unsignedInteger('points')->default(1);
            $table->string('category')->default('alpha_duty'); // alpha_duty, missed_ssrp, manual_violation
            $table->date('reference_date')->nullable();
            $table->string('reason');
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['user_id', 'is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('workshop_warning_logs');
        Schema::dropIfExists('workshop_leaves');
        Schema::dropIfExists('workshop_ssrp_logs');
        Schema::dropIfExists('workshop_duty_logs');
        Schema::dropIfExists('workshop_settings');
    }
};
