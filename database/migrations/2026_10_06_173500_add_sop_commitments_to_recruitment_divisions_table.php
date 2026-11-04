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
        Schema::table('recruitment_divisions', function (Blueprint $table) {
            $table->json('sop_commitments')->nullable()->after('custom_questions');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('recruitment_divisions', function (Blueprint $table) {
            $table->dropColumn('sop_commitments');
        });
    }
};
