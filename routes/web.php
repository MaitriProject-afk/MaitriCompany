<?php

use App\Http\Controllers\Admin\DailyGlobeAdminController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\FinanceController;
use App\Http\Controllers\Admin\RadioAdminController;
use App\Http\Controllers\Admin\RecruitmentController as AdminRecruitmentController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\VehicleCategoryController;
use App\Http\Controllers\Admin\VehicleController;
use App\Http\Controllers\Admin\VehicleRentalController;
use App\Http\Controllers\Admin\WorkshopAdminController;
use App\Http\Controllers\DailyGlobeController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RadioBroadcastController;
use App\Http\Controllers\Staff\WorkshopStaffController;
use App\Http\Controllers\VehicleRentalMouController;
use App\Http\Controllers\Warga\RecruitmentController as WargaRecruitmentController;
use App\Models\EmployeeApplication;
use App\Models\RecruitmentDivision;
use App\Models\RecruitmentSetting;
use App\Models\VehicleCategory;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;

Route::get('/', function () {
    $vehicleCategories = [];

    if (Schema::hasTable('vehicle_categories')) {
        $vehicleCategories = VehicleCategory::orderBy('id', 'asc')->get()->map(function ($cat) {
            return [
                'id' => $cat->id,
                'name' => $cat->name,
                'slug' => $cat->slug,
                'description' => $cat->description,
                'rental_price_per_hour' => $cat->rental_price_per_hour !== null ? (float) $cat->rental_price_per_hour : null,
                'rental_price_per_day' => $cat->rental_price_per_day !== null ? (float) $cat->rental_price_per_day : null,
                'rental_price_per_trip' => $cat->rental_price_per_trip !== null ? (float) $cat->rental_price_per_trip : null,
                'icon' => $cat->icon ?: 'local_shipping',
            ];
        });
    }

    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
        'vehicleCategories' => $vehicleCategories,
    ]);
});

// Public Official Truck Rental MoU Contract & Invoice Receipts
Route::get('/mou/{code}', [VehicleRentalMouController::class, 'show'])->name('rentals.mou');
Route::get('/invoice/{code}', [FinanceController::class, 'publicInvoice'])->name('rentals.invoice');

// The Daily Globes - Media Berita dan Informasi San Andreas (Public Portal & Future Subdomain)
Route::get('/daily-globe', [DailyGlobeController::class, 'index'])->name('dailyglobe.index');
Route::get('/daily-globe/berita/{slug}', [DailyGlobeController::class, 'show'])->name('dailyglobe.show');
Route::post('/daily-globe/berita/{slug}/comments', [DailyGlobeController::class, 'storeComment'])->name('dailyglobe.comments.store');
Route::get('/berita', fn () => redirect()->route('dailyglobe.index'));
Route::get('/news', fn () => redirect()->route('dailyglobe.index'));

// Public SA-MP Boombox Audio Stream & Live Status Endpoints (Zero-Overhead Shared Hosting Redirector)
Route::get('/radio/boombox.mp3', [RadioBroadcastController::class, 'boombox'])->name('radio.boombox');
Route::get('/radio/stream.mp3', [RadioBroadcastController::class, 'boombox'])->name('radio.stream');
Route::get('/radio/boombox.pls', [RadioBroadcastController::class, 'playlistPls'])->name('radio.pls');
Route::get('/radio/status', [RadioBroadcastController::class, 'status'])->name('radio.status');

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
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::get('/users', [UserController::class, 'index'])->name('users.index');
    Route::patch('/users/{user}/role', [UserController::class, 'updateRole'])->name('users.update-role');

    // Hauling Fleet & Vehicle Management
    Route::get('/vehicles', [VehicleController::class, 'index'])->name('vehicles.index');
    Route::post('/vehicles', [VehicleController::class, 'store'])->name('vehicles.store');
    Route::put('/vehicles/{vehicle}', [VehicleController::class, 'update'])->name('vehicles.update');
    Route::delete('/vehicles/{vehicle}', [VehicleController::class, 'destroy'])->name('vehicles.destroy');
    Route::post('/vehicles/{vehicle}/complete-maintenance', [VehicleController::class, 'completeMaintenance'])->name('vehicles.complete-maintenance');

    // Vehicle Category & Rental Pricing
    Route::post('/vehicle-categories', [VehicleCategoryController::class, 'store'])->name('vehicle-categories.store');
    Route::put('/vehicle-categories/{category}', [VehicleCategoryController::class, 'update'])->name('vehicle-categories.update');
    Route::delete('/vehicle-categories/{category}', [VehicleCategoryController::class, 'destroy'])->name('vehicle-categories.destroy');

    // Vehicle Rentals & Dispatch
    Route::post('/rentals', [VehicleRentalController::class, 'store'])->name('rentals.store');
    Route::post('/rentals/{rental}/return', [VehicleRentalController::class, 'processReturn'])->name('rentals.return');

    // Finance & Invoice Management
    Route::get('/finance', [FinanceController::class, 'index'])->name('finance.index');

    // Recruitment, Divisions & OOC Settings
    Route::get('/recruitment', [AdminRecruitmentController::class, 'index'])->name('recruitment.index');
    Route::post('/recruitment/divisions', [AdminRecruitmentController::class, 'storeDivision'])->name('recruitment.divisions.store');
    Route::put('/recruitment/divisions/{division}', [AdminRecruitmentController::class, 'updateDivision'])->name('recruitment.divisions.update');
    Route::delete('/recruitment/divisions/{division}', [AdminRecruitmentController::class, 'destroyDivision'])->name('recruitment.divisions.destroy');
    Route::patch('/recruitment/divisions/{division}/toggle', [AdminRecruitmentController::class, 'toggleDivision'])->name('recruitment.divisions.toggle');
    Route::post('/recruitment/settings', [AdminRecruitmentController::class, 'updateSettings'])->name('recruitment.settings.update');
    Route::patch('/recruitment/applications/{application}', [AdminRecruitmentController::class, 'updateApplication'])->name('recruitment.applications.update');

    // The Daily Globes - Editorial & Newsroom Management
    Route::get('/daily-globe', [DailyGlobeAdminController::class, 'index'])->name('daily-globe.index');
    Route::post('/daily-globe/articles', [DailyGlobeAdminController::class, 'store'])->name('daily-globe.articles.store');
    Route::put('/daily-globe/articles/{article}', [DailyGlobeAdminController::class, 'update'])->name('daily-globe.articles.update');
    Route::delete('/daily-globe/articles/{article}', [DailyGlobeAdminController::class, 'destroy'])->name('daily-globe.articles.destroy');
    Route::patch('/daily-globe/articles/{article}/featured', [DailyGlobeAdminController::class, 'toggleFeatured'])->name('daily-globe.articles.toggle-featured');
    Route::patch('/daily-globe/articles/{article}/publish', [DailyGlobeAdminController::class, 'togglePublish'])->name('daily-globe.articles.toggle-publish');
    Route::delete('/daily-globe/comments/{comment}', [DailyGlobeAdminController::class, 'destroyComment'])->name('daily-globe.comments.destroy');
    Route::post('/daily-globe/settings', [DailyGlobeAdminController::class, 'updateSettings'])->name('daily-globe.settings.update');

    // Divisi Automotive & Workshop - Attendance, Shift Duty, Weekly SSRP, Leaves & Warnings
    Route::get('/workshop', [WorkshopAdminController::class, 'index'])->name('workshop.index');
    Route::post('/workshop/settings', [WorkshopAdminController::class, 'updateSettings'])->name('workshop.settings.update');
    Route::patch('/workshop/leaves/{leave}', [WorkshopAdminController::class, 'updateLeaveStatus'])->name('workshop.leaves.update');
    Route::post('/workshop/warnings', [WorkshopAdminController::class, 'storeWarning'])->name('workshop.warnings.store');
    Route::delete('/workshop/warnings/{warning}', [WorkshopAdminController::class, 'destroyWarning'])->name('workshop.warnings.destroy');
    Route::post('/workshop/staff', [WorkshopAdminController::class, 'assignStaff'])->name('workshop.staff.assign');

    // Studio Radio & Boombox SA-MP (Joki Lagu, Playlist, Live Mic Takeover, & Static Loop)
    Route::get('/radio', [RadioAdminController::class, 'index'])->name('radio.index');
    Route::post('/radio/settings', [RadioAdminController::class, 'updateSettings'])->name('radio.settings.update');
    Route::post('/radio/mode', [RadioAdminController::class, 'quickSwitchMode'])->name('radio.mode.switch');
    Route::post('/radio/tracks', [RadioAdminController::class, 'storeTrack'])->name('radio.tracks.store');
    Route::post('/radio/tracks/{track}/select', [RadioAdminController::class, 'selectTrack'])->name('radio.tracks.select');
    Route::patch('/radio/tracks/{track}', [RadioAdminController::class, 'updateTrack'])->name('radio.tracks.update');
    Route::delete('/radio/tracks/{track}', [RadioAdminController::class, 'destroyTrack'])->name('radio.tracks.destroy');
    Route::post('/radio/mic-broadcast', [RadioAdminController::class, 'broadcastMic'])->name('radio.mic.broadcast');
    Route::post('/radio/mic-chunk', [RadioAdminController::class, 'liveMicChunk'])->name('radio.mic.chunk');
});

// Protected Staff Routes
Route::middleware(['auth', 'role:staff,admin'])->prefix('staff')->name('staff.')->group(function () {
    Route::get('/dashboard', function () {
        WorkshopStaffController::ensureInitialized();

        $user = auth()->user()->fresh()->load('division');
        $activeDivision = $user->division;
        $divisionCode = $user->getDivisionCode();

        // Only Administrators may preview a specific division via query param;
        // Staff users are strictly locked to their own assigned division.
        $previewCode = request()->query('preview');
        if ($user->isAdmin() && $previewCode && in_array($previewCode, ['marketing', 'automotive', 'rental', 'daily_globe', 'unassigned'], true)) {
            $divisionCode = $previewCode === 'unassigned' ? null : $previewCode;
        }

        $allDivisions = RecruitmentDivision::whereIn('code', ['marketing', 'automotive', 'rental', 'daily_globe'])
            ->where('is_active', true)
            ->orderBy('sort_order', 'asc')
            ->orderBy('id', 'asc')
            ->get(['id', 'code', 'title', 'department', 'icon', 'badge']);

        $workshopData = $divisionCode === 'automotive'
            ? WorkshopStaffController::buildStaffWorkshopPayload($user, request()->query('week'))
            : null;

        return Inertia::render('Staff/Dashboard', [
            'staffUser' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'position' => $user->position,
                'position_title' => $user->getPositionTitle(),
                'recruitment_division_id' => $user->recruitment_division_id,
                'division' => $activeDivision,
            ],
            'currentDivisionCode' => $divisionCode,
            'allDivisions' => $allDivisions,
            'previewMode' => $user->isAdmin() && ! empty($previewCode),
            'workshopData' => $workshopData,
        ]);
    })->name('dashboard');

    // Staff Automotive / Workshop Actions (Upload Shift Duty, Weekly SSRP, & Leave/Izin)
    Route::post('/workshop/duty', [WorkshopStaffController::class, 'storeDuty'])->name('workshop.duty.store');
    Route::delete('/workshop/duty/{dutyLog}', [WorkshopStaffController::class, 'destroyDuty'])->name('workshop.duty.destroy');
    Route::post('/workshop/ssrp', [WorkshopStaffController::class, 'storeSsrp'])->name('workshop.ssrp.store');
    Route::delete('/workshop/ssrp/{ssrpLog}', [WorkshopStaffController::class, 'destroySsrp'])->name('workshop.ssrp.destroy');
    Route::post('/workshop/leave', [WorkshopStaffController::class, 'storeLeave'])->name('workshop.leave.store');
});

// Protected Warga Routes
Route::middleware(['auth', 'role:warga'])->prefix('warga')->name('warga.')->group(function () {
    Route::get('/dashboard', function () {
        $categories = [];
        $divisions = [];
        $settings = null;
        $myApplications = [];

        if (Schema::hasTable('vehicle_categories')) {
            $categories = VehicleCategory::orderBy('id', 'asc')->get()->map(function ($cat) {
                return [
                    'id' => $cat->id,
                    'name' => $cat->name,
                    'slug' => $cat->slug,
                    'description' => $cat->description,
                    'rental_price_per_hour' => $cat->rental_price_per_hour !== null ? (float) $cat->rental_price_per_hour : null,
                    'rental_price_per_day' => $cat->rental_price_per_day !== null ? (float) $cat->rental_price_per_day : null,
                    'rental_price_per_trip' => $cat->rental_price_per_trip !== null ? (float) $cat->rental_price_per_trip : null,
                    'icon' => $cat->icon ?: 'local_shipping',
                ];
            });
        }

        if (Schema::hasTable('recruitment_divisions')) {
            $divisions = RecruitmentDivision::where('is_active', true)
                ->orderBy('sort_order', 'asc')
                ->orderBy('id', 'asc')
                ->get();
        }

        if (Schema::hasTable('recruitment_settings')) {
            $settings = RecruitmentSetting::current();
        }

        if (Schema::hasTable('employee_applications') && auth()->check()) {
            $myApplications = EmployeeApplication::where('user_id', auth()->id())
                ->with('division')
                ->orderBy('id', 'desc')
                ->get();
        }

        return Inertia::render('Warga/Dashboard', [
            'vehicleCategories' => $categories,
            'recruitmentDivisions' => $divisions,
            'recruitmentSettings' => $settings,
            'myApplications' => $myApplications,
        ]);
    })->name('dashboard');

    Route::post('/recruitment/apply', [WargaRecruitmentController::class, 'store'])->name('recruitment.apply');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
