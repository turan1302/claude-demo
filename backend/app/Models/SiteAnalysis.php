<?php

namespace App\Models;

use App\Enums\AnalysisStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SiteAnalysis extends Model
{
    use HasFactory;

    protected $fillable = [
        'site_id',
        'version',
        'status',
        'current_step',
        'overall_seo_score',
        'overall_geo_score',
        'core_web_vitals',
        'raw_data',
        'error_message',
        'started_at',
        'completed_at',
    ];

    protected $casts = [
        'status' => AnalysisStatus::class,
        'core_web_vitals' => 'array',
        'raw_data' => 'array',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function site(): BelongsTo
    {
        return $this->belongsTo(Site::class);
    }

    public function findings(): HasMany
    {
        return $this->hasMany(AnalysisFinding::class);
    }

    public function actionPlans(): HasMany
    {
        return $this->hasMany(ActionPlan::class);
    }
}
