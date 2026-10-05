<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\VehicleCategory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class VehicleCategoryController extends Controller
{
    /**
     * Store a newly created vehicle category with rental rate.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:vehicle_categories,name'],
            'rental_price_per_day' => ['required', 'numeric', 'min:0'],
            'description' => ['nullable', 'string', 'max:1000'],
            'icon' => ['nullable', 'string', 'max:50'],
        ]);

        $category = VehicleCategory::create([
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']),
            'rental_price_per_day' => $validated['rental_price_per_day'],
            'description' => $validated['description'] ?? null,
            'icon' => $validated['icon'] ?? 'local_shipping',
        ]);

        return back()->with('success', "Kategori kendaraan '{$category->name}' dengan tarif Rp ".number_format($category->rental_price_per_day, 0, ',', '.').'/hari berhasil ditambahkan.');
    }

    /**
     * Update the specified vehicle category and its rental rate.
     */
    public function update(Request $request, VehicleCategory $category): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('vehicle_categories', 'name')->ignore($category->id)],
            'rental_price_per_day' => ['required', 'numeric', 'min:0'],
            'description' => ['nullable', 'string', 'max:1000'],
            'icon' => ['nullable', 'string', 'max:50'],
        ]);

        $category->update([
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']),
            'rental_price_per_day' => $validated['rental_price_per_day'],
            'description' => $validated['description'] ?? null,
            'icon' => $validated['icon'] ?? $category->icon ?? 'local_shipping',
        ]);

        return back()->with('success', "Kategori kendaraan '{$category->name}' berhasil diperbarui dengan tarif Rp ".number_format($category->rental_price_per_day, 0, ',', '.').'/hari.');
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
