<?php

namespace App\Services\Reports;

use App\Enums\ActionItemStatus;
use App\Enums\Priority;
use App\Models\ReportSubscription;
use App\Models\Site;
use Illuminate\Support\Collection;

/**
 * Bir rapor aboneliği için e-posta/PDF içeriğinde kullanılacak özet veriyi
 * üretir — hem Mailable'ın HTML görünümü hem dompdf şablonu aynı veri
 * yapısını kullanır.
 */
class ReportDataBuilder
{
    /**
     * @return array{
     *     user_name: string,
     *     period_label: string,
     *     generated_at: \Illuminate\Support\Carbon,
     *     sites: Collection<int, array<string, mixed>>
     * }
     */
    public function build(ReportSubscription $subscription): array
    {
        $sites = $subscription->site_id
            ? Site::where('id', $subscription->site_id)->get()
            : $subscription->user->primarySites()->get();

        $sites->load('latestAnalysis.findings');

        return [
            'user_name' => $subscription->user->name,
            'period_label' => $subscription->frequency->value === 'weekly' ? 'Haftalık' : 'Aylık',
            'generated_at' => now(),
            'sites' => $sites->map(fn (Site $site) => $this->summarizeSite($site)),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function summarizeSite(Site $site): array
    {
        $analysis = $site->latestAnalysis;
        $findings = $analysis?->findings ?? collect();

        $criticalFindings = $findings->where('severity', Priority::Critical);

        $pendingCriticalItems = $site->latestAnalysis?->actionPlans()
            ->with('items')
            ->get()
            ->flatMap(fn ($plan) => $plan->items)
            ->where('priority', Priority::Critical)
            ->where('status', ActionItemStatus::Pending)
            ->count() ?? 0;

        return [
            'name' => $site->name ?? $site->url,
            'url' => $site->url,
            'seo_score' => $analysis?->overall_seo_score,
            'geo_score' => $analysis?->overall_geo_score,
            'critical_finding_count' => $criticalFindings->count(),
            'pending_critical_action_items' => $pendingCriticalItems,
            'top_critical_findings' => $criticalFindings->take(3)->map(fn ($f) => $f->title)->values(),
        ];
    }
}
