<?php

namespace App\Http\Controllers;

use App\Models\VehicleCategory;
use App\Models\VehicleRental;
use Inertia\Inertia;
use Inertia\Response;

class VehicleRentalMouController extends Controller
{
    /**
     * Display the official public MoU contract for a vehicle rental.
     */
    public function show(string $code): Response
    {
        $rental = VehicleRental::with(['vehicle.category', 'admin'])
            ->where('mou_code', $code)
            ->orWhere('contract_number', $code)
            ->orWhere('id', is_numeric($code) ? (int) $code : 0)
            ->firstOrFail();

        $vehicleCategories = VehicleCategory::orderBy('name', 'asc')->get()->map(function ($cat) {
            return [
                'id' => $cat->id,
                'name' => $cat->name,
                'description' => $cat->description,
                'rental_price_per_hour' => $cat->rental_price_per_hour !== null ? (float) $cat->rental_price_per_hour : null,
                'rental_price_per_day' => $cat->rental_price_per_day !== null ? (float) $cat->rental_price_per_day : null,
                'rental_price_per_trip' => $cat->rental_price_per_trip !== null ? (float) $cat->rental_price_per_trip : null,
                'icon' => $cat->icon,
            ];
        });

        $adminUser = $rental->admin;
        $adminRoleTitle = $adminUser?->getPositionTitle() ?? 'Chief Executive Officer';

        return Inertia::render('Public/RentalMou', [
            'rental' => [
                'id' => $rental->id,
                'contract_number' => $rental->contract_number ?: sprintf('MTR/MOU/TRK/%s/%04d', $rental->created_at->format('Y'), $rental->id),
                'mou_code' => $rental->mou_code ?: sprintf('MTR-MOU-%s-%04d', $rental->created_at->format('Y'), $rental->id),
                'status' => $rental->status,
                'renter_name' => $rental->renter_name,
                'san_andreas_id_card' => $rental->san_andreas_id_card ?: '-',
                'contact_phone' => $rental->contact_phone ?: $rental->san_andreas_phone,
                'licenses' => $rental->licenses ?? [],
                'rental_type' => $rental->rental_type,
                'duration' => $rental->duration,
                'rate_per_unit' => (float) $rental->rate_per_unit,
                'rental_price' => (float) $rental->rental_price,
                'start_time' => $rental->start_time->translatedFormat('d F Y, H:i'),
                'expected_return_time' => $rental->expected_return_time->translatedFormat('d F Y, H:i'),
                'actual_return_time' => $rental->actual_return_time?->translatedFormat('d F Y, H:i'),
                'truck_health' => (int) $rental->truck_health,
                'initial_health' => (int) ($rental->initial_health ?: 2000),
                'return_health' => $rental->return_health !== null ? (int) $rental->return_health : null,
                'vehicle_condition' => $rental->vehicle_condition,
                'damage_fee' => (float) $rental->damage_fee,
                'late_penalty_fee' => (float) $rental->late_penalty_fee,
                'total_cost' => (float) $rental->total_cost,
                'notes' => $rental->notes,
                'return_notes' => $rental->return_notes,
                'created_at_date' => $rental->created_at->translatedFormat('d F Y'),
                'vehicle' => $rental->vehicle ? [
                    'id' => $rental->vehicle->id,
                    'name' => $rental->vehicle->name,
                    'plate_number' => $rental->vehicle->plate_number,
                    'capacity' => $rental->vehicle->capacity,
                    'year' => $rental->vehicle->year,
                    'category' => $rental->vehicle->category ? [
                        'name' => $rental->vehicle->category->name,
                    ] : null,
                ] : null,
                'admin' => [
                    'name' => $adminUser?->name ?? 'Lucian Castellano',
                    'email' => $adminUser?->email ?? 'admin@maitri.com',
                    'position' => $adminRoleTitle,
                    'title' => $adminRoleTitle,
                    'company' => 'Maitri Company',
                    'contact' => 'Maitri HQ Verona Beach No 12 Los Santos, San Andreas',
                ],
            ],
            'categories' => $vehicleCategories,
        ]);
    }
}
