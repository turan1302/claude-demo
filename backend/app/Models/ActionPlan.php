<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ActionPlan extends Model
{
    use HasFactory;

    protected $fillable = [
        'site_analysis_id',
        'summary',
        'generated_at',
    ];

    protected $casts = [
        'generated_at' => 'datetime',
    ];

    public function siteAnalysis(): BelongsTo
    {
        return $this->belongsTo(SiteAnalysis::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(ActionItem::class)->orderBy('position');
    }
}
