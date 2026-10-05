<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\VehicleCategory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class VehicleCategoryController extends Controller
{
    /**
     * Store a newly created vehicle category with flexible rental rate.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:vehicle_categories,name'],
            'rental_price_per_hour' => ['nullable', 'numeric', 'min:0'],
            'rental_price_per_day' => ['nullable', 'numeric', 'min:0'],
            'rental_price_per_trip' => ['nullable', 'numeric', 'min:0'],
            'description' => ['nullable', 'string', 'max:1000'],
            'icon' => ['nullable', 'string', 'max:50'],
        ]);

        if (empty($validated['rental_price_per_hour']) && empty($validated['rental_price_per_day']) && empty($validated['rental_price_per_trip'])) {
            throw ValidationException::withMessages([
                'rental_price_per_day' => 'Setidaknya tentukan salah satu tarif sewa (per jam, per hari, atau per trip).',
            ]);
        }

        $category = VehicleCategory::create([
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']),
            'rental_price_per_hour' => ! empty($validated['rental_price_per_hour']) ? $validated['rental_price_per_hour'] : null,
            'rental_price_per_day' => ! empty($validated['rental_price_per_day']) ? $validated['rental_price_per_day'] : null,
            'rental_price_per_trip' => ! empty($validated['rental_price_per_trip']) ? $validated['rental_price_per_trip'] : null,
            'description' => $validated['description'] ?? null,
            'icon' => $validated['icon'] ?? 'local_shipping',
        ]);

        return back()->with('success', "Kategori kendaraan '{$category->name}' berhasil ditambahkan.");
    }

    /**
     * Update the specified vehicle category and its rental rates.
     */
    public function update(Request $request, VehicleCategory $category): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('vehicle_categories', 'name')->ignore($category->id)],
            'rental_price_per_hour' => ['nullable', 'numeric', 'min:0'],
            'rental_price_per_day' => ['nullable', 'numeric', 'min:0'],
            'rental_price_per_trip' => ['nullable', 'numeric', 'min:0'],
            'description' => ['nullable', 'string', 'max:1000'],
            'icon' => ['nullable', 'string', 'max:50'],
        ]);

        if (empty($validated['rental_price_per_hour']) && empty($validated['rental_price_per_day']) && empty($validated['rental_price_per_trip'])) {
            throw ValidationException::withMessages([
                'rental_price_per_day' => 'Setidaknya tentukan salah satu tarif sewa (per jam, per hari, atau per trip).',
            ]);
        }

        $category->update([
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']),
            'rental_price_per_hour' => ! empty($validated['rental_price_per_hour']) ? $validated['rental_price_per_hour'] : null,
            'rental_price_per_day' => ! empty($validated['rental_price_per_day']) ? $validated['rental_price_per_day'] : null,
            'rental_price_per_trip' => ! empty($validated['rental_price_per_trip']) ? $validated['rental_price_per_trip'] : null,
            'description' => $validated['description'] ?? null,
            'icon' => $validated['icon'] ?? $category->icon ?? 'local_shipping',
        ]);

        return back()->with('success', "Kategori kendaraan '{$category->name}' dan struktur tarif sewanya berhasil diperbarui.");
    }

    /**
     * Remove the specified vehicle category.
     */
    public function destroy(VehicleCategory $category): RedirectResponse
    {
        $vehiclesCount = $category->vehicles()->count();

        if ($vehiclesCount > 0) {
            return back()->with('error', "Kategori '{$category->name}' tidak dapat dihapus karena masih menampung {$vehiclesCount} unit kendaraan aktif.");
        }

        $name = $category->name;
        $category->delete();

        return back()->with('success', "Kategori kendaraan '{$name}' berhasil dihapus.");
    }
}
