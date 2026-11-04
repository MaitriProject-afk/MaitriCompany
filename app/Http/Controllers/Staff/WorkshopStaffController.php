<?php

namespace App\Http\Controllers\Staff;

use App\Http\Controllers\Controller;
use App\Models\EmployeeApplication;
use App\Models\RecruitmentDivision;
use App\Models\User;
use App\Models\WorkshopDutyLog;
use App\Models\WorkshopLeave;
use App\Models\WorkshopSetting;
use App\Models\WorkshopSsrpLog;
use App\Models\WorkshopWarningLog;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;

class WorkshopStaffController extends Controller
{
    /**
     * Ensure initial workshop settings, 4 official divisions, and demo records exist.
     */
    public static function ensureInitialized(): void
    {
        if (! Schema::hasTable('workshop_settings')) {
            return;
        }

        $setting = WorkshopSetting::current();

        if (Schema::hasTable('recruitment_divisions')) {
            $officialDivisions = [
                'marketing' => [
                    'title' => 'Divisi Marketing',
                    'department' => 'Pemasaran & Publikasi Bisnis',
                    'icon' => 'campaign',
                    'description' => 'Mengelola kampanye periklanan, publikasi event, penjangkauan relasi bisnis korporat, dan branding komersial Maitri Company di San Andreas.',
                    'qualifications' => [
                        'Komunikatif dan memiliki wawasan publikasi promosi',
                        'Mampu merancang konsep penawaran kerjasama & iklan',
                        'Aktif dalam interaksi sosial dan relasi publik',
                    ],
                    'is_active' => true,
                    'quota' => 5,
                    'badge' => 'Divisi Resmi',
                    'sort_order' => 1,
                ],
                'automotive' => [
                    'title' => 'Divisi Automotive',
                    'department' => 'Workshop & Pemeliharaan Armada',
                    'icon' => 'build',
                    'description' => 'Bertanggung jawab atas perawatan berkala mesin, perbaikan bodi, kalibrasi performa 2000 HP, serta kesiapan teknis seluruh armada dan pelanggan bengkel Maitri.',
                    'qualifications' => [
                        'Memahami prosedur Roleplay mekanik (/me & /do) secara detail dan realistis',
                        'Disiplin mengunggah bukti laporan Shift Duty (On-Duty & Off-Duty) harian dan SSRP mingguan',
                        'Siap bertugas sesuai jadwal shift bengkel yang ditetapkan manajemen',
                    ],
                    'is_active' => true,
                    'quota' => 8,
                    'badge' => 'Divisi Resmi',
                    'sort_order' => 2,
                ],
                'rental' => [
                    'title' => 'Divisi Rental',
                    'department' => 'Layanan & Dispatcher Sewa Armada',
                    'icon' => 'key',
                    'description' => 'Melayani serah terima armada sewa warga, validasi berkas identitas & MoU, monitoring durasi peminjaman, dan inspeksi pengembalian unit.',
                    'qualifications' => [
                        'Teliti dalam administrasi berkas penyewaan warga',
                        'Mampu mengoperasikan sistem pencatatan kontrak & penerbitan invoice',
                        'Tegas dalam menjalankan aturan denda lecet dan keterlambatan',
                    ],
                    'is_active' => true,
                    'quota' => 5,
                    'badge' => 'Divisi Resmi',
                    'sort_order' => 3,
                ],
                'daily_globe' => [
                    'title' => 'Divisi Daily Globe',
                    'department' => 'Jurnalistik & Kantor Berita Pers',
                    'icon' => 'newspaper',
                    'description' => 'Meliput berita terkini kota San Andreas, investigasi lapangan, penerbitan buletin pers harian, dan penyusunan press release resmi perusahaan.',
                    'qualifications' => [
                        'Keterampilan menulis artikel berita jurnalistik yang tajam & objektif',
                        'Mampu melakukan liputan lapangan dan wawancara narasumber',
                        'Memiliki etika pers yang tinggi dan integritas pemberitaan',
                    ],
                    'is_active' => true,
                    'quota' => 4,
                    'badge' => 'Divisi Resmi',
                    'sort_order' => 4,
                ],
            ];

            $divMap = [];
            foreach ($officialDivisions as $code => $attrs) {
                $div = RecruitmentDivision::firstOrCreate(['code' => $code], $attrs);
                if (! $div->is_active) {
                    $div->update(['is_active' => true]);
                }
                $divMap[$code] = $div;
            }

            $autoDiv = $divMap['automotive'];

            // Migrate any legacy divisions
            $legacyDivisions = RecruitmentDivision::whereNull('code')
                ->orWhereNotIn('code', array_keys($officialDivisions))
                ->get();

            foreach ($legacyDivisions as $legacy) {
                $legacyText = strtolower($legacy->title.' '.$legacy->department);
                $targetCode = 'rental';
                if (str_contains($legacyText, 'workshop') || str_contains($legacyText, 'montir') || str_contains($legacyText, 'automotive') || str_contains($legacyText, 'teknisi')) {
                    $targetCode = 'automotive';
                } elseif (str_contains($legacyText, 'marketing') || str_contains($legacyText, 'desain') || str_contains($legacyText, 'interior') || str_contains($legacyText, 'keuangan')) {
                    $targetCode = 'marketing';
                } elseif (str_contains($legacyText, 'globe') || str_contains($legacyText, 'pers') || str_contains($legacyText, 'media')) {
                    $targetCode = 'daily_globe';
                }

                $targetDivId = $divMap[$targetCode]->id;

                User::where('recruitment_division_id', $legacy->id)
                    ->update(['recruitment_division_id' => $targetDivId]);

                if (Schema::hasTable('employee_applications')) {
                    EmployeeApplication::where('recruitment_division_id', $legacy->id)
                        ->update(['recruitment_division_id' => $targetDivId]);
                }

                $legacy->delete();
            }

            // Ensure default shift assignments for sample workshop mechanics
            $bambang = User::where('email', 'bambang.driver@maitri.com')->first();
            if ($bambang && ! $bambang->workshop_shift_id) {
                $bambang->update([
                    'recruitment_division_id' => $autoDiv->id,
                    'position' => $bambang->position ?: 'Kepala Mekanik Workshop',
                    'workshop_shift_id' => 'shift_pagi',
                ]);
            }

            $supri = User::where('email', 'supri.driver@maitri.com')->first();
            if ($supri && ! $supri->workshop_shift_id) {
                $supri->update([
                    'recruitment_division_id' => $autoDiv->id,
                    'position' => $supri->position ?: 'Senior Mechanic 2000 HP',
                    'workshop_shift_id' => 'shift_sore',
                ]);
            }

            $staff1 = User::where('email', 'staff@maitri.com')->first();
            if ($staff1 && ! $staff1->workshop_shift_id) {
                $staff1->update([
                    'recruitment_division_id' => $autoDiv->id,
                    'position' => $staff1->position ?: 'Teknisi Bodi & Custom Workshop',
                    'workshop_shift_id' => 'shift_malam',
                ]);
            }

            // Upgrade any legacy WorkshopDutyLog records that had proof_image but null on_duty_image
            if (Schema::hasColumn('workshop_duty_logs', 'on_duty_image')) {
                $legacyDutyLogs = WorkshopDutyLog::whereNull('on_duty_image')
                    ->whereNotNull('proof_image')
                    ->get();

                foreach ($legacyDutyLogs as $dLog) {
                    $dLog->update([
                        'on_duty_image' => $dLog->proof_image,
                        'off_duty_image' => $dLog->off_duty_image ?: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=900&q=80',
                        'on_duty_at' => $dLog->created_at ?? now()->subHours(6),
                        'off_duty_at' => $dLog->created_at ?? now(),
                    ]);
                }
            }

            // Upgrade any legacy WorkshopSsrpLog records that had proof_image but null proof_images
            if (Schema::hasColumn('workshop_ssrp_logs', 'proof_images')) {
                $legacySsrpLogs = WorkshopSsrpLog::whereNull('proof_images')
                    ->whereNotNull('proof_image')
                    ->get();

                foreach ($legacySsrpLogs as $sLog) {
                    $sLog->update([
                        'proof_images' => [
                            $sLog->proof_image,
                            'https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?auto=format&fit=crop&w=900&q=80',
                        ],
                    ]);
                }
            }
        }
    }

    /**
     * Resolve a user's assigned shift object from WorkshopSetting.
     *
     * @param  array<int, array<string, mixed>>  $shifts
     * @return array<string, mixed>
     */
    public static function resolveUserShift(User $user, array $shifts): array
    {
        if (empty($shifts)) {
            $shifts = WorkshopSetting::defaultShifts();
        }

        if (! empty($user->workshop_shift_id)) {
            foreach ($shifts as $sh) {
                if (($sh['id'] ?? '') === $user->workshop_shift_id || ($sh['name'] ?? '') === $user->workshop_shift_id) {
                    return $sh;
                }
            }
        }

        return $shifts[0];
    }

    /**
     * Build complete Workshop data payload for a specific staff user and week.
     *
     * @return array<string, mixed>
     */
    public static function buildStaffWorkshopPayload(User $user, ?string $weekStartParam = null): array
    {
        static::ensureInitialized();

        $setting = WorkshopSetting::current();
        $shifts = $setting->shifts ?? WorkshopSetting::defaultShifts();
        $assignedShift = static::resolveUserShift($user, $shifts);

        $today = Carbon::today();

        try {
            $weekStart = $weekStartParam
                ? Carbon::parse($weekStartParam)->startOfWeek(Carbon::MONDAY)
                : $today->copy()->startOfWeek(Carbon::MONDAY);
        } catch (\Throwable) {
            $weekStart = $today->copy()->startOfWeek(Carbon::MONDAY);
        }

        $weekEnd = $weekStart->copy()->endOfWeek(Carbon::SUNDAY);

        $dutyLogs = WorkshopDutyLog::where('user_id', $user->id)
            ->whereBetween('duty_date', [$weekStart->toDateString(), $weekEnd->toDateString()])
            ->orderBy('duty_date', 'asc')
            ->get()
            ->keyBy(fn (WorkshopDutyLog $log) => $log->duty_date->format('Y-m-d'));

        $leaves = WorkshopLeave::where('user_id', $user->id)
            ->where('status', '!=', 'rejected')
            ->where(function ($q) use ($weekStart, $weekEnd) {
                $q->whereBetween('start_date', [$weekStart->toDateString(), $weekEnd->toDateString()])
                    ->orWhereBetween('end_date', [$weekStart->toDateString(), $weekEnd->toDateString()])
                    ->orWhere(function ($q2) use ($weekStart, $weekEnd) {
                        $q2->where('start_date', '<=', $weekStart->toDateString())
                            ->where('end_date', '>=', $weekEnd->toDateString());
                    });
            })
            ->orderBy('start_date', 'desc')
            ->get();

        $dayNames = [
            1 => 'Senin',
            2 => 'Selasa',
            3 => 'Rabu',
            4 => 'Kamis',
            5 => 'Jumat',
            6 => 'Sabtu',
            7 => 'Minggu',
        ];

        $calendarDays = [];
        $completeDutyCountThisWeek = 0;
        $partialDutyCountThisWeek = 0;
        $alphaCountThisWeek = 0;
        $leaveCountThisWeek = 0;

        for ($i = 0; $i < 7; $i++) {
            $currentDate = $weekStart->copy()->addDays($i);
            $dateStr = $currentDate->format('Y-m-d');
            $isToday = $currentDate->isSameDay($today);
            $isPast = $currentDate->lt($today);
            $isFuture = $currentDate->gt($today);

            /** @var WorkshopDutyLog|null $dutyLog */
            $dutyLog = $dutyLogs->get($dateStr);

            /** @var WorkshopLeave|null $matchingLeave */
            $matchingLeave = $leaves->first(function (WorkshopLeave $leave) use ($currentDate) {
                return $currentDate->betweenIncluded($leave->start_date, $leave->end_date);
            });

            $onDutyImg = $dutyLog ? ($dutyLog->on_duty_image ?: $dutyLog->proof_image) : null;
            $offDutyImg = $dutyLog ? $dutyLog->off_duty_image : null;
            $hasOnDuty = ! empty($onDutyImg);
            $hasOffDuty = ! empty($offDutyImg);

            if ($hasOnDuty && $hasOffDuty) {
                $status = 'duty_complete';
                $completeDutyCountThisWeek++;
            } elseif ($hasOnDuty || $hasOffDuty) {
                $status = 'duty_partial';
                $partialDutyCountThisWeek++;
            } elseif ($matchingLeave) {
                $status = 'leave';
                $leaveCountThisWeek++;
            } elseif ($isPast) {
                $status = 'alpha';
                $alphaCountThisWeek++;
            } elseif ($isToday) {
                $status = 'pending_today';
            } else {
                $status = 'upcoming';
            }

            $calendarDays[] = [
                'date' => $dateStr,
                'dayName' => $dayNames[$currentDate->dayOfWeekIso] ?? $currentDate->format('l'),
                'shortDate' => $currentDate->translatedFormat('d M'),
                'fullDateLabel' => $currentDate->translatedFormat('d F Y'),
                'isToday' => $isToday,
                'isPast' => $isPast,
                'isFuture' => $isFuture,
                'status' => $status,
                'hasOnDuty' => $hasOnDuty,
                'hasOffDuty' => $hasOffDuty,
                'dutyLog' => $dutyLog ? [
                    'id' => $dutyLog->id,
                    'duty_date' => $dutyLog->duty_date->format('Y-m-d'),
                    'shift_label' => $dutyLog->shift_label,
                    'shift_time' => $dutyLog->shift_time,
                    'on_duty_image' => $onDutyImg,
                    'off_duty_image' => $offDutyImg,
                    'on_duty_at' => $dutyLog->on_duty_at?->format('H:i').' WIB',
                    'off_duty_at' => $dutyLog->off_duty_at?->format('H:i').' WIB',
                    'proof_image' => $onDutyImg ?: $offDutyImg,
                    'caption' => $dutyLog->caption,
                    'status' => $dutyLog->status,
                    'admin_note' => $dutyLog->admin_note,
                ] : null,
                'leave' => $matchingLeave ? [
                    'id' => $matchingLeave->id,
                    'leave_type' => $matchingLeave->leave_type,
                    'reason' => $matchingLeave->reason,
                    'status' => $matchingLeave->status,
                ] : null,
            ];
        }

        // Weekly SSRP logs for this week
        $ssrpLogs = WorkshopSsrpLog::where('user_id', $user->id)
            ->where('week_start_date', $weekStart->toDateString())
            ->orderBy('submission_date', 'asc')
            ->orderBy('id', 'asc')
            ->get()
            ->map(function (WorkshopSsrpLog $log) {
                $imgs = $log->getImagesList();

                return [
                    'id' => $log->id,
                    'week_start_date' => $log->week_start_date->format('Y-m-d'),
                    'submission_date' => $log->submission_date->format('Y-m-d'),
                    'submission_date_label' => $log->submission_date->translatedFormat('d M Y'),
                    'title' => $log->title,
                    'proof_image' => $imgs[0] ?? $log->proof_image,
                    'proof_images' => $imgs,
                    'images_count' => count($imgs),
                    'description' => $log->description,
                    'status' => $log->status,
                    'admin_note' => $log->admin_note,
                    'uploaded_at' => $log->created_at?->format('d M Y H:i'),
                ];
            });

        $ssrpQuota = max(1, (int) $setting->weekly_ssrp_quota);
        $ssrpSubmittedCount = $ssrpLogs->count();
        $ssrpIsComplete = $ssrpSubmittedCount >= $ssrpQuota;

        // All leave history of this user
        $allUserLeaves = WorkshopLeave::where('user_id', $user->id)
            ->orderBy('start_date', 'desc')
            ->limit(15)
            ->get()
            ->map(fn (WorkshopLeave $lv) => [
                'id' => $lv->id,
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

        // Cumulative Warning Points (strictly assigned by Admin across all weeks)
        $recordedWarnings = WorkshopWarningLog::with('issuer')
            ->where('user_id', $user->id)
            ->where('is_active', true)
            ->orderBy('created_at', 'desc')
            ->get();

        $totalCumulativePoints = (int) $recordedWarnings->sum('points');

        $warningItems = $recordedWarnings->map(fn (WorkshopWarningLog $warn) => [
            'id' => $warn->id,
            'points' => (int) $warn->points,
            'category' => $warn->category,
            'date_label' => $warn->reference_date
                ? $warn->reference_date->translatedFormat('d M Y')
                : $warn->created_at?->format('d M Y'),
            'reason' => $warn->reason,
            'issuer_name' => $warn->issuer?->name ?? 'Administrator',
        ])->values()->all();

        $todayDutyRecord = WorkshopDutyLog::where('user_id', $user->id)
            ->whereDate('duty_date', $today->toDateString())
            ->first();

        $todayDutyLog = $todayDutyRecord ? [
            'id' => $todayDutyRecord->id,
            'duty_date' => $todayDutyRecord->duty_date->format('Y-m-d'),
            'shift_label' => $todayDutyRecord->shift_label,
            'shift_time' => $todayDutyRecord->shift_time,
            'on_duty_image' => $todayDutyRecord->on_duty_image ?: $todayDutyRecord->proof_image,
            'off_duty_image' => $todayDutyRecord->off_duty_image,
            'on_duty_at' => $todayDutyRecord->on_duty_at?->format('H:i').' WIB',
            'off_duty_at' => $todayDutyRecord->off_duty_at?->format('H:i').' WIB',
            'caption' => $todayDutyRecord->caption,
            'status' => $todayDutyRecord->status,
        ] : null;

        return [
            'settings' => [
                'workshop_name' => $setting->workshop_name,
                'shifts' => $shifts,
                'weekly_ssrp_quota' => $ssrpQuota,
                'min_weekly_duty_days' => $setting->min_weekly_duty_days,
                'duty_miss_penalty_points' => $setting->duty_miss_penalty_points,
                'ssrp_miss_penalty_points' => $setting->ssrp_miss_penalty_points,
                'max_warning_points' => $setting->max_warning_points,
                'sop_notice' => $setting->sop_notice,
            ],
            'assignedShift' => $assignedShift,
            'todayDutyLog' => $todayDutyLog,
            'weekInfo' => [
                'weekStart' => $weekStart->toDateString(),
                'weekEnd' => $weekEnd->toDateString(),
                'weekLabel' => $weekStart->translatedFormat('d M Y').' — '.$weekEnd->translatedFormat('d M Y'),
                'prevWeek' => $weekStart->copy()->subWeek()->toDateString(),
                'nextWeek' => $weekStart->copy()->addWeek()->toDateString(),
                'isCurrentWeek' => $weekStart->isSameDay($today->copy()->startOfWeek(Carbon::MONDAY)),
                'today' => $today->toDateString(),
                'todayLabel' => $today->translatedFormat('l, d F Y'),
            ],
            'calendarDays' => $calendarDays,
            'weeklyStats' => [
                'dutyCount' => $completeDutyCountThisWeek,
                'partialDutyCount' => $partialDutyCountThisWeek,
                'alphaCount' => $alphaCountThisWeek,
                'leaveCount' => $leaveCountThisWeek,
            ],
            'weeklySsrp' => [
                'quota' => $ssrpQuota,
                'submittedCount' => $ssrpSubmittedCount,
                'remainingCount' => max(0, $ssrpQuota - $ssrpSubmittedCount),
                'isComplete' => $ssrpIsComplete,
                'logs' => $ssrpLogs,
            ],
            'leaves' => $allUserLeaves,
            'warnings' => [
                'totalPoints' => $totalCumulativePoints,
                'maxPoints' => (int) $setting->max_warning_points,
                'items' => $warningItems,
            ],
        ];
    }

    /**
     * Ensure the current user is an Admin or a Staff member explicitly assigned to the Automotive division.
     */
    private function authorizeAutomotiveAccess(Request $request): void
    {
        $user = $request->user()?->loadMissing('division');

        if (! $user) {
            abort(403);
        }

        if (! $user->isAdmin() && $user->getDivisionCode() !== 'automotive') {
            abort(403, 'Akses ditolak: Hanya pegawai Divisi Automotive yang diizinkan mengakses operasional Workshop.');
        }
    }

    /**
     * Store or update daily shift duty screenshot (On-Duty and/or Off-Duty) for the authenticated staff member.
     * Strictly locked to TODAY's date and the employee's admin-assigned shift.
     */
    public function storeDuty(Request $request): RedirectResponse
    {
        $this->authorizeAutomotiveAccess($request);

        $validated = $request->validate([
            'duty_date' => ['nullable', 'date'],
            'stage' => ['nullable', 'string', 'in:on_duty,off_duty,both'],
            'caption' => ['nullable', 'string', 'max:1000'],
            'on_duty_file' => ['nullable', 'image', 'max:8192'],
            'on_duty_url' => ['nullable', 'string', 'max:1000'],
            'off_duty_file' => ['nullable', 'image', 'max:8192'],
            'off_duty_url' => ['nullable', 'string', 'max:1000'],
        ]);

        $user = $request->user();
        $todayStr = Carbon::today()->toDateString();

        if (! empty($validated['duty_date']) && Carbon::parse($validated['duty_date'])->toDateString() !== $todayStr) {
            return back()->with('error', 'Bukti Shift Duty hanya dapat diunggah pada hari ini. Hari yang sudah terlewat otomatis berstatus Alpha dan terkunci.');
        }

        $dutyDate = $todayStr;

        // Always enforce the user's assigned shift from Admin settings
        $setting = WorkshopSetting::current();
        $shifts = $setting->shifts ?? WorkshopSetting::defaultShifts();
        $assignedShift = static::resolveUserShift($user, $shifts);
        $lockedShiftLabel = (string) ($assignedShift['name'] ?? 'Shift Pagi');
        $lockedShiftTime = trim(($assignedShift['start_time'] ?? '08:00').' - '.($assignedShift['end_time'] ?? '14:00'));

        $existing = WorkshopDutyLog::where('user_id', $user->id)
            ->whereDate('duty_date', $dutyDate)
            ->first();

        $newOnDutyImg = $this->resolveUploadedOrUrlImage($request, 'on_duty_file', 'on_duty_url', 'workshop/duty');
        $newOffDutyImg = $this->resolveUploadedOrUrlImage($request, 'off_duty_file', 'off_duty_url', 'workshop/duty');

        $finalOnDutyImg = $newOnDutyImg ?: ($existing?->on_duty_image ?: $existing?->proof_image);
        $finalOffDutyImg = $newOffDutyImg ?: $existing?->off_duty_image;

        if (! $finalOnDutyImg && ! $finalOffDutyImg) {
            return back()->with('error', 'Harap pilih file gambar atau masukkan URL gambar bukti On-Duty atau Off-Duty.');
        }

        $onDutyAt = $newOnDutyImg ? now() : ($existing?->on_duty_at ?? ($finalOnDutyImg ? now() : null));
        $offDutyAt = $newOffDutyImg ? now() : ($existing?->off_duty_at ?? ($finalOffDutyImg ? now() : null));

        WorkshopDutyLog::updateOrCreate(
            [
                'user_id' => $user->id,
                'duty_date' => $dutyDate,
            ],
            [
                'shift_label' => $lockedShiftLabel,
                'shift_time' => $lockedShiftTime,
                'on_duty_image' => $finalOnDutyImg,
                'off_duty_image' => $finalOffDutyImg,
                'on_duty_at' => $onDutyAt,
                'off_duty_at' => $offDutyAt,
                'proof_image' => $finalOnDutyImg ?: $finalOffDutyImg,
                'caption' => ! empty($validated['caption']) ? $validated['caption'] : $existing?->caption,
                'status' => ($finalOnDutyImg && $finalOffDutyImg) ? 'complete' : 'partial',
            ]
        );

        $statusMsg = ($finalOnDutyImg && $finalOffDutyImg)
            ? 'Bukti On-Duty & Off-Duty hari ini berhasil dilengkapi (2/2 Lengkap).'
            : ($newOnDutyImg
                ? 'Bukti Mulai Shift (On-Duty 1/2) hari ini berhasil disimpan. Jangan lupa unggah bukti Off-Duty saat selesai shift.'
                : 'Bukti Selesai Shift (Off-Duty) hari ini berhasil disimpan.');

        return back()->with('success', $statusMsg);
    }

    /**
     * Delete a duty log owned by the authenticated staff member (only allowed on the same day or by Admin).
     */
    public function destroyDuty(Request $request, WorkshopDutyLog $dutyLog): RedirectResponse
    {
        $this->authorizeAutomotiveAccess($request);

        if ($dutyLog->user_id !== $request->user()->id && ! $request->user()->isAdmin()) {
            abort(403);
        }

        if (! $request->user()->isAdmin() && ! $dutyLog->duty_date->isSameDay(Carbon::today())) {
            return back()->with('error', 'Laporan Shift Duty pada hari yang sudah lewat telah terkunci dan tidak dapat diubah atau dihapus.');
        }

        $dutyLog->delete();

        return back()->with('success', 'Laporan Shift Duty hari ini berhasil direset.');
    }

    /**
     * Store a weekly SSRP (Screenshot Roleplay) submission with 1 to 6 images.
     */
    public function storeSsrp(Request $request): RedirectResponse
    {
        $this->authorizeAutomotiveAccess($request);

        $validated = $request->validate([
            'submission_date' => ['nullable', 'date'],
            'title' => ['required', 'string', 'max:200'],
            'description' => ['nullable', 'string', 'max:1500'],
            'proof_files' => ['nullable', 'array', 'max:6'],
            'proof_files.*' => ['image', 'max:8192'],
            'proof_urls' => ['nullable', 'array', 'max:6'],
            'proof_urls.*' => ['nullable', 'string', 'max:1000'],
        ]);

        $imagesList = [];

        if ($request->hasFile('proof_files')) {
            foreach ($request->file('proof_files') as $file) {
                if ($file && $file->isValid() && count($imagesList) < 6) {
                    $path = $file->store('workshop/ssrp', 'public');
                    $imagesList[] = '/storage/'.$path;
                }
            }
        }

        if (! empty($validated['proof_urls']) && is_array($validated['proof_urls'])) {
            foreach ($validated['proof_urls'] as $url) {
                $trimmed = trim((string) $url);
                if ($trimmed !== '' && count($imagesList) < 6) {
                    $imagesList[] = $trimmed;
                }
            }
        }

        if (count($imagesList) < 1) {
            return back()->with('error', 'Minimal wajib mengunggah 1 gambar SSRP (maksimal 6 gambar dalam sekali upload).');
        }

        if (count($imagesList) > 6) {
            $imagesList = array_slice($imagesList, 0, 6);
        }

        $subDate = Carbon::today();
        $weekStart = $subDate->copy()->startOfWeek(Carbon::MONDAY)->toDateString();

        WorkshopSsrpLog::create([
            'user_id' => $request->user()->id,
            'week_start_date' => $weekStart,
            'submission_date' => $subDate->toDateString(),
            'title' => $validated['title'],
            'proof_image' => $imagesList[0],
            'proof_images' => $imagesList,
            'description' => $validated['description'] ?? null,
            'status' => 'approved',
        ]);

        $countImg = count($imagesList);

        return back()->with('success', "Laporan SSRP berhasil diunggah ({$countImg} gambar terlampir).");
    }

    /**
     * Delete a weekly SSRP submission.
     */
    public function destroySsrp(Request $request, WorkshopSsrpLog $ssrpLog): RedirectResponse
    {
        $this->authorizeAutomotiveAccess($request);

        if ($ssrpLog->user_id !== $request->user()->id && ! $request->user()->isAdmin()) {
            abort(403);
        }

        $ssrpLog->delete();

        return back()->with('success', 'Laporan SSRP berhasil dihapus.');
    }

    /**
     * Store a leave / absence request (Form Izin / Sakit / Absen).
     */
    public function storeLeave(Request $request): RedirectResponse
    {
        $this->authorizeAutomotiveAccess($request);

        $validated = $request->validate([
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'leave_type' => ['required', 'string', 'in:izin,sakit,cuti_ooc'],
            'reason' => ['required', 'string', 'max:1000'],
            'proof_file' => ['nullable', 'image', 'max:8192'],
            'proof_url' => ['nullable', 'string', 'max:1000'],
        ]);

        $imagePath = $this->resolveUploadedOrUrlImage($request, 'proof_file', 'proof_url', 'workshop/leaves');

        WorkshopLeave::create([
            'user_id' => $request->user()->id,
            'start_date' => Carbon::parse($validated['start_date'])->toDateString(),
            'end_date' => Carbon::parse($validated['end_date'])->toDateString(),
            'leave_type' => $validated['leave_type'],
            'reason' => $validated['reason'],
            'proof_image' => $imagePath,
            'status' => 'approved',
        ]);

        return back()->with('success', 'Formulir Izin / Absen berhasil diajukan dan tercatat di kalender kehadiran.');
    }

    /**
     * Resolve either a multipart file upload or a string image URL.
     */
    private function resolveUploadedOrUrlImage(Request $request, string $fileField, string $urlField, string $folder): ?string
    {
        if ($request->hasFile($fileField) && $request->file($fileField)->isValid()) {
            $path = $request->file($fileField)->store($folder, 'public');

            return '/storage/'.$path;
        }

        $url = trim((string) $request->input($urlField, ''));

        return $url !== '' ? $url : null;
    }
}
