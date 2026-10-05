<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\VehicleRental;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FinanceController extends Controller
{
    /**
     * Display the financial overview, income breakdown, and invoice records.
     */
    public function index(Request $request): Response
    {
        $search = $request->query('search');
        $status = $request->query('status', 'all');
        $fineType = $request->query('fine_type', 'all');
        $period = $request->query('period', 'all');

        // Base query for all completed transactions for KPI metrics
        $completedRentals = VehicleRental::where('status', VehicleRental::STATUS_COMPLETED)->get();
        $activeRentals = VehicleRental::where('status', VehicleRental::STATUS_ACTIVE)->get();

        $totalGrossRevenue = (float) $completedRentals->sum('total_cost');
        $totalBaseRental = (float) $completedRentals->sum('rental_price');
        $totalLateFines = (float) $completedRentals->sum('late_penalty_fee');
        $totalDamageFines = (float) $completedRentals->sum('damage_fee');
        $mechanicFines = (float) $completedRentals->where('damage_fee_type', VehicleRental::DAMAGE_TYPE_MECHANIC)->sum('damage_fee');
        $insuranceFines = (float) $completedRentals->where('damage_fee_type', VehicleRental::DAMAGE_TYPE_INSURANCE)->sum('damage_fee');
        $netProfit = $totalBaseRental + $totalLateFines; // Pure company operational profit
        $activePotential = (float) $activeRentals->sum('rental_price');

        $stats = [
            'total_gross_revenue' => $totalGrossRevenue,
            'net_profit' => $netProfit,
            'total_base_rental' => $totalBaseRental,
            'total_late_fines' => $totalLateFines,
            'total_damage_fines' => $totalDamageFines,
            'mechanic_fines' => $mechanicFines,
            'insurance_fines' => $insuranceFines,
            'active_potential' => $activePotential,
            'completed_count' => $completedRentals->count(),
            'active_count' => $activeRentals->count(),
            'total_transactions' => VehicleRental::count(),
        ];

        // Filterable query for table
        $query = VehicleRental::with(['vehicle.category', 'admin'])->orderBy('id', 'desc');

        if (! empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('renter_name', 'like', "%{$search}%")
                    ->orWhere('san_andreas_phone', 'like', "%{$search}%")
                    ->orWhere('contact_phone', 'like', "%{$search}%")
                    ->orWhere('contract_number', 'like', "%{$search}%")
                    ->orWhere('mou_code', 'like', "%{$search}%")
                    ->orWhereHas('vehicle', function ($vq) use ($search) {
                        $vq->where('name', 'like', "%{$search}%")
                            ->orWhere('plate_number', 'like', "%{$search}%");
                    })
                    ->orWhereHas('admin', function ($aq) use ($search) {
                        $aq->where('name', 'like', "%{$search}%");
                    });
            });
        }

        if ($status === 'completed') {
            $query->where('status', VehicleRental::STATUS_COMPLETED);
        } elseif ($status === 'active') {
            $query->where('status', VehicleRental::STATUS_ACTIVE);
        }

        if ($fineType === 'with_late') {
            $query->where('late_penalty_fee', '>', 0);
        } elseif ($fineType === 'with_damage') {
            $query->where('damage_fee', '>', 0);
        } elseif ($fineType === 'mechanic') {
            $query->where('damage_fee_type', VehicleRental::DAMAGE_TYPE_MECHANIC);
        } elseif ($fineType === 'insurance') {
            $query->where('damage_fee_type', VehicleRental::DAMAGE_TYPE_INSURANCE);
        } elseif ($fineType === 'clean') {
            $query->where('late_penalty_fee', '<=', 0)->where('damage_fee', '<=', 0);
        }

        if ($period === 'today') {
            $query->whereDate('created_at', today());
        } elseif ($period === 'this_month') {
            $query->whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year);
        }

        $rentals = $query->get()->map(function (VehicleRental $r) {
            return [
                'id' => $r->id,
                'invoice_number' => $r->getInvoiceNumber(),
                'invoice_code' => $r->getInvoiceCode(),
                'contract_number' => $r->contract_number ?: sprintf('MTR/MOU/TRK/%s/%04d', $r->created_at?->format('Y') ?? date('Y'), $r->id),
                'mou_code' => $r->mou_code ?: sprintf('MTR-MOU-%s-%04d', $r->created_at?->format('Y') ?? date('Y'), $r->id),
                'renter_name' => $r->renter_name,
                'san_andreas_id_card' => $r->san_andreas_id_card ?: $r->san_andreas_phone,
                'contact_phone' => $r->contact_phone ?: $r->san_andreas_phone,
                'licenses' => $r->licenses ?? [],
                'rental_type' => $r->rental_type,
                'duration' => $r->duration,
                'rate_per_unit' => (float) $r->rate_per_unit,
                'rental_price' => (float) $r->rental_price,
                'late_duration_hours' => (float) $r->late_duration_hours,
                'late_penalty_fee' => (float) $r->late_penalty_fee,
                'damage_fee' => (float) $r->damage_fee,
                'damage_fee_type' => $r->damage_fee_type,
                'total_cost' => (float) $r->total_cost,
                'vehicle_condition' => $r->vehicle_condition,
                'initial_health' => (int) ($r->initial_health ?: 2000),
                'return_health' => $r->return_health !== null ? (int) $r->return_health : (int) $r->truck_health,
                'status' => $r->status,
                'is_overdue' => $r->isOverdue(),
                'created_at' => $r->created_at?->format('d M Y, H:i'),
                'start_time' => $r->start_time->format('d M Y, H:i'),
                'expected_return_time' => $r->expected_return_time->format('d M Y, H:i'),
                'actual_return_time' => $r->actual_return_time?->format('d M Y, H:i'),
                'notes' => $r->notes,
                'return_notes' => $r->return_notes,
                'vehicle' => $r->vehicle ? [
                    'id' => $r->vehicle->id,
                    'name' => $r->vehicle->name,
                    'plate_number' => $r->vehicle->plate_number,
                    'category' => $r->vehicle->category?->name,
                ] : null,
                'admin' => $r->admin ? [
                    'id' => $r->admin->id,
                    'name' => $r->admin->name,
                    'position' => $r->admin->getPositionTitle(),
                    'role' => $r->admin->role,
                ] : null,
                'invoice_url' => route('rentals.invoice', $r->getInvoiceCode()),
                'mou_url' => route('rentals.mou', $r->mou_code ?: $r->id),
            ];
        });

        return Inertia::render('Admin/Finance/Index', [
            'stats' => $stats,
            'rentals' => $rentals,
            'filters' => [
                'search' => $search ?? '',
                'status' => $status,
                'fine_type' => $fineType,
                'period' => $period,
            ],
        ]);
    }

    public function publicInvoice(string $code): Response
    {
        $id = is_numeric($code) ? (int) $code : 0;
        if ($id === 0 && preg_match('/(?:INV|MOU).*?(\d+)$/i', $code, $matches)) {
            $id = (int) $matches[1];
        }

        $rental = VehicleRental::with(['vehicle.category', 'admin'])
            ->where('id', $id)
            ->orWhere('mou_code', $code)
            ->orWhere('contract_number', $code)
            ->firstOrFail();

        $adminUser = $rental->admin;
        $adminPosition = $adminUser?->getPositionTitle() ?? 'Chief Executive Officer';

        return Inertia::render('Public/RentalInvoice', [
            'invoice' => [
                'id' => $rental->id,
                'invoice_number' => $rental->getInvoiceNumber(),
                'invoice_code' => $rental->getInvoiceCode(),
                'contract_number' => $rental->contract_number ?: sprintf('MTR/MOU/TRK/%s/%04d', $rental->created_at?->format('Y') ?? date('Y'), $rental->id),
                'mou_code' => $rental->mou_code ?: sprintf('MTR-MOU-%s-%04d', $rental->created_at?->format('Y') ?? date('Y'), $rental->id),
                'status' => $rental->status,
                'renter_name' => $rental->renter_name,
                'san_andreas_id_card' => $rental->san_andreas_id_card ?: '-',
                'contact_phone' => $rental->contact_phone ?: $rental->san_andreas_phone,
                'rental_type' => $rental->rental_type,
                'duration' => $rental->duration,
                'rate_per_unit' => (float) $rental->rate_per_unit,
                'rental_price' => (float) $rental->rental_price,
                'start_time' => $rental->start_time->translatedFormat('d F Y, H:i'),
                'expected_return_time' => $rental->expected_return_time->translatedFormat('d F Y, H:i'),
                'actual_return_time' => $rental->actual_return_time?->translatedFormat('d F Y, H:i'),
                'payment_date' => ($rental->actual_return_time ?? $rental->updated_at ?? now())->translatedFormat('d F Y, H:i'),
                'late_duration_hours' => (float) $rental->late_duration_hours,
                'late_penalty_fee' => (float) $rental->late_penalty_fee,
                'vehicle_condition' => $rental->vehicle_condition,
                'initial_health' => (int) ($rental->initial_health ?: 2000),
                'return_health' => $rental->return_health !== null ? (int) $rental->return_health : (int) $rental->truck_health,
                'damage_fee' => (float) $rental->damage_fee,
                'damage_fee_type' => $rental->damage_fee_type,
                'total_cost' => (float) $rental->total_cost,
                'notes' => $rental->notes,
                'return_notes' => $rental->return_notes,
                'vehicle' => $rental->vehicle ? [
                    'id' => $rental->vehicle->id,
                    'name' => $rental->vehicle->name,
                    'plate_number' => $rental->vehicle->plate_number,
                    'category' => $rental->vehicle->category?->name,
                ] : null,
                'admin' => $adminUser ? [
                    'id' => $adminUser->id,
                    'name' => $adminUser->name,
                    'position' => $adminPosition,
                    'role' => $adminUser->role,
                ] : null,
                'company' => [
                    'name' => 'Maitri Company',
                    'hq_address' => 'Maitri HQ Verona Beach No 12 Los Santos, San Andreas',
                    'city' => 'Los Santos, San Andreas',
                    'division' => 'Divisi Logistik & Armada Niaga',
                ],
            ],
        ]);
    }
}
