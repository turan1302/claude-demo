<?php

namespace App\Services\Analysis;

use App\Enums\FindingCategory;
use App\Enums\Priority;
use Symfony\Component\DomCrawler\Crawler;

class StructuredDataDetector
{
    /**
     * @return array{findings: list<array<string, mixed>>, types: list<string>}
     */
    public function analyze(Crawler $crawler): array
    {
        $findings = [];
        $types = [];
        $invalidCount = 0;

        $crawler->filter('script[type="application/ld+json"]')->each(function (Crawler $node) use (&$types, &$invalidCount) {
            $decoded = json_decode($node->text(''), true);

            if (json_last_error() !== JSON_ERROR_NONE || $decoded === null) {
                $invalidCount++;

                return;
            }

            foreach ($this->extractTypes($decoded) as $type) {
                $types[] = $type;
            }
        });

        $types = array_values(array_unique($types));

        if (empty($types) && $invalidCount === 0) {
            $findings[] = $this->finding('no_structured_data', Priority::Important, 'Schema.org / JSON-LD yapılandırılmış veri bulunamadı', 'Yapılandırılmış veri, hem klasik arama sonuçlarında zengin snippet\'lere hem de AI motorlarının içeriği doğru yorumlamasına yardımcı olur.', 6);
        }

        if ($invalidCount > 0) {
            $findings[] = $this->finding('invalid_structured_data', Priority::Important, "{$invalidCount} adet JSON-LD bloğu geçersiz JSON içeriyor", 'Bozuk JSON-LD blokları arama motorları tarafından tamamen yok sayılır.', 4, ['invalid_blocks' => $invalidCount]);
        }

        return ['findings' => $findings, 'types' => $types];
    }

    /**
     * @param  array<mixed>  $decoded
     * @return list<string>
     */
    private function extractTypes(array $decoded): array
    {
        // json_decode bir dizi (array) da dönebilir (birden fazla JSON-LD nesnesi) ya da tek nesne.
        $items = array_is_list($decoded) ? $decoded : [$decoded];
        $types = [];

        foreach ($items as $item) {
            if (! is_array($item)) {
                continue;
            }

            $type = $item['@type'] ?? null;

            if (is_string($type)) {
                $types[] = $type;
            } elseif (is_array($type)) {
                foreach ($type as $t) {
                    if (is_string($t)) {
                        $types[] = $t;
                    }
                }
            }

            if (isset($item['@graph']) && is_array($item['@graph'])) {
                $types = [...$types, ...$this->extractTypes($item['@graph'])];
            }
        }

        return $types;
    }

    /**
     * @param  array<string, mixed>|null  $evidence
     * @return array<string, mixed>
     */
    private function finding(string $type, Priority $severity, string $title, string $description, int $scoreImpact, ?array $evidence = null): array
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
