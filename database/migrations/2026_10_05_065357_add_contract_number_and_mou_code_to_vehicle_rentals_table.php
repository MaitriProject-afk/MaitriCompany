<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('vehicle_rentals', function (Blueprint $table) {
            $table->string('contract_number', 100)->nullable()->unique()->after('admin_id');
            $table->string('mou_code', 100)->nullable()->unique()->after('contract_number');
        });

        // Populate existing rentals if any
        $rentals = DB::table('vehicle_rentals')->get();
        foreach ($rentals as $rental) {
            $year = date('Y', strtotime($rental->created_at ?? now()));
            DB::table('vehicle_rentals')
                ->where('id', $rental->id)
                ->update([
                    'contract_number' => sprintf('MTR/MOU/TRK/%s/%04d', $year, $rental->id),
                    'mou_code' => sprintf('MTR-MOU-%s-%04d', $year, $rental->id),
                ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('vehicle_rentals', function (Blueprint $table) {
            $table->dropColumn(['contract_number', 'mou_code']);
        });
    }
};
