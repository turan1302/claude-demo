<?php

namespace App\Jobs\AnalyzeSite;

use App\Enums\AnalysisStatus;
use App\Enums\IntegrationProvider;
use App\Jobs\AnalyzeSite\Concerns\BroadcastsAnalysisProgress;
use App\Models\Integration;
use App\Models\SiteAnalysis;
use App\Services\Analysis\GeoLlmAnalyzer;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use League\HTMLToMarkdown\HtmlConverter;
use Throwable;

/**
 * LLM destekli derin GEO analizi tamamen opsiyoneldir: kullanıcının aktif bir
 * Anthropic/OpenAI key'i yoksa ya da API çağrısı başarısız olursa bu adım
 * sessizce atlanır, zincirin geri kalanını asla bloklamaz.
 */
class RunGeoLlmJob implements ShouldQueue
{
    use BroadcastsAnalysisProgress, Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public readonly int $analysisId)
    {
    }

    public function handle(GeoLlmAnalyzer $analyzer): void
    {
        $analysis = SiteAnalysis::with('site')->findOrFail($this->analysisId);

        if ($analysis->status === AnalysisStatus::Failed) {
            return;
        }

        $this->markStep($analysis, 'geo_llm');

        $integration = Integration::query()
            ->where('user_id', $analysis->site->user_id)
            ->whereIn('provider', [IntegrationProvider::Anthropic, IntegrationProvider::Openai])
            ->where('is_active', true)
            ->first();

        if ($integration === null) {
            return;
        }

        $html = Storage::disk('local')->get($analysis->raw_data['html_path']);
        $content = (new HtmlConverter(['strip_tags' => true]))->convert($html);

        try {
            $findings = $analyzer->analyze($content, $integration->provider, $integration->api_key);
        } catch (Throwable $e) {
            Log::warning('LLM destekli GEO analizi başarısız oldu, atlanıyor.', ['analysis_id' => $analysis->id, 'error' => $e->getMessage()]);

            return;
        }

        $integration->update(['last_used_at' => now()]);

        foreach ($findings as $data) {
            $analysis->findings()->create($data);
        }
    }
}
