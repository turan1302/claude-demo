<?php

namespace App\Models;

use App\Enums\FindingCategory;
use App\Enums\FindingSource;
use App\Enums\Priority;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AnalysisFinding extends Model
{
    use HasFactory;

    protected $fillable = [
        'site_analysis_id',
        'category',
        'type',
        'source',
        'severity',
        'title',
        'description',
        'evidence',
        'score_impact',
    ];

    protected $casts = [
        'category' => FindingCategory::class,
        'source' => FindingSource::class,
        'severity' => Priority::class,
        'evidence' => 'array',
    ];

    public function siteAnalysis(): BelongsTo
    {
        return $this->belongsTo(SiteAnalysis::class);
    }

    public function actionItems(): HasMany
    {
        return $this->hasMany(ActionItem::class);
    }
}
