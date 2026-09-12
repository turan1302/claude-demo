<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AnalysisFindingResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'category' => $this->category->value,
            'type' => $this->type,
            'source' => $this->source->value,
            'severity' => $this->severity->value,
            'title' => $this->title,
            'description' => $this->description,
            'evidence' => $this->evidence,
            'score_impact' => $this->score_impact,
        ];
    }
}
