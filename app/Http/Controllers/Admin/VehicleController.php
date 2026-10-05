<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Vehicle;
use App\Models\VehicleCategory;
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
                    'rental_price_per_day' => (float) $v->category->rental_price_per_day,
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
                'rental_price_per_day' => (float) $c->rental_price_per_day,
                'icon' => $c->icon,
                'vehicles_count' => $c->vehicles_count,
            ];
        });

        $availableUsers = User::orderBy('name', 'asc')->get(['id', 'name', 'email', 'role']);

        $stats = [
            'total' => Vehicle::count(),
            'tersedia' => Vehicle::where('status', Vehicle::STATUS_AVAILABLE)->count(),
            'disewa' => Vehicle::where('status', Vehicle::STATUS_RENTED)->count(),
            'perawatan' => Vehicle::where('status', Vehicle::STATUS_MAINTENANCE)->count(),
            'total_categories' => VehicleCategory::count(),
        ];

        return Inertia::render('Admin/Vehicles/Index', [
            'vehicles' => $vehicles,
            'categories' => $categories,
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
}
