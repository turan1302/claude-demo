<?php

namespace App\Services\Analysis;

use App\Enums\AnalysisStatus;
use App\Jobs\AnalyzeSite\CalculateScoresJob;
use App\Jobs\AnalyzeSite\DispatchCriticalFindingNotificationsJob;
use App\Jobs\AnalyzeSite\FetchPageSpeedDataJob;
use App\Jobs\AnalyzeSite\FetchSiteContentJob;
use App\Jobs\AnalyzeSite\GenerateActionPlanJob;
use App\Jobs\AnalyzeSite\RunGeoHeuristicJob;
use App\Jobs\AnalyzeSite\RunGeoLlmJob;
use App\Jobs\AnalyzeSite\RunSeoAnalyzersJob;
use App\Models\Site;
use App\Models\SiteAnalysis;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * `AnalyzeSiteJob` zincirini dispatch eden tek merkezi nokta. Hem ana
 * siteler hem rakip siteler (ikisi de `sites` tablosunun satırı) için
 * kullanılır — analiz motoru tamamen paylaşılır, kod tekrarı yoktur.
 */
class AnalysisDispatcher
{
    public function dispatch(Site $site, int $version): SiteAnalysis
    {
        $analysis = $site->analyses()->create([
            'version' => $version,
            'status' => AnalysisStatus::Queued,
        ]);

        Bus::chain([
            new FetchSiteContentJob($analysis->id),
            new RunSeoAnalyzersJob($analysis->id),
            new FetchPageSpeedDataJob($analysis->id),
            new RunGeoHeuristicJob($analysis->id),
            new RunGeoLlmJob($analysis->id),
            new CalculateScoresJob($analysis->id),
            new GenerateActionPlanJob($analysis->id),
            new DispatchCriticalFindingNotificationsJob($analysis->id),
        ])->catch(function (Throwable $e) use ($analysis) {
            Log::error('Site analiz zinciri kalıcı olarak başarısız oldu.', [
                'analysis_id' => $analysis->id,
                'error' => $e->getMessage(),
            ]);
        })->dispatch();

        return $analysis;
    }
}
