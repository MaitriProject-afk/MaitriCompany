<?php

namespace App\Models;

use Database\Factories\RecruitmentDivisionFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'code',
    'title',
    'department',
    'icon',
    'description',
    'qualifications',
    'required_licenses',
    'custom_questions',
    'sop_commitments',
    'is_active',
    'quota',
    'badge',
    'sort_order',
])]
class RecruitmentDivision extends Model
{
    /** @use HasFactory<RecruitmentDivisionFactory> */
    use HasFactory;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'qualifications' => 'array',
            'required_licenses' => 'array',
            'custom_questions' => 'array',
            'sop_commitments' => 'array',
            'is_active' => 'boolean',
            'quota' => 'integer',
            'sort_order' => 'integer',
        ];
    }

    /**
     * All employee applications submitted for this division.
     */
    public function applications(): HasMany
    {
        return $this->hasMany(EmployeeApplication::class);
    }

    /**
     * All staff users assigned to this division.
     */
    public function users(): HasMany
    {
        return $this->hasMany(User::class, 'recruitment_division_id');
    }
}
