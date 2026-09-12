<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class KeywordResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'site_id' => $this->site_id,
            'keyword' => $this->keyword,
            'location' => $this->location,
            'is_active' => $this->is_active,
            'latest_ranking' => $this->whenLoaded(
                'latestRanking',
                fn () => $this->latestRanking ? KeywordRankingResource::make($this->latestRanking) : null
            ),
            'created_at' => $this->created_at,
        ];
    }
}
