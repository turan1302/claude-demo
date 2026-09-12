<?php

namespace App\Jobs\AnalyzeSite;

use App\Enums\AnalysisStatus;
use App\Jobs\AnalyzeSite\Concerns\BroadcastsAnalysisProgress;
use App\Models\SiteAnalysis;
use App\Services\Analysis\HeadingStructureAnalyzer;
use App\Services\Analysis\LinkAnalyzer;
use App\Services\Analysis\MetaTagAnalyzer;
use App\Services\Analysis\RobotsSitemapChecker;
use App\Services\Analysis\StructuredDataDetector;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\DomCrawler\Crawler;
use Throwable;

class RunSeoAnalyzersJob implements ShouldQueue
{
    use BroadcastsAnalysisProgress, Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public readonly int $analysisId)
    {
    }

    public function handle(
        MetaTagAnalyzer $metaTagAnalyzer,
        HeadingStructureAnalyzer $headingStructureAnalyzer,
        LinkAnalyzer $linkAnalyzer,
        RobotsSitemapChecker $robotsSitemapChecker,
        StructuredDataDetector $structuredDataDetector,
    ): void {
        $analysis = SiteAnalysis::with('site')->findOrFail($this->analysisId);

        if ($analysis->status === AnalysisStatus::Failed) {
            return;
        }

        $this->markStep($analysis, 'seo_analyzers');

        $html = Storage::disk('local')->get($analysis->raw_data['html_path']);
        $crawler = new Crawler($html, $analysis->raw_data['final_url']);

        $linkResult = $linkAnalyzer->analyze($crawler, $analysis->site->url);
        $structuredDataResult = $structuredDataDetector->analyze($crawler);

        $findings = [
            ...$metaTagAnalyzer->analyze($crawler),
            ...$headingStructureAnalyzer->analyze($crawler),
            ...$linkResult['findings'],
            ...$robotsSitemapChecker->check($analysis->site->url),
            ...$structuredDataResult['findings'],
        ];

        foreach ($findings as $data) {
            $analysis->findings()->create($data);
        }

        // GeoHeuristicAnalyzer'ın HTML'i yeniden ayrıştırmasına gerek kalmasın diye
        // bu adımda zaten hesaplanan ara sonuçları raw_data'ya ekliyoruz.
        $analysis->update([
            'raw_data' => [
                ...$analysis->raw_data,
                'structured_data_types' => $structuredDataResult['types'],
                'external_link_count' => $linkResult['external_links'],
            ],
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
