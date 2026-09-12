<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ActionItemResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'action_plan_id' => $this->action_plan_id,
            'analysis_finding_id' => $this->analysis_finding_id,
            'category' => $this->category->value,
            'priority' => $this->priority->value,
            'title' => $this->title,
            'description' => $this->description,
            'estimated_impact' => $this->estimated_impact->value,
            'status' => $this->status->value,
            'position' => $this->position,
            'completed_at' => $this->completed_at,
            'site' => $this->when(
                $this->relationLoaded('actionPlan') && $this->actionPlan->relationLoaded('siteAnalysis') && $this->actionPlan->siteAnalysis->relationLoaded('site'),
                fn () => [
                    'id' => $this->actionPlan->siteAnalysis->site->id,
                    'name' => $this->actionPlan->siteAnalysis->site->name,
                    'url' => $this->actionPlan->siteAnalysis->site->url,
                ]
            ),
        ];
    }
}
