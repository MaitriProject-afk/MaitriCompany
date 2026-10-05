<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

#[Fillable(['vehicle_category_id', 'name', 'plate_number', 'capacity', 'status', 'year', 'notes'])]
class Vehicle extends Model
{
    use HasFactory;

    /**
     * Vehicle status constants
     */
    public const STATUS_AVAILABLE = 'tersedia';

    public const STATUS_RENTED = 'disewa';

    public const STATUS_MAINTENANCE = 'perawatan';

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'year' => 'integer',
        ];
    }

    /**
     * Get the category that this vehicle belongs to.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(VehicleCategory::class, 'vehicle_category_id');
    }

    /**
     * The users (drivers, operators, PIC) assigned to this vehicle.
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'vehicle_user')
            ->withPivot('role_note')
            ->withTimestamps();
    }

    /**
     * All rental records for this vehicle.
     */
    public function rentals(): HasMany
    {
        return $this->hasMany(VehicleRental::class);
    }

    /**
     * The currently active rental record.
     */
    public function activeRental(): HasOne
    {
        return $this->hasOne(VehicleRental::class)->where('status', VehicleRental::STATUS_ACTIVE)->latestOfMany();
    }
}
