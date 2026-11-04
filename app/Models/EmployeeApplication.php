<?php

namespace App\Models;

use Database\Factories\EmployeeApplicationFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'ticket_number',
    'user_id',
    'recruitment_division_id',
    'position_title',
    'full_name',
    'email',
    'sa_phone',
    'sa_id_card',
    'age',
    'domicile',
    'licenses',
    'experience_level',
    'shift',
    'motivation',
    'ic_answers',
    'ooc_answers',
    'sop_agreements',
    'status',
    'admin_notes',
    'reviewed_by',
    'reviewed_at',
])]
class EmployeeApplication extends Model
{
    /** @use HasFactory<EmployeeApplicationFactory> */
    use HasFactory;

    public const STATUS_PENDING = 'pending';

    public const STATUS_INTERVIEW = 'interview';

    public const STATUS_ACCEPTED = 'accepted';

    public const STATUS_REJECTED = 'rejected';

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'age' => 'integer',
            'licenses' => 'array',
            'ic_answers' => 'array',
            'ooc_answers' => 'array',
            'sop_agreements' => 'array',
            'reviewed_at' => 'datetime',
        ];
    }

    /**
     * The citizen applicant account.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * The target recruitment division.
     */
    public function division(): BelongsTo
    {
        return $this->belongsTo(RecruitmentDivision::class, 'recruitment_division_id');
    }

    /**
     * The admin user who reviewed this application.
     */
    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }
}
