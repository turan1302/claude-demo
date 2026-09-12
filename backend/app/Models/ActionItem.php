<?php

namespace App\Models;

use App\Enums\ActionItemStatus;
use App\Enums\EstimatedImpact;
use App\Enums\FindingCategory;
use App\Enums\Priority;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ActionItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'action_plan_id',
        'analysis_finding_id',
        'category',
        'priority',
        'title',
        'description',
        'estimated_impact',
        'status',
        'position',
        'completed_at',
    ];

    protected $casts = [
        'category' => FindingCategory::class,
        'priority' => Priority::class,
        'estimated_impact' => EstimatedImpact::class,
        'status' => ActionItemStatus::class,
        'position' => 'float',
        'completed_at' => 'datetime',
    ];

    public function actionPlan(): BelongsTo
    {
        return $this->belongsTo(ActionPlan::class);
    }

    public function analysisFinding(): BelongsTo
    {
        return $this->belongsTo(AnalysisFinding::class);
    }
}
