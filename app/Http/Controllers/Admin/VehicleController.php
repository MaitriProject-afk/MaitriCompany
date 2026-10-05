<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Vehicle;
use App\Models\VehicleCategory;
use App\Models\VehicleRental;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class VehicleController extends Controller
{
    /**
     * Display a listing of hauling vehicles and category management.
     */
    public function index(Request $request): Response
    {
        $search = $request->input('search');
        $categoryId = $request->input('category_id');
        $status = $request->input('status');

        $query = Vehicle::query()->with([
            'category',
            'users' => function ($q) {
                $q->select('users.id', 'users.name', 'users.email', 'users.role');
            },
        ]);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('plate_number', 'like', "%{$search}%")
                    ->orWhere('capacity', 'like', "%{$search}%");
            });
        }

        if ($categoryId && $categoryId !== 'all') {
            $query->where('vehicle_category_id', $categoryId);
        }

        if ($status && $status !== 'all') {
            $query->where('status', $status);
        }

        $vehicles = $query->orderBy('id', 'desc')->get()->map(function (Vehicle $v) {
            return [
                'id' => $v->id,
                'name' => $v->name,
                'plate_number' => $v->plate_number,
                'capacity' => $v->capacity,
                'status' => $v->status,
                'year' => $v->year,
                'notes' => $v->notes,
                'category' => $v->category ? [
                    'id' => $v->category->id,
                    'name' => $v->category->name,
                    'slug' => $v->category->slug,
                    'rental_price_per_hour' => $v->category->rental_price_per_hour !== null ? (float) $v->category->rental_price_per_hour : null,
                    'rental_price_per_day' => $v->category->rental_price_per_day !== null ? (float) $v->category->rental_price_per_day : null,
                    'rental_price_per_trip' => $v->category->rental_price_per_trip !== null ? (float) $v->category->rental_price_per_trip : null,
                    'icon' => $v->category->icon,
                ] : null,
                'users' => $v->users->map(fn ($u) => [
                    'id' => $u->id,
                    'name' => $u->name,
                    'email' => $u->email,
                    'role' => $u->role,
                    'role_note' => $u->pivot->role_note,
                ]),
                'created_at' => $v->created_at?->format('d M Y'),
            ];
        });

        $categories = VehicleCategory::withCount('vehicles')->orderBy('id', 'asc')->get()->map(function (VehicleCategory $c) {
            return [
                'id' => $c->id,
                'name' => $c->name,
                'slug' => $c->slug,
                'description' => $c->description,
                'rental_price_per_hour' => $c->rental_price_per_hour !== null ? (float) $c->rental_price_per_hour : null,
                'rental_price_per_day' => $c->rental_price_per_day !== null ? (float) $c->rental_price_per_day : null,
                'rental_price_per_trip' => $c->rental_price_per_trip !== null ? (float) $c->rental_price_per_trip : null,
                'icon' => $c->icon,
                'vehicles_count' => $c->vehicles_count,
            ];
        });

        $availableUsers = User::orderBy('name', 'asc')->get(['id', 'name', 'email', 'role']);

        $now = now();

        $rentals = VehicleRental::with([
            'vehicle.category',
            'admin:id,name,email',
        ])->orderBy('id', 'desc')->get()->map(function (VehicleRental $r) use ($now) {
            $isOverdue = $r->status === VehicleRental::STATUS_ACTIVE && $now->isAfter($r->expected_return_time);
            $overdueHours = $isOverdue ? round($r->expected_return_time->diffInMinutes($now) / 60, 1) : 0;

            return [
                'id' => $r->id,
                'vehicle_id' => $r->vehicle_id,
                'vehicle' => $r->vehicle ? [
                    'id' => $r->vehicle->id,
                    'name' => $r->vehicle->name,
                    'plate_number' => $r->vehicle->plate_number,
                    'capacity' => $r->vehicle->capacity,
                    'category' => $r->vehicle->category ? [
                        'id' => $r->vehicle->category->id,
                        'name' => $r->vehicle->category->name,
                        'icon' => $r->vehicle->category->icon,
                    ] : null,
                ] : null,
                'renter_name' => $r->renter_name,
                'san_andreas_phone' => $r->san_andreas_phone,
                'licenses' => $r->licenses ?? [],
                'rental_type' => $r->rental_type,
                'duration' => $r->duration,
                'rate_per_unit' => (float) $r->rate_per_unit,
                'rental_price' => (float) $r->rental_price,
                'start_time' => $r->start_time->format('d M Y, H:i'),
                'start_time_iso' => $r->start_time->toIso8601String(),
                'expected_return_time' => $r->expected_return_time->format('d M Y, H:i'),
                'expected_return_time_iso' => $r->expected_return_time->toIso8601String(),
                'actual_return_time' => $r->actual_return_time?->format('d M Y, H:i'),
                'actual_return_time_iso' => $r->actual_return_time?->toIso8601String(),
                'status' => $r->status,
                'is_overdue' => $isOverdue,
                'overdue_hours' => $overdueHours,
                'late_duration_hours' => (float) $r->late_duration_hours,
                'late_penalty_fee' => (float) $r->late_penalty_fee,
                'vehicle_condition' => $r->vehicle_condition,
                'truck_health' => (int) $r->truck_health,
                'damage_fee' => (float) $r->damage_fee,
                'total_cost' => (float) $r->total_cost,
                'notes' => $r->notes,
                'return_notes' => $r->return_notes,
                'admin_name' => $r->admin?->name ?? 'Admin',
                'contract_number' => $r->contract_number ?: sprintf('MTR/MOU/TRK/%s/%04d', $r->created_at->format('Y'), $r->id),
                'mou_code' => $r->mou_code ?: sprintf('MTR-MOU-%s-%04d', $r->created_at->format('Y'), $r->id),
                'mou_url' => route('rentals.mou', $r->mou_code ?: $r->id),
                'created_at' => $r->created_at?->format('d M Y, H:i'),
            ];
        });

        $availableVehiclesForRent = Vehicle::with('category')
            ->where('status', Vehicle::STATUS_AVAILABLE)
            ->orderBy('name', 'asc')
            ->get()
            ->map(fn (Vehicle $v) => [
                'id' => $v->id,
                'name' => $v->name,
                'plate_number' => $v->plate_number,
                'capacity' => $v->capacity,
                'category' => $v->category ? [
                    'id' => $v->category->id,
                    'name' => $v->category->name,
                    'rental_price_per_hour' => $v->category->rental_price_per_hour !== null ? (float) $v->category->rental_price_per_hour : null,
                    'rental_price_per_day' => $v->category->rental_price_per_day !== null ? (float) $v->category->rental_price_per_day : null,
                    'rental_price_per_trip' => $v->category->rental_price_per_trip !== null ? (float) $v->category->rental_price_per_trip : null,
                    'icon' => $v->category->icon,
                ] : null,
            ]);

        $stats = [
            'total' => Vehicle::count(),
            'available' => Vehicle::where('status', Vehicle::STATUS_AVAILABLE)->count(),
            'tersedia' => Vehicle::where('status', Vehicle::STATUS_AVAILABLE)->count(),
            'rented' => Vehicle::where('status', Vehicle::STATUS_RENTED)->count(),
            'disewa' => Vehicle::where('status', Vehicle::STATUS_RENTED)->count(),
            'maintenance' => Vehicle::where('status', Vehicle::STATUS_MAINTENANCE)->count(),
            'perawatan' => Vehicle::where('status', Vehicle::STATUS_MAINTENANCE)->count(),
            'categories_count' => VehicleCategory::count(),
            'total_categories' => VehicleCategory::count(),
            'active_rentals' => VehicleRental::where('status', VehicleRental::STATUS_ACTIVE)->count(),
            'overdue_rentals' => VehicleRental::where('status', VehicleRental::STATUS_ACTIVE)
                ->where('expected_return_time', '<', $now)
                ->count(),
        ];

        return Inertia::render('Admin/Vehicles/Index', [
            'vehicles' => $vehicles,
            'categories' => $categories,
            'rentals' => $rentals,
            'availableVehiclesForRent' => $availableVehiclesForRent,
            'availableUsers' => $availableUsers,
            'stats' => $stats,
            'filters' => [
                'search' => $search ?? '',
                'category_id' => $categoryId ?? 'all',
                'status' => $status ?? 'all',
            ],
        ]);
    }

    /**
     * Store a newly created vehicle.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'plate_number' => ['required', 'string', 'max:50', 'unique:vehicles,plate_number'],
            'vehicle_category_id' => ['required', 'exists:vehicle_categories,id'],
            'capacity' => ['nullable', 'string', 'max:100'],
            'status' => ['required', 'string', Rule::in([Vehicle::STATUS_AVAILABLE, Vehicle::STATUS_RENTED, Vehicle::STATUS_MAINTENANCE])],
            'year' => ['nullable', 'integer', 'min:1990', 'max:'.(date('Y') + 1)],
            'notes' => ['nullable', 'string', 'max:1000'],
            'user_ids' => ['nullable', 'array'],
            'user_ids.*' => ['exists:users,id'],
        ]);

        $vehicle = Vehicle::create([
            'name' => $validated['name'],
            'plate_number' => strtoupper(trim($validated['plate_number'])),
            'vehicle_category_id' => $validated['vehicle_category_id'],
            'capacity' => $validated['capacity'] ?? null,
            'status' => $validated['status'],
            'year' => $validated['year'] ?? null,
            'notes' => $validated['notes'] ?? null,
        ]);

        if (! empty($validated['user_ids'])) {
            $vehicle->users()->sync($validated['user_ids']);
        }

        return back()->with('success', "Kendaraan hauling '{$vehicle->name}' ({$vehicle->plate_number}) berhasil ditambahkan ke armada.");
    }

    /**
     * Update the specified vehicle.
     */
    public function update(Request $request, Vehicle $vehicle): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'plate_number' => ['required', 'string', 'max:50', Rule::unique('vehicles', 'plate_number')->ignore($vehicle->id)],
            'vehicle_category_id' => ['required', 'exists:vehicle_categories,id'],
            'capacity' => ['nullable', 'string', 'max:100'],
            'status' => ['required', 'string', Rule::in([Vehicle::STATUS_AVAILABLE, Vehicle::STATUS_RENTED, Vehicle::STATUS_MAINTENANCE])],
            'year' => ['nullable', 'integer', 'min:1990', 'max:'.(date('Y') + 1)],
            'notes' => ['nullable', 'string', 'max:1000'],
            'user_ids' => ['nullable', 'array'],
            'user_ids.*' => ['exists:users,id'],
        ]);

        $vehicle->update([
            'name' => $validated['name'],
            'plate_number' => strtoupper(trim($validated['plate_number'])),
            'vehicle_category_id' => $validated['vehicle_category_id'],
            'capacity' => $validated['capacity'] ?? null,
            'status' => $validated['status'],
            'year' => $validated['year'] ?? null,
            'notes' => $validated['notes'] ?? null,
        ]);

        $vehicle->users()->sync($validated['user_ids'] ?? []);

        return back()->with('success', "Data unit '{$vehicle->name}' ({$vehicle->plate_number}) berhasil diperbarui.");
    }

    /**
     * Remove the specified vehicle.
     */
    public function destroy(Vehicle $vehicle): RedirectResponse
    {
        $name = $vehicle->name;
        $plate = $vehicle->plate_number;

        $vehicle->users()->detach();
        $vehicle->delete();

        return back()->with('success', "Unit kendaraan '{$name}' ({$plate}) berhasil dihapus dari armada.");
    }

    /**
     * Mark vehicle maintenance as completed and set status back to available.
     */
    public function completeMaintenance(Request $request, Vehicle $vehicle): RedirectResponse
    {
        $validated = $request->validate([
            'maintenance_notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $notes = $vehicle->notes;
        $timestamp = now()->translatedFormat('d/m/Y H:i');
        $adminName = auth()->user()?->name ?? 'Admin';

        $repairLog = "[SELESAI PERAWATAN] Unit telah selesai perbaikan/servis dan dinyatakan siap (tersedia kembali) pada {$timestamp} oleh {$adminName}.";
        if (! empty($validated['maintenance_notes'])) {
            $repairLog .= ' Catatan: '.$validated['maintenance_notes'];
        }

        $vehicle->update([
            'status' => Vehicle::STATUS_AVAILABLE,
            'notes' => trim(($notes ? $notes."\n" : '').$repairLog),
        ]);

        return back()->with('success', "Unit armada '{$vehicle->name}' ({$vehicle->plate_number}) telah selesai masa perbaikan/perawatan dan kini berstatus Tersedia (Ready) untuk disewakan kembali.");
    }
}
