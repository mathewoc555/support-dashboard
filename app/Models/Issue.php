<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Issue extends Model
{
    public const PRIORITIES = ['low', 'medium', 'high'];
    public const STATUSES = ['open', 'in_progress', 'resolved'];
    public const CATEGORIES = [
        'Account & Access Management',
        'Billing',
        'Technical Issues',
        'Service Requests',
        'Feature Requests & Feedback',
    ];

    protected $fillable = [
        'customer_name', 'title', 'description', 'priority', 'category', 'status', 'summary',
        'suggested_next_action', 'summary_status', 'needs_attention',
    ];

    protected $casts = ['needs_attention' => 'boolean'];

    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class)->oldest();
    }

    public function recomputeNeedsAttention(): void
    {
        $this->needs_attention = $this->priority === 'high';
    }
}
