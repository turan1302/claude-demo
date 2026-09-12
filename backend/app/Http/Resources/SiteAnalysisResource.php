<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SiteAnalysisResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'site_id' => $this->site_id,
            'version' => $this->version,
            'status' => $this->status->value,
            'current_step' => $this->current_step,
            'overall_seo_score' => $this->overall_seo_score,
            'overall_geo_score' => $this->overall_geo_score,
            'core_web_vitals' => $this->core_web_vitals,
            'error_message' => $this->error_message,
            'started_at' => $this->started_at,
            'completed_at' => $this->completed_at,
            'created_at' => $this->created_at,
            'findings' => AnalysisFindingResource::collection($this->whenLoaded('findings')),
            'action_plan' => $this->whenLoaded('actionPlans', fn () => ActionPlanResource::make($this->actionPlans->first())),
        ];
    }
}
