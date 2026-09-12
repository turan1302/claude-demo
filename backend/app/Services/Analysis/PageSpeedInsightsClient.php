<?php

namespace App\Services\Analysis;

use App\Enums\FindingCategory;
use App\Enums\Priority;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;

class PageSpeedInsightsClient
{
    private const ENDPOINT = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';

    public function __construct(private readonly Client $client = new Client())
    {
    }

    /**
     * @return array{vitals: array<string, mixed>, findings: list<array<string, mixed>>}|null
     *         null döner: API key geçersizse ya da servise ulaşılamazsa (bu adım analiz zincirini bozmaz, atlanır).
     */
    public function analyze(string $url, string $apiKey): ?array
    {
        $mobile = $this->runForStrategy($url, $apiKey, 'mobile');
        $desktop = $this->runForStrategy($url, $apiKey, 'desktop');

        if ($mobile === null && $desktop === null) {
            return null;
        }

        $vitals = array_filter(['mobile' => $mobile, 'desktop' => $desktop]);
        $findings = [];

        if ($mobile !== null) {
            $findings = [...$findings, ...$this->findingsFor('mobile', $mobile)];
        }

        return ['vitals' => $vitals, 'findings' => $findings];
    }

    /**
     * @return array{lcp: float, cls: float, tbt: float, performance_score: int}|null
     */
    private function runForStrategy(string $url, string $apiKey, string $strategy): ?array
    {
        try {
            $response = $this->client->get(self::ENDPOINT, [
                'query' => [
                    'url' => $url,
                    'key' => $apiKey,
                    'strategy' => $strategy,
                    'category' => 'performance',
                ],
                'timeout' => 30,
                'http_errors' => false,
            ]);
        } catch (GuzzleException) {
            return null;
        }

        if ($response->getStatusCode() !== 200) {
            return null;
        }

        $data = json_decode((string) $response->getBody(), true);
        $audits = $data['lighthouseResult']['audits'] ?? null;

        if (! is_array($audits)) {
            return null;
        }

        return [
            'lcp' => (float) ($audits['largest-contentful-paint']['numericValue'] ?? 0) / 1000,
            'cls' => (float) ($audits['cumulative-layout-shift']['numericValue'] ?? 0),
            'tbt' => (float) ($audits['total-blocking-time']['numericValue'] ?? 0),
            'performance_score' => (int) round((($data['lighthouseResult']['categories']['performance']['score'] ?? 0)) * 100),
        ];
    }

    /**
     * @param  array{lcp: float, cls: float, tbt: float, performance_score: int}  $metrics
     * @return list<array<string, mixed>>
     */
    private function findingsFor(string $strategy, array $metrics): array
    {
        $findings = [];

        if ($metrics['lcp'] > 4.0) {
            $findings[] = $this->finding('poor_lcp', Priority::Critical, "Largest Contentful Paint zayıf ({$metrics['lcp']}s, {$strategy})", 'LCP 2.5 saniyenin altında olmalı; 4 saniye üzeri "zayıf" olarak değerlendirilir.', 8, $metrics);
        } elseif ($metrics['lcp'] > 2.5) {
            $findings[] = $this->finding('needs_improvement_lcp', Priority::Important, "Largest Contentful Paint iyileştirilmeli ({$metrics['lcp']}s, {$strategy})", 'LCP 2.5 saniyenin altına indirilmeli.', 4, $metrics);
        }

        if ($metrics['cls'] > 0.25) {
            $findings[] = $this->finding('poor_cls', Priority::Critical, "Cumulative Layout Shift zayıf ({$metrics['cls']}, {$strategy})", 'CLS 0.1\'in altında olmalı; 0.25 üzeri "zayıf" olarak değerlendirilir.', 6, $metrics);
        } elseif ($metrics['cls'] > 0.1) {
            $findings[] = $this->finding('needs_improvement_cls', Priority::Important, "Cumulative Layout Shift iyileştirilmeli ({$metrics['cls']}, {$strategy})", 'CLS 0.1\'in altına indirilmeli.', 3, $metrics);
        }

        return $findings;
    }

    /**
     * @param  array<string, mixed>  $evidence
     * @return array<string, mixed>
     */
    private function finding(string $type, Priority $severity, string $title, string $description, int $scoreImpact, array $evidence): array
    {
        return [
            'category' => FindingCategory::Technical,
            'type' => $type,
            'severity' => $severity,
            'title' => $title,
            'description' => $description,
            'evidence' => $evidence,
            'score_impact' => $scoreImpact,
        ];
    }
}
