<?php

namespace App\Jobs\AnalyzeSite;

use App\Enums\AnalysisStatus;
use App\Enums\SiteStatus;
use App\Jobs\AnalyzeSite\Concerns\BroadcastsAnalysisProgress;
use App\Models\SiteAnalysis;
use App\Services\Analysis\HtmlFetcherService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;
use RuntimeException;
use Throwable;

class FetchSiteContentJob implements ShouldQueue
{
    use BroadcastsAnalysisProgress, Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 4;

    public function __construct(public readonly int $analysisId)
    {
    }

    /**
     * Bazı paylaşımlı hosting ortamlarında (LVE thread/process kotası) cURL'ün
     * DNS çözümlemesi için açtığı thread ara sıra "getaddrinfo() thread failed
     * to start" hatasıyla başarısız olabiliyor — bu tamamen geçici bir kaynak
     * sıkışıklığı, art arda denemekten çok kısa bir bekleme sonrası tekrar
     * denemek çok daha güvenilir sonuç veriyor.
     *
     * @return array<int, int>
     */
    public function backoff(): array
    {
        return [10, 20, 40];
    }

    public function handle(HtmlFetcherService $fetcher): void
    {
        $analysis = SiteAnalysis::with('site')->findOrFail($this->analysisId);

        $analysis->update([
            'status' => AnalysisStatus::Processing,
            'started_at' => now(),
        ]);
        $analysis->site->update(['status' => SiteStatus::Analyzing]);
        $this->markStep($analysis, 'fetching');

        try {
            $result = $fetcher->fetch($analysis->site->url);
        } catch (RuntimeException $e) {
            $this->markFailed($analysis, $e->getMessage());

            throw $e;
        }

        $htmlPath = "analyses/{$analysis->id}.html";
        Storage::disk('local')->put($htmlPath, $result['html']);

        $analysis->update([
            'raw_data' => [
                'status_code' => $result['status_code'],
                'final_url' => $result['final_url'],
                'content_type' => $result['content_type'],
                'html_path' => $htmlPath,
                'fetched_at' => now()->toIso8601String(),
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
