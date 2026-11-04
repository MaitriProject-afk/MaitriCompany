<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

#[Fillable(['name', 'email', 'password', 'role', 'position', 'recruitment_division_id', 'workshop_shift_id'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * Role constants
     */
    public const ROLE_ADMIN = 'admin';

    public const ROLE_STAFF = 'staff';

    public const ROLE_WARGA = 'warga';

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Check if user is admin.
     */
    public function isAdmin(): bool
    {
        return $this->role === self::ROLE_ADMIN;
    }

    /**
     * Check if user is staff.
     */
    public function isStaff(): bool
    {
        return $this->role === self::ROLE_STAFF;
    }

    /**
     * Check if user is warga.
     */
    public function isWarga(): bool
    {
        return $this->role === self::ROLE_WARGA;
    }

    /**
     * Get real or default position title for the user.
     */
    public function getPositionTitle(): ?string
    {
        if (! empty($this->position)) {
            return $this->position;
        }

        if ($this->isAdmin()) {
            return 'Chief Executive Officer';
        }

        if ($this->isStaff()) {
            return 'Fleet Operations Manager';
        }

        return null;
    }

    /**
     * Check if user has any of the given roles.
     *
     * @param  string|array<string>  $roles
     */
    public function hasRole(string|array $roles): bool
    {
        $roleList = is_array($roles) ? $roles : explode(',', $roles);

        return in_array($this->role, array_map('trim', $roleList), true);
    }

    /**
     * The hauling vehicles assigned to this user.
     */
    public function vehicles(): BelongsToMany
    {
        return $this->belongsToMany(Vehicle::class, 'vehicle_user')
            ->withPivot('role_note')
            ->withTimestamps();
    }

    /**
     * The recruitment division this staff user is assigned to.
     */
    public function division(): BelongsTo
    {
        return $this->belongsTo(RecruitmentDivision::class, 'recruitment_division_id');
    }

    /**
     * Get the standardized division code for dashboard routing.
     */
    public function getDivisionCode(): ?string
    {
        if (! $this->division) {
            return null;
        }

        if (! empty($this->division->code)) {
            return $this->division->code;
        }

        $title = strtolower($this->division->title.' '.$this->division->department);
        if (str_contains($title, 'marketing')) {
            return 'marketing';
        }
        if (str_contains($title, 'automotive') || str_contains($title, 'workshop') || str_contains($title, 'montir')) {
            return 'automotive';
        }
        if (str_contains($title, 'rental') || str_contains($title, 'sewa') || str_contains($title, 'dispatcher')) {
            return 'rental';
        }
        if (str_contains($title, 'daily globe') || str_contains($title, 'globe') || str_contains($title, 'media') || str_contains($title, 'pers')) {
            return 'daily_globe';
        }

        return null;
    }

    /**
     * Workshop daily shift duty logs submitted by this user.
     */
    public function workshopDutyLogs(): HasMany
    {
        return $this->hasMany(WorkshopDutyLog::class);
    }

    /**
     * Workshop weekly SSRP logs submitted by this user.
     */
    public function workshopSsrpLogs(): HasMany
    {
        return $this->hasMany(WorkshopSsrpLog::class);
    }

    /**
     * Workshop leave/absence requests submitted by this user.
     */
    public function workshopLeaves(): HasMany
    {
        return $this->hasMany(WorkshopLeave::class);
    }

    /**
     * Workshop warning points received by this user.
     */
    public function workshopWarningLogs(): HasMany
    {
        return $this->hasMany(WorkshopWarningLog::class);
    }
}
