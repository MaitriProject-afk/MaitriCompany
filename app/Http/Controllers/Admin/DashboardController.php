<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Vehicle;
use App\Models\VehicleRental;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the operational overview dashboard with real database statistics.
     */
    public function index(Request $request): Response
    {
        $hasTables = Schema::hasTable('vehicles') && Schema::hasTable('vehicle_rentals') && Schema::hasTable('users');

        if (! $hasTables) {
            return Inertia::render('Admin/Dashboard', [
                'stats' => [
                    'total_revenue' => 0,
                    'base_rental_revenue' => 0,
                    'late_fines' => 0,
                    'damage_fines' => 0,
                    'active_potential' => 0,
                    'completed_rentals_count' => 0,
                    'vehicles_total' => 0,
                    'vehicles_available' => 0,
                    'vehicles_rented' => 0,
                    'vehicles_maintenance' => 0,
                    'vehicles_utilization' => 0,
                    'rentals_total' => 0,
                    'rentals_active' => 0,
                    'rentals_completed' => 0,
                    'rentals_overdue' => 0,
                    'users_total' => 0,
                    'users_admin' => 0,
                    'users_staff' => 0,
                    'users_warga' => 0,
                ],
                'recentDispatches' => [],
                'recentLogs' => [],
            ]);
        }

        $now = now();

        // 1. Vehicle Unit Metrics
        $totalVehicles = Vehicle::count();
        $availableVehicles = Vehicle::where('status', Vehicle::STATUS_AVAILABLE)->count();
        $rentedVehicles = Vehicle::where('status', Vehicle::STATUS_RENTED)->count();
        $maintenanceVehicles = Vehicle::where('status', Vehicle::STATUS_MAINTENANCE)->count();
        $utilizationRate = $totalVehicles > 0 ? round(($rentedVehicles / $totalVehicles) * 100, 1) : 0;

        // 2. Rental Contracts Metrics
        $allRentals = VehicleRental::with([
            'vehicle.category',
            'admin:id,name,role,position',
        ])->orderBy('id', 'desc')->get();

        $completedRentals = $allRentals->where('status', VehicleRental::STATUS_COMPLETED);
        $activeRentals = $allRentals->where('status', VehicleRental::STATUS_ACTIVE);

        $overdueCount = 0;
        foreach ($activeRentals as $rental) {
            if ($now->isAfter($rental->expected_return_time)) {
                $overdueCount++;
            }
        }

        // 3. Real Revenue & Financial Statistics
        $totalGrossRevenue = (float) $completedRentals->sum('total_cost');
        $totalBaseRental = (float) $completedRentals->sum('rental_price');
        $totalLateFines = (float) $completedRentals->sum('late_penalty_fee');
        $totalDamageFines = (float) $completedRentals->sum('damage_fee');
        $activePotential = (float) $activeRentals->sum('rental_price');

        // 4. Users / Personnel Statistics
        $totalUsers = User::count();
        $adminCount = User::where('role', 'admin')->count();
        $staffCount = User::where('role', 'staff')->count();
        $wargaCount = User::where('role', 'warga')->count();

        // 5. Recent Dispatches / Rentals (actual real records)
        $recentDispatches = $allRentals->take(6)->map(function (VehicleRental $r) use ($now) {
            $isOverdue = $r->status === VehicleRental::STATUS_ACTIVE && $now->isAfter($r->expected_return_time);
            $overdueHours = $isOverdue ? round($r->expected_return_time->diffInMinutes($now) / 60, 1) : 0;
            $year = $r->created_at ? $r->created_at->format('Y') : date('Y');

            return [
                'id' => $r->id,
                'contract_number' => $r->contract_number ?: sprintf('MTR/MOU/TRK/%s/%04d', $year, $r->id),
                'mou_code' => $r->mou_code ?: sprintf('MTR-MOU-%s-%04d', $year, $r->id),
                'invoice_code' => $r->getInvoiceCode(),
                'renter_name' => $r->renter_name,
                'san_andreas_phone' => $r->san_andreas_phone,
                'contact_phone' => $r->contact_phone,
                'vehicle_name' => $r->vehicle?->name ?? 'Unit Dihapus',
                'plate_number' => $r->vehicle?->plate_number ?? '-',
                'category_name' => $r->vehicle?->category?->name ?? 'Armada',
                'category_icon' => $r->vehicle?->category?->icon ?? 'local_shipping',
                'rental_type' => $r->rental_type,
                'duration' => (int) $r->duration,
                'status' => $r->status,
                'is_overdue' => $isOverdue,
                'overdue_hours' => $overdueHours,
                'start_time' => $r->start_time->format('d M Y, H:i'),
                'expected_return_time' => $r->expected_return_time->format('d M Y, H:i'),
                'actual_return_time' => $r->actual_return_time?->format('d M Y, H:i'),
                'vehicle_condition' => $r->vehicle_condition,
                'truck_health' => (int) $r->truck_health,
                'total_cost' => (float) $r->total_cost,
                'rental_price' => (float) $r->rental_price,
                'late_penalty_fee' => (float) $r->late_penalty_fee,
                'damage_fee' => (float) $r->damage_fee,
                'admin_name' => $r->admin?->name ?? 'Admin',
            ];
        })->values();

        // 6. Recent Real System Logs / Activity Trail
        $recentLogs = [];

        // Return / Completion Logs from real database records
        foreach ($allRentals->take(5) as $r) {
            if ($r->status === VehicleRental::STATUS_COMPLETED) {
                $damageNote = $r->damage_fee > 0 ? ' • Denda Rusak: Rp '.number_format((float) $r->damage_fee, 0, ',', '.') : '';
                $lateNote = $r->late_penalty_fee > 0 ? ' • Denda Telat: Rp '.number_format((float) $r->late_penalty_fee, 0, ',', '.') : '';

                $recentLogs[] = [
                    'icon' => 'assignment_turned_in',
                    'iconBg' => 'bg-emerald-100 text-emerald-800',
                    'title' => "Pengembalian Selesai: {$r->vehicle?->name} ({$r->contract_number})",
                    'time' => $r->actual_return_time ? $r->actual_return_time->diffForHumans() : $r->updated_at->diffForHumans(),
                    'desc' => "Penyewa: {$r->renter_name} • Kondisi: {$r->vehicle_condition} ({$r->truck_health} HP) • Total Pembayaran: Rp ".number_format((float) $r->total_cost, 0, ',', '.')."{$lateNote}{$damageNote}.",
                ];
            } else {
                $recentLogs[] = [
                    'icon' => 'local_shipping',
                    'iconBg' => 'bg-blue-100 text-brand-800',
                    'title' => "Unit Sedang Disewa: {$r->vehicle?->name} ({$r->contract_number})",
                    'time' => $r->start_time->diffForHumans(),
                    'desc' => "Penyewa: {$r->renter_name} • Durasi: {$r->duration} {$r->rental_type} • Petugas: {$r->admin?->name}.",
                ];
            }
        }

        // Maintenance notes from vehicle records
        $vehiclesWithNotes = Vehicle::whereNotNull('notes')->where('notes', '!=', '')->take(2)->get();
        foreach ($vehiclesWithNotes as $veh) {
            $recentLogs[] = [
                'icon' => 'build',
                'iconBg' => 'bg-amber-100 text-amber-800',
                'title' => "Log Unit: {$veh->name} [{$veh->plate_number}]",
                'time' => $veh->updated_at->diffForHumans(),
                'desc' => $veh->notes,
            ];
        }

        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'total_revenue' => $totalGrossRevenue,
                'base_rental_revenue' => $totalBaseRental,
                'late_fines' => $totalLateFines,
                'damage_fines' => $totalDamageFines,
                'active_potential' => $activePotential,
                'completed_rentals_count' => $completedRentals->count(),
                'vehicles_total' => $totalVehicles,
                'vehicles_available' => $availableVehicles,
                'vehicles_rented' => $rentedVehicles,
                'vehicles_maintenance' => $maintenanceVehicles,
                'vehicles_utilization' => $utilizationRate,
                'rentals_total' => $allRentals->count(),
                'rentals_active' => $activeRentals->count(),
                'rentals_completed' => $completedRentals->count(),
                'rentals_overdue' => $overdueCount,
                'users_total' => $totalUsers,
                'users_admin' => $adminCount,
                'users_staff' => $staffCount,
                'users_warga' => $wargaCount,
            ],
            'recentDispatches' => $recentDispatches,
            'recentLogs' => array_slice($recentLogs, 0, 4),
        ]);
    }
}
