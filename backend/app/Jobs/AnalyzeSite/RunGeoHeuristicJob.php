<?php

namespace App\Jobs\AnalyzeSite;

use App\Enums\AnalysisStatus;
use App\Jobs\AnalyzeSite\Concerns\BroadcastsAnalysisProgress;
use App\Models\SiteAnalysis;
use App\Services\Analysis\GeoHeuristicAnalyzer;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\DomCrawler\Crawler;
use Throwable;

class RunGeoHeuristicJob implements ShouldQueue
{
    use BroadcastsAnalysisProgress, Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public readonly int $analysisId)
    {
    }

    public function handle(GeoHeuristicAnalyzer $analyzer): void
    {
        $analysis = SiteAnalysis::with('site')->findOrFail($this->analysisId);

        if ($analysis->status === AnalysisStatus::Failed) {
            return;
        }

        $this->markStep($analysis, 'geo_heuristic');

        $html = Storage::disk('local')->get($analysis->raw_data['html_path']);
        $crawler = new Crawler($html, $analysis->raw_data['final_url']);

        $findings = $analyzer->analyze(
            $crawler,
            $analysis->raw_data['structured_data_types'] ?? [],
            $analysis->raw_data['external_link_count'] ?? 0,
        );

        foreach ($findings as $data) {
            $analysis->findings()->create($data);
        }
    }

    public function failed(Throwable $exception): void
    {
        $analysis = SiteAnalysis::find($this->analysisId);

        if ($analysis !== null && $analysis->status !== AnalysisStatus::Failed) {
            $this->markFailed($analysis, $exception->getMessage());
        }
    }
}
