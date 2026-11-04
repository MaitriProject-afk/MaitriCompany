<?php

namespace App\Http\Controllers\Warga;

use App\Http\Controllers\Controller;
use App\Models\EmployeeApplication;
use App\Models\RecruitmentDivision;
use App\Models\RecruitmentSetting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class RecruitmentController extends Controller
{
    /**
     * Store a newly submitted employee recruitment application.
     */
    public function store(Request $request): RedirectResponse
    {
        $settings = RecruitmentSetting::current();

        if (! $settings->is_recruitment_open) {
            return back()->with('error', 'Mohon maaf, pendaftaran karyawan Maitri Company saat ini sedang ditutup.');
        }

        $validated = $request->validate([
            'recruitment_division_id' => 'required|exists:recruitment_divisions,id',
            'full_name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'sa_phone' => 'nullable|string|max:50',
            'sa_id_card' => 'nullable|string|max:50',
            'age' => 'nullable|integer|min:17|max:90',
            'domicile' => 'nullable|string|max:100',
            'licenses' => 'nullable|array',
            'experience_level' => 'nullable|string|max:50',
            'shift' => 'nullable|string|max:50',
            'motivation' => 'nullable|string',
            'ic_answers' => 'nullable|array',
            'ooc_answers' => 'nullable|array',
            'sop_agreements' => 'nullable|array',
        ]);

        $division = RecruitmentDivision::findOrFail($validated['recruitment_division_id']);

        if (! $division->is_active) {
            return back()->with('error', "Pendaftaran untuk divisi '{$division->title}' saat ini sedang tidak dibuka.");
        }

        // Validate required fields configured by admin
        $requiredFields = $settings->required_fields ?? [];
        if (in_array('sa_phone', $requiredFields) && empty($validated['sa_phone'])) {
            return back()->withErrors(['sa_phone' => 'Nomor Telepon San Andreas wajib diisi.'])->withInput();
        }
        if (in_array('sa_id_card', $requiredFields) && empty($validated['sa_id_card'])) {
            return back()->withErrors(['sa_id_card' => 'Nomor KTP / ID Card San Andreas wajib diisi.'])->withInput();
        }
        if (in_array('motivation', $requiredFields) && empty(trim($validated['motivation'] ?? ''))) {
            return back()->withErrors(['motivation' => 'Motivasi bergabung wajib diceritakan.'])->withInput();
        }

        $year = date('Y');
        $randomSeq = str_pad((string) random_int(1, 9999), 4, '0', STR_PAD_LEFT);
        $ticket = sprintf('MTR-HRD-%s-%s', $year, $randomSeq);

        while (EmployeeApplication::where('ticket_number', $ticket)->exists()) {
            $randomSeq = str_pad((string) random_int(1, 9999), 4, '0', STR_PAD_LEFT);
            $ticket = sprintf('MTR-HRD-%s-%s', $year, $randomSeq);
        }

        EmployeeApplication::create([
            'ticket_number' => $ticket,
            'user_id' => $request->user()->id,
            'recruitment_division_id' => $division->id,
            'position_title' => $division->title,
            'full_name' => $validated['full_name'],
            'email' => $validated['email'],
            'sa_phone' => $validated['sa_phone'] ?? '-',
            'sa_id_card' => $validated['sa_id_card'] ?? '-',
            'age' => $validated['age'] ?? 25,
            'domicile' => $validated['domicile'] ?? 'Verona Beach',
            'licenses' => $validated['licenses'] ?? [],
            'experience_level' => $validated['experience_level'] ?? 'pemula',
            'shift' => $validated['shift'] ?? 'fleksibel',
            'motivation' => $validated['motivation'] ?? '',
            'ic_answers' => $validated['ic_answers'] ?? [],
            'ooc_answers' => $validated['ooc_answers'] ?? [],
            'sop_agreements' => $validated['sop_agreements'] ?? [],
            'status' => EmployeeApplication::STATUS_PENDING,
        ]);

        return back()->with('success', "Formulir pendaftaran berhasil dikirim! Nomor tiket Anda: #{$ticket}. Silakan tunggu peninjauan dari tim HRD/Direksi.");
    }
}
