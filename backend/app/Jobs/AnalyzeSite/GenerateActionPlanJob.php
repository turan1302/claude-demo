<?php

namespace App\Jobs\AnalyzeSite;

use App\Enums\AnalysisStatus;
use App\Enums\SiteStatus;
use App\Events\SiteAnalysisStatusUpdated;
use App\Jobs\AnalyzeSite\Concerns\BroadcastsAnalysisProgress;
use App\Models\SiteAnalysis;
use App\Services\Analysis\ActionPlanGenerator;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Throwable;

class GenerateActionPlanJob implements ShouldQueue
{
    use BroadcastsAnalysisProgress, Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public readonly int $analysisId)
    {
    }

    public function handle(ActionPlanGenerator $generator): void
    {
        $analysis = SiteAnalysis::with('site')->findOrFail($this->analysisId);

        if ($analysis->status === AnalysisStatus::Failed) {
            return;
        }

        $this->markStep($analysis, 'action_plan');

        $generator->generate($analysis);

        $analysis->update([
            'status' => AnalysisStatus::Completed,
            'current_step' => null,
            'completed_at' => now(),
        ]);

        $analysis->site->update([
            'status' => SiteStatus::Analyzed,
            'last_analyzed_at' => now(),
        ]);

        broadcast(new SiteAnalysisStatusUpdated($analysis->fresh()));
    }

    public function failed(Throwable $exception): void
    {
        $analysis = SiteAnalysis::find($this->analysisId);

        if ($analysis !== null && $analysis->status !== AnalysisStatus::Failed) {
            $this->markFailed($analysis, $exception->getMessage());
        }
    }
}
