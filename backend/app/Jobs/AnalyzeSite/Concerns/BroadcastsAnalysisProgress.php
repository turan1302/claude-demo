<?php

namespace App\Jobs\AnalyzeSite\Concerns;

use App\Enums\AnalysisStatus;
use App\Enums\SiteStatus;
use App\Events\SiteAnalysisStatusUpdated;
use App\Models\SiteAnalysis;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * AnalyzeSiteJob zincirindeki her job'ın ortak davranışı: mevcut adımı
 * güncelleyip Reverb üzerinden yayınlamak, ya da kalıcı bir hatada analizi
 * "failed" olarak işaretleyip zincirin geri kalanının çalışmasını engellemek.
 */
trait BroadcastsAnalysisProgress
{
    protected function markStep(SiteAnalysis $analysis, string $step): void
    {
        $analysis->update(['current_step' => $step]);

        $this->broadcastSafely($analysis);
    }

    protected function markFailed(SiteAnalysis $analysis, string $message): void
    {
        $analysis->update([
            'status' => AnalysisStatus::Failed,
            'error_message' => $message,
            'completed_at' => now(),
        ]);

        $analysis->site->update(['status' => SiteStatus::Error]);

        $this->broadcastSafely($analysis);
    }

    /**
     * Reverb sunucusu geçici olarak erişilemez durumda olsa bile, bu SADECE
     * gerçek zamanlı bildirimi etkilemeli; analiz zincirinin kendisini asla
     * düşürmemeli.
     */
    private function broadcastSafely(SiteAnalysis $analysis): void
    {
        try {
            broadcast(new SiteAnalysisStatusUpdated($analysis->fresh()));
        } catch (Throwable $e) {
            Log::warning('Analiz durumu yayınlanamadı (Reverb erişilemez olabilir), analiz devam ediyor.', [
                'analysis_id' => $analysis->id,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
