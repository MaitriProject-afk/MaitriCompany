<?php

use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\VehicleCategoryController;
use App\Http\Controllers\Admin\VehicleController;
use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    $role = auth()->user()->role ?? 'warga';

    return match ($role) {
        'admin' => redirect()->route('admin.dashboard'),
        'staff' => redirect()->route('staff.dashboard'),
        default => redirect()->route('warga.dashboard'),
    };
})->middleware(['auth'])->name('dashboard');

// Protected Admin Routes
Route::middleware(['auth', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('Admin/Dashboard');
    })->name('dashboard');

    Route::get('/users', [UserController::class, 'index'])->name('users.index');
    Route::patch('/users/{user}/role', [UserController::class, 'updateRole'])->name('users.update-role');

    // Hauling Fleet & Vehicle Management
    Route::get('/vehicles', [VehicleController::class, 'index'])->name('vehicles.index');
    Route::post('/vehicles', [VehicleController::class, 'store'])->name('vehicles.store');
    Route::put('/vehicles/{vehicle}', [VehicleController::class, 'update'])->name('vehicles.update');
    Route::delete('/vehicles/{vehicle}', [VehicleController::class, 'destroy'])->name('vehicles.destroy');

    // Vehicle Category & Rental Pricing
    Route::post('/vehicle-categories', [VehicleCategoryController::class, 'store'])->name('vehicle-categories.store');
    Route::put('/vehicle-categories/{category}', [VehicleCategoryController::class, 'update'])->name('vehicle-categories.update');
    Route::delete('/vehicle-categories/{category}', [VehicleCategoryController::class, 'destroy'])->name('vehicle-categories.destroy');
});

// Protected Staff Routes
Route::middleware(['auth', 'role:staff'])->prefix('staff')->name('staff.')->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('Staff/Dashboard');
    })->name('dashboard');
});

// Protected Warga Routes
Route::middleware(['auth', 'role:warga'])->prefix('warga')->name('warga.')->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('Warga/Dashboard');
    })->name('dashboard');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
