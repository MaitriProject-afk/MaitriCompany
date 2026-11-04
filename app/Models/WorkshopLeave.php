<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'user_id',
    'start_date',
    'end_date',
    'leave_type',
    'reason',
    'proof_image',
    'status',
    'admin_note',
])]
class WorkshopLeave extends Model
{
    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'start_date' => 'date:Y-m-d',
            'end_date' => 'date:Y-m-d',
        ];
    }

    /**
     * The staff member who requested this leave/absence.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
