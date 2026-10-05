<?php

namespace App\Models;

use Carbon\Carbon;
use Database\Factories\VehicleRentalFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'vehicle_id',
    'admin_id',
    'contract_number',
    'mou_code',
    'renter_name',
    'san_andreas_id_card',
    'contact_phone',
    'san_andreas_phone',
    'licenses',
    'rental_type',
    'duration',
    'rate_per_unit',
    'rental_price',
    'start_time',
    'expected_return_time',
    'actual_return_time',
    'status',
    'late_duration_hours',
    'late_penalty_fee',
    'vehicle_condition',
    'truck_health',
    'initial_health',
    'return_health',
    'damage_fee',
    'damage_fee_type',
    'total_cost',
    'notes',
    'return_notes',
])]
class VehicleRental extends Model
{
    /** @use HasFactory<VehicleRentalFactory> */
    use HasFactory;

    protected static function booted(): void
    {
        static::created(function (VehicleRental $rental) {
            if (empty($rental->contract_number) || empty($rental->mou_code)) {
                $year = date('Y', strtotime($rental->created_at ?? now()));
                $rental->contract_number = $rental->contract_number ?: sprintf('MTR/MOU/TRK/%s/%04d', $year, $rental->id);
                $rental->mou_code = $rental->mou_code ?: sprintf('MTR-MOU-%s-%04d', $year, $rental->id);
                $rental->saveQuietly();
            }
        });
    }

    public const STATUS_ACTIVE = 'active';

    public const STATUS_COMPLETED = 'completed';

    public const STATUS_CANCELLED = 'cancelled';

    public const TYPE_HOUR = 'jam';

    public const TYPE_DAY = 'hari';

    public const TYPE_TRIP = 'trip';

    public const CONDITION_NORMAL = 'normal';

    public const CONDITION_LIGHT_DAMAGE = 'rusak_ringan';

    public const CONDITION_HEAVY_DAMAGE = 'rusak_berat';

    public const CONDITION_DESTROYED = 'hancur_meledak';

    public const DAMAGE_TYPE_NONE = 'none';

    public const DAMAGE_TYPE_MECHANIC = 'mechanic';

    public const DAMAGE_TYPE_INSURANCE = 'insurance';

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'licenses' => 'array',
            'duration' => 'integer',
            'truck_health' => 'integer',
            'initial_health' => 'integer',
            'return_health' => 'integer',
            'rate_per_unit' => 'decimal:2',
            'rental_price' => 'decimal:2',
            'late_penalty_fee' => 'decimal:2',
            'damage_fee' => 'decimal:2',
            'total_cost' => 'decimal:2',
            'late_duration_hours' => 'decimal:2',
            'start_time' => 'datetime',
            'expected_return_time' => 'datetime',
            'actual_return_time' => 'datetime',
        ];
    }

    /**
     * The vehicle that is rented.
     */
    public function vehicle(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class);
    }

    /**
     * The admin user who processed this rental.
     */
    public function admin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'admin_id');
    }

    /**
     * Determine if this active rental has passed its expected return time.
     */
    public function isOverdue(?Carbon $checkTime = null): bool
    {
        if ($this->status !== self::STATUS_ACTIVE) {
            return false;
        }

        $now = $checkTime ?? now();

        return $now->isAfter($this->expected_return_time);
    }

    /**
     * Get the official invoice number.
     */
    public function getInvoiceNumber(): string
    {
        $year = $this->created_at ? $this->created_at->format('Y') : date('Y');

        return sprintf('MTR/INV/TRK/%s/%04d', $year, $this->id);
    }

    /**
     * Get the URL-friendly invoice code.
     */
    public function getInvoiceCode(): string
    {
        $year = $this->created_at ? $this->created_at->format('Y') : date('Y');

        return sprintf('MTR-INV-%s-%04d', $year, $this->id);
    }
}
