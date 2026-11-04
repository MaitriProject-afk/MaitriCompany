<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'user_id',
    'duty_date',
    'shift_label',
    'shift_time',
    'on_duty_image',
    'off_duty_image',
    'on_duty_at',
    'off_duty_at',
    'proof_image',
    'caption',
    'status',
    'admin_note',
])]
class WorkshopDutyLog extends Model
{
    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'duty_date' => 'date:Y-m-d',
            'on_duty_at' => 'datetime',
            'off_duty_at' => 'datetime',
        ];
    }

    /**
     * The staff member who submitted this duty log.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Check if both On-Duty and Off-Duty screenshots have been uploaded.
     */
    public function isComplete(): bool
    {
        return ! empty($this->on_duty_image) && ! empty($this->off_duty_image);
    }
}
