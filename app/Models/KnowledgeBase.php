<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class KnowledgeBase extends Model
{
    protected $table = 'knowledge_base';
    protected $fillable = ['knowledge_base_category_id', 'title', 'problem', 'agent_steps', 'customer_response', 'keywords', 'active'];
    protected $casts = ['keywords' => 'array', 'active' => 'boolean'];

    public function category(): BelongsTo
    {
        return $this->belongsTo(KnowledgeBaseCategory::class, 'knowledge_base_category_id');
    }
}
