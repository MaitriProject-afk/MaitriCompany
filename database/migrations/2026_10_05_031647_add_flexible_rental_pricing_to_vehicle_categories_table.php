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
        Schema::table('vehicle_categories', function (Blueprint $table) {
            if (! Schema::hasColumn('vehicle_categories', 'rental_price_per_hour')) {
                $table->decimal('rental_price_per_hour', 15, 2)->nullable()->after('description');
            }
            if (! Schema::hasColumn('vehicle_categories', 'rental_price_per_trip')) {
                $table->decimal('rental_price_per_trip', 15, 2)->nullable()->after('rental_price_per_day');
            }
        });

        // Ensure rental_price_per_day is nullable if already present
        if (Schema::hasColumn('vehicle_categories', 'rental_price_per_day')) {
            Schema::table('vehicle_categories', function (Blueprint $table) {
                $table->decimal('rental_price_per_day', 15, 2)->nullable()->change();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('vehicle_categories', function (Blueprint $table) {
            if (Schema::hasColumn('vehicle_categories', 'rental_price_per_hour')) {
                $table->dropColumn('rental_price_per_hour');
            }
            if (Schema::hasColumn('vehicle_categories', 'rental_price_per_trip')) {
                $table->dropColumn('rental_price_per_trip');
            }
        });
    }
};
