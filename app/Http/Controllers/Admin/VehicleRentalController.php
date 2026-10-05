<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Vehicle;
use App\Models\VehicleRental;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class VehicleRentalController extends Controller
{
    /**
     * Store a newly created vehicle rental.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'vehicle_id' => ['required', 'exists:vehicles,id'],
            'renter_name' => ['required', 'string', 'max:255'],
            'san_andreas_id_card' => ['required', 'string', 'max:50'],
            'contact_phone' => ['required', 'string', 'max:50'],
            'initial_health' => ['required', 'integer', 'min:1', 'max:10000'],
            'licenses' => ['nullable', 'array'],
            'licenses.*' => ['string', Rule::in(['driving', 'trucker', 'lumber'])],
            'rental_type' => ['required', 'string', Rule::in([VehicleRental::TYPE_HOUR, VehicleRental::TYPE_DAY, VehicleRental::TYPE_TRIP])],
            'duration' => ['required', 'integer', 'min:1', 'max:365'],
            'start_time' => ['required', 'date'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $vehicle = Vehicle::with('category')->findOrFail($validated['vehicle_id']);

        if ($vehicle->status !== Vehicle::STATUS_AVAILABLE) {
            throw ValidationException::withMessages([
                'vehicle_id' => "Unit armada '{$vehicle->name}' ({$vehicle->plate_number}) sedang berstatus {$vehicle->status} dan tidak dapat disewa saat ini.",
            ]);
        }

        $category = $vehicle->category;
        if (! $category) {
            throw ValidationException::withMessages([
                'vehicle_id' => 'Kendaraan ini belum terhubung dengan kategori armada.',
            ]);
        }

        $startTime = Carbon::parse($validated['start_time']);
        $duration = (int) $validated['duration'];
        $ratePerUnit = 0;
        $expectedReturnTime = null;

        if ($validated['rental_type'] === VehicleRental::TYPE_HOUR) {
            if ($category->rental_price_per_hour === null || (float) $category->rental_price_per_hour <= 0) {
                throw ValidationException::withMessages([
                    'rental_type' => "Kategori '{$category->name}' tidak mengaktifkan opsi tarif sewa per jam.",
                ]);
            }
            $ratePerUnit = (float) $category->rental_price_per_hour;
            $expectedReturnTime = (clone $startTime)->addHours($duration);
        } elseif ($validated['rental_type'] === VehicleRental::TYPE_DAY) {
            if ($category->rental_price_per_day === null || (float) $category->rental_price_per_day <= 0) {
                throw ValidationException::withMessages([
                    'rental_type' => "Kategori '{$category->name}' tidak mengaktifkan opsi tarif sewa per hari.",
                ]);
            }
            $ratePerUnit = (float) $category->rental_price_per_day;
            $expectedReturnTime = (clone $startTime)->addDays($duration);
        } elseif ($validated['rental_type'] === VehicleRental::TYPE_TRIP) {
            if ($category->rental_price_per_trip === null || (float) $category->rental_price_per_trip <= 0) {
                throw ValidationException::withMessages([
                    'rental_type' => "Kategori '{$category->name}' tidak mengaktifkan opsi tarif sewa per trip.",
                ]);
            }
            $ratePerUnit = (float) $category->rental_price_per_trip;
            $expectedReturnTime = (clone $startTime)->addHours($duration * 24);
        }

        $rentalPrice = $ratePerUnit * $duration;
        $initialHealth = (int) $validated['initial_health'];

        VehicleRental::create([
            'vehicle_id' => $vehicle->id,
            'admin_id' => $request->user()?->id,
            'renter_name' => $validated['renter_name'],
            'san_andreas_id_card' => $validated['san_andreas_id_card'],
            'contact_phone' => $validated['contact_phone'],
            'san_andreas_phone' => $validated['contact_phone'],
            'licenses' => $validated['licenses'] ?? [],
            'rental_type' => $validated['rental_type'],
            'duration' => $duration,
            'rate_per_unit' => $ratePerUnit,
            'rental_price' => $rentalPrice,
            'start_time' => $startTime,
            'expected_return_time' => $expectedReturnTime,
            'status' => VehicleRental::STATUS_ACTIVE,
            'late_duration_hours' => 0,
            'late_penalty_fee' => 0,
            'vehicle_condition' => VehicleRental::CONDITION_NORMAL,
            'truck_health' => $initialHealth,
            'initial_health' => $initialHealth,
            'return_health' => null,
            'damage_fee' => 0,
            'damage_fee_type' => VehicleRental::DAMAGE_TYPE_NONE,
            'total_cost' => $rentalPrice,
            'notes' => $validated['notes'] ?? null,
        ]);

        // Automatically update the vehicle's status to rented
        $vehicle->update([
            'status' => Vehicle::STATUS_RENTED,
        ]);

        return back()->with('success', "Unit armada '{$vehicle->name}' ({$vehicle->plate_number}) berhasil disewakan kepada {$validated['renter_name']}.");
    }

    /**
     * Process return of a rented vehicle with damage & late fees.
     */
    public function processReturn(Request $request, VehicleRental $rental): RedirectResponse
    {
        if ($rental->status !== VehicleRental::STATUS_ACTIVE) {
            return back()->with('error', 'Transaksi sewa ini sudah selesai atau tidak aktif.');
        }

        // Only the admin who issued the rental can confirm the return
        if ($rental->admin_id && $rental->admin_id !== $request->user()->id) {
            $issuerName = $rental->admin?->name ?? 'Admin yang menerbitkan sewa';

            return back()->with('error', "Akses Ditolak: Hanya petugas yang menerbitkan transaksi sewa ini ({$issuerName}) yang berhak mengonfirmasi pengembalian unit kendaraan.");
        }

        $validated = $request->validate([
            'actual_return_time' => ['required', 'date'],
            'vehicle_condition' => ['required', 'string', Rule::in([
                VehicleRental::CONDITION_NORMAL,
                VehicleRental::CONDITION_LIGHT_DAMAGE,
                VehicleRental::CONDITION_HEAVY_DAMAGE,
                VehicleRental::CONDITION_DESTROYED,
            ])],
            'return_health' => ['required', 'integer', 'min:0', 'max:10000'],
            'damage_fee_type' => ['required', 'string', Rule::in([
                VehicleRental::DAMAGE_TYPE_NONE,
                VehicleRental::DAMAGE_TYPE_MECHANIC,
                VehicleRental::DAMAGE_TYPE_INSURANCE,
            ])],
            'damage_fee' => ['nullable', 'numeric', 'min:0'],
            'late_penalty_fee' => ['nullable', 'numeric', 'min:0'],
            'return_notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $actualReturnTime = Carbon::parse($validated['actual_return_time']);
        $expectedReturnTime = $rental->expected_return_time;

        $lateDurationHours = 0;
        if ($actualReturnTime->isAfter($expectedReturnTime)) {
            $lateDurationHours = round($expectedReturnTime->diffInMinutes($actualReturnTime) / 60, 2);
        }

        $initialHealth = (int) ($rental->initial_health ?: 2000);
        $returnHealth = (int) $validated['return_health'];
        $healthLoss = $initialHealth - $returnHealth;
        $damageFee = isset($validated['damage_fee']) && $validated['damage_fee'] !== '' ? (float) $validated['damage_fee'] : 0;

        if ($returnHealth <= 0 || $validated['vehicle_condition'] === VehicleRental::CONDITION_DESTROYED) {
            if ($validated['damage_fee_type'] !== VehicleRental::DAMAGE_TYPE_INSURANCE) {
                throw ValidationException::withMessages([
                    'damage_fee_type' => 'Truk yang meledak atau hancur total (health 0) wajib memilih kategori Klaim Asuransi.',
                ]);
            }
            if ($damageFee <= 0) {
                throw ValidationException::withMessages([
                    'damage_fee' => 'Wajib mengisi jumlah biaya tebus / klaim asuransi untuk truk yang meledak.',
                ]);
            }
        } elseif ($healthLoss > 100) {
            if ($validated['damage_fee_type'] !== VehicleRental::DAMAGE_TYPE_MECHANIC) {
                throw ValidationException::withMessages([
                    'damage_fee_type' => "Penurunan health sebesar {$healthLoss} HP (> 100 HP) wajib memilih kategori Biaya Mechanic.",
                ]);
            }
            if ($damageFee <= 0) {
                throw ValidationException::withMessages([
                    'damage_fee' => 'Wajib mengisi nominal biaya perbaikan di mechanic karena penurunan health melebihi 100 HP.',
                ]);
            }
        } else {
            // Health loss <= 100: Bebas denda
            if ($validated['damage_fee_type'] !== VehicleRental::DAMAGE_TYPE_NONE) {
                throw ValidationException::withMessages([
                    'damage_fee_type' => "Penurunan health sebesar {$healthLoss} HP masih dalam batas toleransi wajar (≤ 100 HP) dan wajib Bebas Denda.",
                ]);
            }
            $damageFee = 0;
        }

        $latePenaltyFee = 0.0;
        if (isset($validated['late_penalty_fee']) && $validated['late_penalty_fee'] !== '') {
            $latePenaltyFee = (float) $validated['late_penalty_fee'];
        } elseif ($lateDurationHours > 0) {
            // Auto calculate late penalty if not explicitly specified
            if ($rental->rental_type === VehicleRental::TYPE_HOUR) {
                $latePenaltyFee = round($lateDurationHours * (float) $rental->rate_per_unit * 1.5, 2);
            } elseif ($rental->rental_type === VehicleRental::TYPE_DAY) {
                $lateDays = max(1, ceil($lateDurationHours / 24));
                $latePenaltyFee = round($lateDays * (float) $rental->rate_per_unit * 1.5, 2);
            }
        }

        $totalCost = (float) $rental->rental_price + $latePenaltyFee + $damageFee;

        $rental->update([
            'actual_return_time' => $actualReturnTime,
            'status' => VehicleRental::STATUS_COMPLETED,
            'vehicle_condition' => $validated['vehicle_condition'],
            'truck_health' => $returnHealth,
            'return_health' => $returnHealth,
            'damage_fee_type' => $validated['damage_fee_type'],
            'damage_fee' => $damageFee,
            'late_duration_hours' => $lateDurationHours,
            'late_penalty_fee' => $latePenaltyFee,
            'total_cost' => $totalCost,
            'return_notes' => $validated['return_notes'] ?? null,
        ]);

        // Determine new vehicle status based on return condition
        $vehicle = $rental->vehicle;
        if ($vehicle) {
            $newVehicleStatus = Vehicle::STATUS_AVAILABLE;

            if (
                in_array($validated['vehicle_condition'], [VehicleRental::CONDITION_HEAVY_DAMAGE, VehicleRental::CONDITION_DESTROYED], true)
                || $returnHealth < 1000
            ) {
                $newVehicleStatus = Vehicle::STATUS_MAINTENANCE;
            }

            $vehicleNotes = $vehicle->notes;
            if ($validated['vehicle_condition'] === VehicleRental::CONDITION_DESTROYED) {
                $vehicleNotes = trim(($vehicleNotes ? $vehicleNotes."\n" : '').'[INSIDEN] Unit hancur/meledak saat sewa oleh '.$rental->renter_name.' (Tgl: '.$actualReturnTime->format('d/m/Y H:i').', Klaim Asuransi: Rp '.number_format($damageFee, 0, ',', '.').')');
            }

            $vehicle->update([
                'status' => $newVehicleStatus,
                'notes' => $vehicleNotes,
            ]);
        }

        return back()->with('success', "Pengembalian unit armada '{$vehicle?->name}' berhasil diproses. Status unit kini telah diperbarui.");
    }
}
