<?php

namespace App\Jobs\AnalyzeSite;

use App\Enums\AnalysisStatus;
use App\Enums\Priority;
use App\Models\SiteAnalysis;
use App\Notifications\CriticalSeoIssueDetected;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class DispatchCriticalFindingNotificationsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public readonly int $analysisId)
    {
    }

    public function handle(): void
    {
        $analysis = SiteAnalysis::with(['site.user', 'findings'])->find($this->analysisId);

        if ($analysis === null || $analysis->status !== AnalysisStatus::Completed) {
            return;
        }

        $criticalCount = $analysis->findings->where('severity', Priority::Critical)->count();

        if ($criticalCount === 0) {
            return;
        }

        $analysis->site->user->notify(new CriticalSeoIssueDetected($analysis, $criticalCount));
    }
}
