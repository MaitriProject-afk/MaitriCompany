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
        Schema::table('users', function (Blueprint $table) {
            if (! Schema::hasColumn('users', 'workshop_shift_id')) {
                $table->string('workshop_shift_id')->nullable()->after('recruitment_division_id');
            }
        });

        Schema::table('workshop_duty_logs', function (Blueprint $table) {
            if (! Schema::hasColumn('workshop_duty_logs', 'on_duty_image')) {
                $table->string('on_duty_image')->nullable()->after('shift_time');
                $table->string('off_duty_image')->nullable()->after('on_duty_image');
                $table->timestamp('on_duty_at')->nullable()->after('off_duty_image');
                $table->timestamp('off_duty_at')->nullable()->after('on_duty_at');
            }
        });

        Schema::table('workshop_ssrp_logs', function (Blueprint $table) {
            if (! Schema::hasColumn('workshop_ssrp_logs', 'proof_images')) {
                $table->json('proof_images')->nullable()->after('proof_image');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('workshop_ssrp_logs', function (Blueprint $table) {
            $table->dropColumn('proof_images');
        });

        Schema::table('workshop_duty_logs', function (Blueprint $table) {
            $table->dropColumn(['on_duty_image', 'off_duty_image', 'on_duty_at', 'off_duty_at']);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('workshop_shift_id');
        });
    }
};
