<?php

namespace App\Jobs\AnalyzeSite;

use App\Enums\AnalysisStatus;
use App\Enums\IntegrationProvider;
use App\Jobs\AnalyzeSite\Concerns\BroadcastsAnalysisProgress;
use App\Models\Integration;
use App\Models\SiteAnalysis;
use App\Services\Analysis\PageSpeedInsightsClient;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * PageSpeed Insights entegrasyonu tamamen opsiyoneldir: kullanıcının aktif bir
 * key'i yoksa ya da API çağrısı başarısız olursa bu adım sessizce atlanır,
 * zincirin geri kalanını asla bloklamaz.
 */
class FetchPageSpeedDataJob implements ShouldQueue
{
    use BroadcastsAnalysisProgress, Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public readonly int $analysisId)
    {
    }

    public function handle(PageSpeedInsightsClient $client): void
    {
        $analysis = SiteAnalysis::with('site')->findOrFail($this->analysisId);

        if ($analysis->status === AnalysisStatus::Failed) {
            return;
        }

        $this->markStep($analysis, 'pagespeed');

        $integration = Integration::query()
            ->where('user_id', $analysis->site->user_id)
            ->where('provider', IntegrationProvider::PagespeedInsights)
            ->where('is_active', true)
            ->first();

        if ($integration === null) {
            return;
        }

        try {
            $result = $client->analyze($analysis->site->url, $integration->api_key);
        } catch (Throwable $e) {
            Log::warning('PageSpeed Insights analizi başarısız oldu, atlanıyor.', ['analysis_id' => $analysis->id, 'error' => $e->getMessage()]);

            return;
        }

        $integration->update(['last_used_at' => now()]);

        if ($result === null) {
            return;
        }

        foreach ($result['findings'] as $data) {
            $analysis->findings()->create($data);
        }

        $analysis->update(['core_web_vitals' => $result['vitals']]);
    }
}
