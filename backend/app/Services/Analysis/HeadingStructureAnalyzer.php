<?php

namespace App\Services\Analysis;

use App\Enums\FindingCategory;
use App\Enums\Priority;
use Symfony\Component\DomCrawler\Crawler;

class HeadingStructureAnalyzer
{
    /**
     * @return list<array<string, mixed>>
     */
    public function analyze(Crawler $crawler): array
    {
        $findings = [];

        $levels = [];
        foreach (range(1, 6) as $level) {
            $levels[$level] = $crawler->filter("h{$level}")->count();
        }

        if ($levels[1] === 0) {
            $findings[] = $this->finding('missing_h1', Priority::Critical, 'Sayfada H1 başlığı yok', 'H1, sayfanın ana konusunu hem kullanıcıya hem arama/GEO motorlarına bildiren en güçlü sinyaldir.', 8);
        } elseif ($levels[1] > 1) {
            $findings[] = $this->finding('multiple_h1_tags', Priority::Important, "Sayfada {$levels[1]} adet H1 etiketi var", 'Bir sayfada tek bir H1 olması, konu hiyerarşisini netleştirir.', 5, ['h1_count' => $levels[1]]);
        }

        // Basit hiyerarşi atlaması kontrolü: örn. H2 hiç kullanılmadan doğrudan H3'e geçilmesi.
        $usedLevels = array_keys(array_filter($levels, fn (int $count) => $count > 0));
        sort($usedLevels);

        for ($i = 1; $i < count($usedLevels); $i++) {
            if ($usedLevels[$i] - $usedLevels[$i - 1] > 1) {
                $findings[] = $this->finding(
                    'heading_hierarchy_skip',
                    Priority::Improvement,
                    "Başlık hiyerarşisinde atlama var (H{$usedLevels[$i - 1]} sonrası doğrudan H{$usedLevels[$i]})",
                    'Ara seviye başlıkların atlanması hem erişilebilirliği hem içerik yapısının netliğini zayıflatır.',
                    2,
                    ['used_levels' => $usedLevels]
                );
                break;
            }
        }

        return $findings;
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
