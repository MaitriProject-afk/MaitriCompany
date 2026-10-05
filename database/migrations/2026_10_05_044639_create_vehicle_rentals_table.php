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
        Schema::create('vehicle_rentals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vehicle_id')->constrained('vehicles')->cascadeOnDelete();
            $table->foreignId('admin_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('renter_name');
            $table->string('san_andreas_phone');
            $table->json('licenses')->nullable();
            $table->string('rental_type'); // 'jam', 'hari', 'trip'
            $table->unsignedInteger('duration')->default(1);
            $table->decimal('rate_per_unit', 15, 2);
            $table->decimal('rental_price', 15, 2);
            $table->dateTime('start_time');
            $table->dateTime('expected_return_time');
            $table->dateTime('actual_return_time')->nullable();
            $table->string('status')->default('active'); // 'active', 'completed', 'cancelled'
            $table->decimal('late_duration_hours', 8, 2)->default(0);
            $table->decimal('late_penalty_fee', 15, 2)->default(0);
            $table->string('vehicle_condition')->default('normal'); // 'normal', 'rusak_ringan', 'rusak_berat', 'hancur_meledak'
            $table->unsignedTinyInteger('truck_health')->default(100); // 0 - 100
            $table->decimal('damage_fee', 15, 2)->default(0);
            $table->decimal('total_cost', 15, 2)->default(0);
            $table->text('notes')->nullable();
            $table->text('return_notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vehicle_rentals');
    }
};
