<?php

namespace App\Events;

use App\Models\SiteAnalysis;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class SiteAnalysisStatusUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public SiteAnalysis $analysis)
    {
    }

    /**
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [new PrivateChannel('site-analysis.'.$this->analysis->id)];
    }

    public function broadcastAs(): string
    {
        return 'SiteAnalysisStatusUpdated';
    }

    /**
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        return [
            'id' => $this->analysis->id,
            'site_id' => $this->analysis->site_id,
            'status' => $this->analysis->status->value,
            'current_step' => $this->analysis->current_step,
            'overall_seo_score' => $this->analysis->overall_seo_score,
            'overall_geo_score' => $this->analysis->overall_geo_score,
            'error_message' => $this->analysis->error_message,
        ];
    }
}
