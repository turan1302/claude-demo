<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ActionPlanResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'site_analysis_id' => $this->site_analysis_id,
            'summary' => $this->summary,
            'generated_at' => $this->generated_at,
            'items' => ActionItemResource::collection($this->whenLoaded('items')),
        ];
    }
}
