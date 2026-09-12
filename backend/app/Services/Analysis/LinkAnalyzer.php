<?php

namespace App\Services\Analysis;

use App\Enums\FindingCategory;
use App\Enums\Priority;
use Symfony\Component\DomCrawler\Crawler;

class LinkAnalyzer
{
    /**
     * @return array{findings: list<array<string, mixed>>, internal_links: int, external_links: int}
     */
    public function analyze(Crawler $crawler, string $baseUrl): array
    {
        $findings = [];
        $host = parse_url($baseUrl, PHP_URL_HOST);

        $internal = 0;
        $external = 0;

        $crawler->filter('a[href]')->each(function (Crawler $node) use (&$internal, &$external, $host) {
            $href = trim((string) $node->attr('href'));

            if ($href === '' || str_starts_with($href, '#') || str_starts_with($href, 'mailto:') || str_starts_with($href, 'tel:') || str_starts_with($href, 'javascript:')) {
                return;
            }

            $linkHost = parse_url($href, PHP_URL_HOST);

            if ($linkHost === null || $linkHost === $host) {
                $internal++;
            } else {
                $external++;
            }
        });

        if ($internal === 0) {
            $findings[] = $this->finding('no_internal_links', Priority::Critical, 'Sayfada iç bağlantı (internal link) yok', 'İç bağlantılar arama motorlarının sitenizi taramasına ve kullanıcıların ilgili içeriklere ulaşmasına yardımcı olur.', 6, ['internal_links' => 0]);
        }

        if ($external === 0) {
            $findings[] = $this->finding('no_external_links', Priority::Improvement, 'Sayfada dış kaynağa bağlantı yok', 'Güvenilir dış kaynaklara referans vermek, hem SEO hem GEO açısından içeriğin güvenilirliğini (E-E-A-T) güçlendirir.', 2, ['external_links' => 0]);
        }

        return ['findings' => $findings, 'internal_links' => $internal, 'external_links' => $external];
    }

    /**
     * @param  array<string, mixed>|null  $evidence
     * @return array<string, mixed>
     */
    private function finding(string $type, Priority $severity, string $title, string $description, int $scoreImpact, ?array $evidence = null): array
    {
        return [
            'category' => FindingCategory::Seo,
            'type' => $type,
            'severity' => $severity,
            'title' => $title,
            'description' => $description,
            'evidence' => $evidence,
            'score_impact' => $scoreImpact,
        ];
    }
}
