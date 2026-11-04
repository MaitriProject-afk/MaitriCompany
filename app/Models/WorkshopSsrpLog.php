<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'user_id',
    'week_start_date',
    'submission_date',
    'title',
    'proof_image',
    'proof_images',
    'description',
    'status',
    'admin_note',
])]
class WorkshopSsrpLog extends Model
{
    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'week_start_date' => 'date:Y-m-d',
            'submission_date' => 'date:Y-m-d',
            'proof_images' => 'array',
        ];
    }

    /**
     * The staff member who submitted this SSRP report.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get normalized array of 1 to 6 proof images.
     *
     * @return array<int, string>
     */
    public function getImagesList(): array
    {
        if (is_array($this->proof_images) && count($this->proof_images) > 0) {
            return array_values(array_filter($this->proof_images));
        }

        return ! empty($this->proof_image) ? [$this->proof_image] : [];
    }
}
