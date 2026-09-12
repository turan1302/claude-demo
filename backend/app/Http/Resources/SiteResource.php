<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SiteResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'type' => $this->type->value,
            'parent_site_id' => $this->parent_site_id,
            'url' => $this->url,
            'name' => $this->name,
            'status' => $this->status->value,
            'last_analyzed_at' => $this->last_analyzed_at,
            'created_at' => $this->created_at,
            'latest_analysis' => $this->whenLoaded(
                'latestAnalysis',
                fn () => $this->latestAnalysis ? SiteAnalysisResource::make($this->latestAnalysis) : null
            ),
        ];
    }
}
