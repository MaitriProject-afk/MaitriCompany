<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Staff\WorkshopStaffController;
use App\Models\RecruitmentDivision;
use App\Models\User;
use App\Models\WorkshopDutyLog;
use App\Models\WorkshopLeave;
use App\Models\WorkshopSetting;
use App\Models\WorkshopWarningLog;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WorkshopAdminController extends Controller
{
    /**
     * Display the Admin Workshop & Automotive Staff Management Console.
     */
    public function index(Request $request): Response
    {
        WorkshopStaffController::ensureInitialized();

        $setting = WorkshopSetting::current();
        $shifts = $setting->shifts ?? WorkshopSetting::defaultShifts();
        $today = Carbon::today();

        // Selected date for daily attendance inspection (defaults to today)
        try {
            $selectedDate = $request->input('date')
                ? Carbon::parse($request->input('date'))->startOfDay()
                : $today->copy();
        } catch (\Throwable) {
            $selectedDate = $today->copy();
        }

        // Selected week for weekly calendar & SSRP matrix (defaults to week of selectedDate or week param)
        try {
            $weekStart = $request->input('week')
                ? Carbon::parse($request->input('week'))->startOfWeek(Carbon::MONDAY)
                : $selectedDate->copy()->startOfWeek(Carbon::MONDAY);
        } catch (\Throwable) {
            $weekStart = $today->copy()->startOfWeek(Carbon::MONDAY);
        }

        $weekEnd = $weekStart->copy()->endOfWeek(Carbon::SUNDAY);

        $autoDiv = RecruitmentDivision::where('code', 'automotive')->first();

        $workshopStaffQuery = User::with('division')
            ->where('role', User::ROLE_STAFF);

        if ($autoDiv) {
            $workshopStaffQuery->where(function ($q) use ($autoDiv) {
                $q->where('recruitment_division_id', $autoDiv->id)
                    ->orWhereHas('division', function ($dq) {
                        $dq->where('code', 'automotive');
                    });
            });
        }

        $workshopStaff = $workshopStaffQuery->orderBy('name', 'asc')->get();

        // All users that can be assigned to Automotive division
        $availableUsers = User::with('division')
            ->where('id', '!=', auth()->id())
            ->orderBy('role', 'asc')
            ->orderBy('name', 'asc')
            ->get()
            ->map(fn (User $u) => [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'role' => $u->role,
                'position' => $u->position,
                'workshop_shift_id' => $u->workshop_shift_id,
                'recruitment_division_id' => $u->recruitment_division_id,
                'division_title' => $u->division?->title,
                'is_workshop_member' => $autoDiv && $u->recruitment_division_id === $autoDiv->id,
            ]);

        $dayNames = [
            1 => 'Senin',
            2 => 'Selasa',
            3 => 'Rabu',
            4 => 'Kamis',
            5 => 'Jumat',
            6 => 'Sabtu',
            7 => 'Minggu',
        ];

        $weekDaysHeader = [];
        for ($i = 0; $i < 7; $i++) {
            $d = $weekStart->copy()->addDays($i);
            $weekDaysHeader[] = [
                'date' => $d->toDateString(),
                'dayName' => $dayNames[$d->dayOfWeekIso] ?? $d->format('D'),
                'shortDay' => substr($dayNames[$d->dayOfWeekIso] ?? $d->format('D'), 0, 3),
                'shortDate' => $d->translatedFormat('d M'),
                'isToday' => $d->isSameDay($today),
                'isSelectedDate' => $d->isSameDay($selectedDate),
            ];
        }

        $staffRows = [];
        $dailySummary = [
            'totalStaff' => $workshopStaff->count(),
            'completeTodayCount' => 0,
            'partialTodayCount' => 0,
            'leaveTodayCount' => 0,
            'alphaOrMissingTodayCount' => 0,
            'ssrpCompletedWeekCount' => 0,
            'ssrpIncompleteWeekCount' => 0,
        ];

        foreach ($workshopStaff as $employee) {
            $empPayload = WorkshopStaffController::buildStaffWorkshopPayload($employee, $weekStart->toDateString());
            $assignedShift = WorkshopStaffController::resolveUserShift($employee, $shifts);

            // Check status on $selectedDate
            $dutyOnSelectedDate = WorkshopDutyLog::where('user_id', $employee->id)
                ->whereDate('duty_date', $selectedDate->toDateString())
                ->first();

            $leaveOnSelectedDate = WorkshopLeave::where('user_id', $employee->id)
                ->where('status', '!=', 'rejected')
                ->whereDate('start_date', '<=', $selectedDate->toDateString())
                ->whereDate('end_date', '>=', $selectedDate->toDateString())
                ->first();

            $onDutyImg = $dutyOnSelectedDate ? ($dutyOnSelectedDate->on_duty_image ?: $dutyOnSelectedDate->proof_image) : null;
            $offDutyImg = $dutyOnSelectedDate ? $dutyOnSelectedDate->off_duty_image : null;
            $hasOnDuty = ! empty($onDutyImg);
            $hasOffDuty = ! empty($offDutyImg);

            if ($hasOnDuty && $hasOffDuty) {
                $dailyStatus = 'duty_complete';
                $dailySummary['completeTodayCount']++;
            } elseif ($hasOnDuty || $hasOffDuty) {
                $dailyStatus = 'duty_partial';
                $dailySummary['partialTodayCount']++;
            } elseif ($leaveOnSelectedDate) {
                $dailyStatus = 'leave';
                $dailySummary['leaveTodayCount']++;
            } elseif ($selectedDate->lt($today)) {
                $dailyStatus = 'alpha';
                $dailySummary['alphaOrMissingTodayCount']++;
            } else {
                $dailyStatus = 'belum_upload';
                $dailySummary['alphaOrMissingTodayCount']++;
            }

            if ($empPayload['weeklySsrp']['isComplete']) {
                $dailySummary['ssrpCompletedWeekCount']++;
            } else {
                $dailySummary['ssrpIncompleteWeekCount']++;
            }

            $staffRows[] = [
                'id' => $employee->id,
                'name' => $employee->name,
                'email' => $employee->email,
                'position' => $employee->position ?: 'Mekanik Workshop',
                'workshop_shift_id' => $employee->workshop_shift_id ?: ($assignedShift['id'] ?? ''),
                'assignedShift' => $assignedShift,
                'dailyStatus' => $dailyStatus,
                'dailyDutyLog' => $dutyOnSelectedDate ? [
                    'id' => $dutyOnSelectedDate->id,
                    'duty_date' => $dutyOnSelectedDate->duty_date->format('Y-m-d'),
                    'shift_label' => $dutyOnSelectedDate->shift_label,
                    'shift_time' => $dutyOnSelectedDate->shift_time,
                    'on_duty_image' => $onDutyImg,
                    'off_duty_image' => $offDutyImg,
                    'on_duty_at' => $dutyOnSelectedDate->on_duty_at?->format('H:i').' WIB',
                    'off_duty_at' => $dutyOnSelectedDate->off_duty_at?->format('H:i').' WIB',
                    'caption' => $dutyOnSelectedDate->caption,
                ] : null,
                'dailyLeave' => $leaveOnSelectedDate ? [
                    'id' => $leaveOnSelectedDate->id,
                    'leave_type' => $leaveOnSelectedDate->leave_type,
                    'reason' => $leaveOnSelectedDate->reason,
                    'status' => $leaveOnSelectedDate->status,
                ] : null,
                'calendarDays' => $empPayload['calendarDays'],
                'weeklyStats' => $empPayload['weeklyStats'],
                'weeklySsrp' => $empPayload['weeklySsrp'],
                'warnings' => $empPayload['warnings'],
            ];
        }

        // All leave requests from workshop staff
        $allLeaves = WorkshopLeave::with('user')
            ->orderBy('created_at', 'desc')
            ->limit(30)
            ->get()
            ->map(fn (WorkshopLeave $lv) => [
                'id' => $lv->id,
                'user_id' => $lv->user_id,
                'user_name' => $lv->user?->name ?? 'Pegawai',
                'user_position' => $lv->user?->position ?: 'Mekanik Workshop',
                'start_date' => $lv->start_date->format('Y-m-d'),
                'end_date' => $lv->end_date->format('Y-m-d'),
                'date_range_label' => $lv->start_date->isSameDay($lv->end_date)
                    ? $lv->start_date->translatedFormat('d M Y')
                    : $lv->start_date->translatedFormat('d M').' - '.$lv->end_date->translatedFormat('d M Y'),
                'leave_type' => $lv->leave_type,
                'reason' => $lv->reason,
                'proof_image' => $lv->proof_image,
                'status' => $lv->status,
                'admin_note' => $lv->admin_note,
                'created_at_label' => $lv->created_at?->format('d M Y H:i'),
            ]);

        // All recorded cumulative warning logs
        $allWarnings = WorkshopWarningLog::with(['user', 'issuer'])
            ->where('is_active', true)
            ->orderBy('created_at', 'desc')
            ->limit(60)
            ->get()
            ->map(fn (WorkshopWarningLog $w) => [
                'id' => $w->id,
                'user_id' => $w->user_id,
                'user_name' => $w->user?->name ?? 'Pegawai',
                'issuer_name' => $w->issuer?->name ?? 'Administrator',
                'points' => (int) $w->points,
                'category' => $w->category,
                'reference_date' => $w->reference_date?->format('Y-m-d'),
                'reference_date_label' => $w->reference_date
                    ? $w->reference_date->translatedFormat('d M Y')
                    : $w->created_at?->format('d M Y'),
                'reason' => $w->reason,
                'created_at_label' => $w->created_at?->format('d M Y H:i'),
            ]);

        return Inertia::render('Admin/Workshop/Index', [
            'settings' => [
                'workshop_name' => $setting->workshop_name,
                'shifts' => $shifts,
                'weekly_ssrp_quota' => (int) $setting->weekly_ssrp_quota,
                'min_weekly_duty_days' => (int) $setting->min_weekly_duty_days,
                'duty_miss_penalty_points' => (int) $setting->duty_miss_penalty_points,
                'ssrp_miss_penalty_points' => (int) $setting->ssrp_miss_penalty_points,
                'max_warning_points' => (int) $setting->max_warning_points,
                'sop_notice' => $setting->sop_notice,
            ],
            'filters' => [
                'selectedDate' => $selectedDate->toDateString(),
                'selectedDateLabel' => $selectedDate->translatedFormat('l, d F Y'),
                'weekStart' => $weekStart->toDateString(),
                'weekEnd' => $weekEnd->toDateString(),
                'weekLabel' => $weekStart->translatedFormat('d M Y').' — '.$weekEnd->translatedFormat('d M Y'),
                'prevWeek' => $weekStart->copy()->subWeek()->toDateString(),
                'nextWeek' => $weekStart->copy()->addWeek()->toDateString(),
                'today' => $today->toDateString(),
            ],
            'weekDaysHeader' => $weekDaysHeader,
            'dailySummary' => $dailySummary,
            'staffRows' => $staffRows,
            'allLeaves' => $allLeaves,
            'allWarnings' => $allWarnings,
            'availableUsers' => $availableUsers,
            'automotiveDivisionId' => $autoDiv?->id,
        ]);
    }

    /**
     * Update Workshop settings (Shifts, Weekly SSRP Quota, Penalty Points, SOP Notice).
     */
    public function updateSettings(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'workshop_name' => ['required', 'string', 'max:150'],
            'shifts' => ['required', 'array', 'min:1'],
            'shifts.*.id' => ['nullable', 'string', 'max:60'],
            'shifts.*.name' => ['required', 'string', 'max:100'],
            'shifts.*.start_time' => ['required', 'string', 'max:20'],
            'shifts.*.end_time' => ['required', 'string', 'max:20'],
            'shifts.*.description' => ['nullable', 'string', 'max:255'],
            'weekly_ssrp_quota' => ['required', 'integer', 'min:1', 'max:21'],
            'min_weekly_duty_days' => ['required', 'integer', 'min:1', 'max:7'],
            'duty_miss_penalty_points' => ['required', 'integer', 'min:1', 'max:10'],
            'ssrp_miss_penalty_points' => ['required', 'integer', 'min:1', 'max:10'],
            'max_warning_points' => ['required', 'integer', 'min:1', 'max:20'],
            'sop_notice' => ['nullable', 'string', 'max:2000'],
        ]);

        // Ensure every shift has a stable id
        $normalizedShifts = array_map(function (array $sh, int $idx) {
            if (empty($sh['id'])) {
                $sh['id'] = 'shift_'.($idx + 1).'_'.strtolower(preg_replace('/[^a-zA-Z0-9]/', '', $sh['name']));
            }

            return $sh;
        }, $validated['shifts'], array_keys($validated['shifts']));

        $validated['shifts'] = $normalizedShifts;

        // Ensure every shift has a stable id
        $normalizedShifts = array_map(function (array $sh, int $idx) {
            if (empty($sh['id'])) {
                $sh['id'] = 'shift_'.($idx + 1).'_'.strtolower(preg_replace('/[^a-zA-Z0-9]/', '', $sh['name']));
            }

            return $sh;
        }, $validated['shifts'], array_keys($validated['shifts']));

        $validated['shifts'] = $normalizedShifts;

        $setting = WorkshopSetting::current();
        $setting->update($validated);

        return back()->with('success', 'Pengaturan Jadwal Shift Kerja dan Target SSRP Mingguan berhasil disimpan.');
    }

    /**
     * Approve or reject a staff leave / absence submission.
     */
    public function updateLeaveStatus(Request $request, WorkshopLeave $leave): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'string', 'in:approved,rejected,pending'],
            'admin_note' => ['nullable', 'string', 'max:500'],
        ]);

        $leave->update([
            'status' => $validated['status'],
            'admin_note' => $validated['admin_note'] ?? $leave->admin_note,
        ]);

        return back()->with('success', 'Status pengajuan izin pegawai berhasil diperbarui.');
    }

    /**
     * Manually assign cumulative warning points to a workshop staff member.
     */
    public function storeWarning(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'user_id' => ['required', 'exists:users,id'],
            'points' => ['required', 'integer', 'min:1', 'max:10'],
            'category' => ['required', 'string', 'in:alpha_duty,missed_ssrp,manual_violation'],
            'reference_date' => ['nullable', 'date'],
            'reason' => ['required', 'string', 'max:500'],
        ]);

        WorkshopWarningLog::create([
            'user_id' => $validated['user_id'],
            'issued_by' => $request->user()->id,
            'points' => $validated['points'],
            'category' => $validated['category'],
            'reference_date' => ! empty($validated['reference_date'])
                ? Carbon::parse($validated['reference_date'])->toDateString()
                : Carbon::today()->toDateString(),
            'reason' => $validated['reason'],
            'is_active' => true,
        ]);

        return back()->with('success', 'Poin peringatan kumulatif berhasil ditambahkan ke catatan karyawan.');
    }

    /**
     * Revoke / remove a warning point record.
     */
    public function destroyWarning(WorkshopWarningLog $warning): RedirectResponse
    {
        $warning->delete();

        return back()->with('success', 'Catatan poin peringatan karyawan berhasil dihapus.');
    }

    /**
     * Assign or update a user's Workshop shift, position, or membership.
     */
    public function assignStaff(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'user_id' => ['required', 'exists:users,id'],
            'position' => ['nullable', 'string', 'max:100'],
            'workshop_shift_id' => ['nullable', 'string', 'max:100'],
            'action' => ['required', 'string', 'in:assign,update_shift,remove'],
        ]);

        $autoDiv = RecruitmentDivision::where('code', 'automotive')->first();
        if (! $autoDiv) {
            return back()->with('error', 'Divisi Automotive belum ditemukan.');
        }

        $targetUser = User::findOrFail($validated['user_id']);

        if ($validated['action'] === 'assign' || $validated['action'] === 'update_shift') {
            $targetUser->update([
                'role' => User::ROLE_STAFF,
                'recruitment_division_id' => $autoDiv->id,
                'position' => ! empty($validated['position'])
                    ? $validated['position']
                    : ($targetUser->position ?: 'Mekanik Workshop'),
                'workshop_shift_id' => $validated['workshop_shift_id'] ?? $targetUser->workshop_shift_id,
            ]);

            return back()->with('success', "Jadwal shift dan penugasan untuk {$targetUser->name} berhasil diperbarui.");
        }

        $targetUser->update([
            'recruitment_division_id' => null,
            'workshop_shift_id' => null,
        ]);

        return back()->with('success', "{$targetUser->name} dikeluarkan dari Divisi Automotive.");
    }
}
