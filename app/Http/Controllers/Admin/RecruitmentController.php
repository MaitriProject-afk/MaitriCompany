<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Staff\WorkshopStaffController;
use App\Models\EmployeeApplication;
use App\Models\RecruitmentDivision;
use App\Models\RecruitmentSetting;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RecruitmentController extends Controller
{
    /**
     * Display recruitment management console, open divisions, and applicant submissions.
     */
    public function index(Request $request): Response
    {
        WorkshopStaffController::ensureInitialized();

        $status = $request->query('status', 'all');
        $divisionId = $request->query('division_id', 'all');
        $search = $request->query('search');

        $divisions = RecruitmentDivision::withCount('applications')
            ->orderBy('sort_order', 'asc')
            ->orderBy('id', 'asc')
            ->get();

        $settings = RecruitmentSetting::current();

        $query = EmployeeApplication::with(['division', 'user', 'reviewer'])->orderBy('id', 'desc');

        if ($status !== 'all') {
            $query->where('status', $status);
        }

        if ($divisionId !== 'all') {
            $query->where('recruitment_division_id', $divisionId);
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('full_name', 'like', "%{$search}%")
                    ->orWhere('ticket_number', 'like', "%{$search}%")
                    ->orWhere('sa_phone', 'like', "%{$search}%")
                    ->orWhere('sa_id_card', 'like', "%{$search}%")
                    ->orWhere('position_title', 'like', "%{$search}%");
            });
        }

        $applications = $query->paginate(20)->withQueryString();

        $stats = [
            'total_applications' => EmployeeApplication::count(),
            'pending_count' => EmployeeApplication::where('status', EmployeeApplication::STATUS_PENDING)->count(),
            'interview_count' => EmployeeApplication::where('status', EmployeeApplication::STATUS_INTERVIEW)->count(),
            'accepted_count' => EmployeeApplication::where('status', EmployeeApplication::STATUS_ACCEPTED)->count(),
            'rejected_count' => EmployeeApplication::where('status', EmployeeApplication::STATUS_REJECTED)->count(),
            'active_divisions' => $divisions->where('is_active', true)->count(),
            'is_open' => $settings->is_recruitment_open,
        ];

        return Inertia::render('Admin/Recruitment/Index', [
            'divisions' => $divisions,
            'settings' => $settings,
            'applications' => $applications,
            'stats' => $stats,
            'filters' => [
                'status' => $status,
                'division_id' => $divisionId,
                'search' => $search,
            ],
        ]);
    }

    /**
     * Store a newly created recruitment division.
     */
    public function storeDivision(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'department' => 'required|string|max:255',
            'icon' => 'nullable|string|max:50',
            'description' => 'required|string',
            'qualifications' => 'nullable|array',
            'qualifications.*' => 'nullable|string',
            'required_licenses' => 'nullable|array',
            'custom_questions' => 'nullable|array',
            'sop_commitments' => 'nullable|array',
            'is_active' => 'boolean',
            'quota' => 'nullable|integer|min:1',
            'badge' => 'nullable|string|max:100',
            'sort_order' => 'nullable|integer',
        ]);

        $validated['icon'] = (! empty($validated['icon'])) ? $validated['icon'] : 'local_shipping';
        $validated['is_active'] = $request->boolean('is_active', true);
        $validated['qualifications'] = array_values(array_filter($validated['qualifications'] ?? []));
        $validated['required_licenses'] = $validated['required_licenses'] ?? [];
        $validated['custom_questions'] = $validated['custom_questions'] ?? [];
        $validated['sop_commitments'] = $validated['sop_commitments'] ?? [];

        RecruitmentDivision::create($validated);

        return back()->with('success', 'Divisi lowongan baru berhasil ditambahkan.');
    }

    /**
     * Update an existing recruitment division.
     */
    public function updateDivision(Request $request, RecruitmentDivision $division): RedirectResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'department' => 'required|string|max:255',
            'icon' => 'nullable|string|max:50',
            'description' => 'required|string',
            'qualifications' => 'nullable|array',
            'qualifications.*' => 'nullable|string',
            'required_licenses' => 'nullable|array',
            'custom_questions' => 'nullable|array',
            'sop_commitments' => 'nullable|array',
            'is_active' => 'boolean',
            'quota' => 'nullable|integer|min:1',
            'badge' => 'nullable|string|max:100',
            'sort_order' => 'nullable|integer',
        ]);

        $validated['icon'] = (! empty($validated['icon'])) ? $validated['icon'] : 'local_shipping';
        $validated['is_active'] = $request->boolean('is_active');
        $validated['qualifications'] = array_values(array_filter($validated['qualifications'] ?? []));
        $validated['required_licenses'] = $validated['required_licenses'] ?? [];
        $validated['custom_questions'] = $validated['custom_questions'] ?? [];
        $validated['sop_commitments'] = $validated['sop_commitments'] ?? [];

        $division->update($validated);

        return back()->with('success', 'Data divisi lowongan berhasil diperbarui.');
    }

    /**
     * Remove the specified division.
     */
    public function destroyDivision(RecruitmentDivision $division): RedirectResponse
    {
        $title = $division->title;
        $division->delete();

        return back()->with('success', "Divisi '{$title}' berhasil dihapus.");
    }

    /**
     * Toggle the active status of a division.
     */
    public function toggleDivision(RecruitmentDivision $division): RedirectResponse
    {
        $division->is_active = ! $division->is_active;
        $division->save();

        $statusText = $division->is_active ? 'dibuka' : 'ditutup sementara';

        return back()->with('success', "Status rekrutmen untuk divisi '{$division->title}' berhasil {$statusText}.");
    }

    /**
     * Update recruitment settings, form requirements, sections, and questions.
     */
    public function updateSettings(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'is_recruitment_open' => 'boolean',
            'required_fields' => 'nullable|array',
            'form_sections' => 'nullable|array',
            'available_licenses' => 'nullable|array',
            'domicile_options' => 'nullable|array',
            'experience_options' => 'nullable|array',
            'shift_options' => 'nullable|array',
            'sop_commitments' => 'nullable|array',
            'ic_custom_questions' => 'nullable|array',
            'motivation_prompt' => 'nullable|string|max:500',
            'ooc_enabled' => 'boolean',
            'ooc_questions' => 'nullable|array',
            'instructions' => 'nullable|string',
            'contact_person' => 'nullable|string|max:255',
        ]);

        $settings = RecruitmentSetting::current();
        $settings->is_recruitment_open = $request->boolean('is_recruitment_open');
        $settings->ooc_enabled = $request->boolean('ooc_enabled');
        $settings->required_fields = $validated['required_fields'] ?? $settings->required_fields;
        $settings->form_sections = $validated['form_sections'] ?? $settings->form_sections;
        $settings->available_licenses = $validated['available_licenses'] ?? $settings->available_licenses;
        $settings->domicile_options = $validated['domicile_options'] ?? $settings->domicile_options;
        $settings->experience_options = $validated['experience_options'] ?? $settings->experience_options;
        $settings->shift_options = $validated['shift_options'] ?? $settings->shift_options;
        $settings->sop_commitments = $validated['sop_commitments'] ?? $settings->sop_commitments;
        $settings->ic_custom_questions = $validated['ic_custom_questions'] ?? $settings->ic_custom_questions;
        $settings->motivation_prompt = $validated['motivation_prompt'] ?? $settings->motivation_prompt;
        $settings->ooc_questions = $validated['ooc_questions'] ?? $settings->ooc_questions;
        $settings->instructions = $validated['instructions'] ?? $settings->instructions;
        $settings->contact_person = $validated['contact_person'] ?? $settings->contact_person;
        $settings->save();

        return back()->with('success', 'Konfigurasi formulir pendaftaran, seksi IC, OOC, dan SOP berhasil disimpan.');
    }

    /**
     * Review an applicant application status.
     */
    public function updateApplication(Request $request, EmployeeApplication $application): RedirectResponse
    {
        $validated = $request->validate([
            'status' => 'required|string|in:pending,interview,accepted,rejected',
            'admin_notes' => 'nullable|string',
        ]);

        $application->status = $validated['status'];
        $application->admin_notes = $validated['admin_notes'] ?? null;
        $application->reviewed_by = $request->user()->id;
        $application->reviewed_at = now();
        $application->save();

        // If accepted and user account exists, promote to staff and assign to this division
        if ($application->status === EmployeeApplication::STATUS_ACCEPTED && $application->user_id) {
            $user = $application->user;
            if ($user && $user->role === User::ROLE_WARGA) {
                $user->update([
                    'role' => User::ROLE_STAFF,
                    'position' => $application->position_title ?: ($application->division?->title ?: 'Staff Operasional'),
                    'recruitment_division_id' => $application->recruitment_division_id,
                ]);
            } elseif ($user && $user->isStaff() && empty($user->recruitment_division_id)) {
                $user->update([
                    'recruitment_division_id' => $application->recruitment_division_id,
                ]);
            }
        }

        return back()->with('success', "Status lamaran #{$application->ticket_number} berhasil diperbarui.");
    }
}
