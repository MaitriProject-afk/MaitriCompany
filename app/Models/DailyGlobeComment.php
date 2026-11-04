<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'daily_globe_article_id',
    'author',
    'region',
    'role_badge',
    'text',
    'published_time',
])]
class DailyGlobeComment extends Model
{
    use HasFactory;

    /**
     * The article this comment belongs to.
     */
    public function article(): BelongsTo
    {
        return $this->belongsTo(DailyGlobeArticle::class, 'daily_globe_article_id');
    }

    /**
     * Format comment for frontend display.
     *
     * @return array<string, mixed>
     */
    public function toFrontendArray(): array
    {
        return [
            'id' => $this->id,
            'author' => $this->author,
            'region' => $this->region ?: 'San Andreas',
            'roleBadge' => $this->role_badge,
            'text' => $this->text,
            'time' => $this->published_time ?: ($this->created_at ? $this->created_at->diffForHumans() : 'Baru saja'),
        ];
    }
}
