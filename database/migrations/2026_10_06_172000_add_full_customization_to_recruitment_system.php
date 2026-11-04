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
        Schema::table('recruitment_settings', function (Blueprint $table) {
            $table->json('form_sections')->nullable()->after('required_fields');
            $table->json('available_licenses')->nullable()->after('form_sections');
            $table->json('domicile_options')->nullable()->after('available_licenses');
            $table->json('experience_options')->nullable()->after('domicile_options');
            $table->json('shift_options')->nullable()->after('experience_options');
            $table->json('sop_commitments')->nullable()->after('shift_options');
            $table->json('ic_custom_questions')->nullable()->after('sop_commitments');
            $table->string('motivation_prompt')->nullable()->after('ic_custom_questions');
        });

        Schema::table('recruitment_divisions', function (Blueprint $table) {
            $table->json('required_licenses')->nullable()->after('qualifications');
            $table->json('custom_questions')->nullable()->after('required_licenses');
        });

        Schema::table('employee_applications', function (Blueprint $table) {
            $table->json('ic_answers')->nullable()->after('motivation');
            $table->json('sop_agreements')->nullable()->after('ooc_answers');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('recruitment_settings', function (Blueprint $table) {
            $table->dropColumn([
                'form_sections',
                'available_licenses',
                'domicile_options',
                'experience_options',
                'shift_options',
                'sop_commitments',
                'ic_custom_questions',
                'motivation_prompt',
            ]);
        });

        Schema::table('recruitment_divisions', function (Blueprint $table) {
            $table->dropColumn([
                'required_licenses',
                'custom_questions',
            ]);
        });

        Schema::table('employee_applications', function (Blueprint $table) {
            $table->dropColumn([
                'ic_answers',
                'sop_agreements',
            ]);
        });
    }
};
