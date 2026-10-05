<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    /**
     * Display a listing of registered users.
     */
    public function index(Request $request): Response
    {
        $search = $request->input('search');
        $roleFilter = $request->input('role');

        $query = User::query();

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($roleFilter && in_array($roleFilter, [User::ROLE_ADMIN, User::ROLE_STAFF, User::ROLE_WARGA], true)) {
            $query->where('role', $roleFilter);
        }

        $users = $query->orderBy('id', 'desc')->get()->map(function (User $user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'position' => $user->position,
                'position_title' => $user->getPositionTitle(),
                'email_verified_at' => $user->email_verified_at?->format('d M Y, H:i'),
                'created_at' => $user->created_at?->format('d M Y, H:i'),
            ];
        });

        $counts = [
            'total' => User::count(),
            'admin' => User::where('role', User::ROLE_ADMIN)->count(),
            'staff' => User::where('role', User::ROLE_STAFF)->count(),
            'warga' => User::where('role', User::ROLE_WARGA)->count(),
        ];

        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
            'filters' => [
                'search' => $search ?? '',
                'role' => $roleFilter ?? 'all',
            ],
            'counts' => $counts,
        ]);
    }

    /**
     * Update the specified user's role and position.
     */
    public function updateRole(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'role' => ['required', 'string', Rule::in([User::ROLE_ADMIN, User::ROLE_STAFF, User::ROLE_WARGA])],
            'position' => ['nullable', 'string', 'max:100'],
        ]);

        $newRole = $validated['role'];
        $newPosition = $validated['position'] ?? null;

        // If user is editing themselves, prevent locking out by demoting own role
        if ($user->id === $request->user()->id && $newRole !== $user->role) {
            return back()->with('error', 'Anda tidak dapat mengubah hak akses (role) akun Anda sendiri saat sedang login.');
        }

        // Warga users do not have positions
        if ($newRole === User::ROLE_WARGA) {
            $newPosition = null;
        }

        $user->update([
            'role' => $newRole,
            'position' => $newPosition,
        ]);

        return back()->with('success', "Role dan Jabatan untuk {$user->name} berhasil diperbarui.");
    }
}
