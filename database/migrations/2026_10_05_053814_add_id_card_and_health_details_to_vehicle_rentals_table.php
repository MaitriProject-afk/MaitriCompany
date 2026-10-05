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
        Schema::table('vehicle_rentals', function (Blueprint $table) {
            $table->string('san_andreas_id_card')->nullable()->after('renter_name');
            $table->string('contact_phone')->nullable()->after('san_andreas_id_card');
            $table->unsignedInteger('initial_health')->default(2000)->after('truck_health');
            $table->unsignedInteger('return_health')->nullable()->after('initial_health');
            $table->string('damage_fee_type')->default('none')->after('damage_fee'); // 'none', 'mechanic', 'insurance'
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('vehicle_rentals', function (Blueprint $table) {
            $table->dropColumn([
                'san_andreas_id_card',
                'contact_phone',
                'initial_health',
                'return_health',
                'damage_fee_type',
            ]);
        });
    }
};
