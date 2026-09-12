<?php

namespace App\Jobs\AnalyzeSite;

use App\Enums\AnalysisStatus;
use App\Jobs\AnalyzeSite\Concerns\BroadcastsAnalysisProgress;
use App\Models\SiteAnalysis;
use App\Services\Analysis\ScoreCalculator;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Throwable;

class CalculateScoresJob implements ShouldQueue
{
    use BroadcastsAnalysisProgress, Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public readonly int $analysisId)
    {
    }

    public function handle(ScoreCalculator $calculator): void
    {
        $analysis = SiteAnalysis::with(['site', 'findings'])->findOrFail($this->analysisId);

        if ($analysis->status === AnalysisStatus::Failed) {
            return;
        }

        $this->markStep($analysis, 'scoring');

        $scores = $calculator->calculate($analysis->findings);

        $analysis->update([
            'overall_seo_score' => $scores['seo'],
            'overall_geo_score' => $scores['geo'],
        ]);
    }

    public function failed(Throwable $exception): void
    {
        $analysis = SiteAnalysis::find($this->analysisId);

        if ($analysis !== null && $analysis->status !== AnalysisStatus::Failed) {
            $this->markFailed($analysis, $exception->getMessage());
        }
    }
}
