<?php

namespace App\Services\Analysis;

use App\Enums\FindingCategory;
use App\Enums\Priority;
use Symfony\Component\DomCrawler\Crawler;

class MetaTagAnalyzer
{
    /**
     * @return list<array<string, mixed>>
     */
    public function analyze(Crawler $crawler): array
    {
        $findings = [];

        $title = trim($crawler->filter('title')->first()->text('') ?: '');

        if ($title === '') {
            $findings[] = $this->finding('missing_title', Priority::Critical, 'Sayfa başlığı (<title>) eksik', 'Arama motorları ve AI motorları sayfa başlığını birincil kimlik sinyali olarak kullanır.', 10);
        } elseif (mb_strlen($title) > 60) {
            $findings[] = $this->finding('title_too_long', Priority::Improvement, 'Sayfa başlığı çok uzun ('.mb_strlen($title).' karakter)', 'Arama sonuçlarında 60 karakter üzeri başlıklar kırpılabilir.', 2, ['title' => $title]);
        }

        $description = $this->metaContent($crawler, 'description');

        if ($description === null || $description === '') {
            $findings[] = $this->finding('missing_meta_description', Priority::Critical, 'Meta description eksik', 'Arama sonuçlarında gösterilecek özet metni bulunmuyor, bu tıklama oranını düşürür.', 8);
        } elseif (mb_strlen($description) > 160) {
            $findings[] = $this->finding('meta_description_too_long', Priority::Improvement, 'Meta description çok uzun ('.mb_strlen($description).' karakter)', 'Arama sonuçlarında 160 karakter üzeri açıklamalar kırpılabilir.', 2, ['description' => $description]);
        }

        $ogTitle = $this->metaContent($crawler, 'og:title', 'property');
        $ogDescription = $this->metaContent($crawler, 'og:description', 'property');
        $ogImage = $this->metaContent($crawler, 'og:image', 'property');

        if ($ogTitle === null || $ogDescription === null || $ogImage === null) {
            $findings[] = $this->finding('incomplete_open_graph_tags', Priority::Important, 'Open Graph etiketleri eksik veya yarım', 'Sosyal medyada paylaşımlarda düzgün bir önizleme kartı gösterilmesi için og:title, og:description ve og:image etiketleri gerekir.', 4, [
                'missing' => array_values(array_filter([
                    $ogTitle === null ? 'og:title' : null,
                    $ogDescription === null ? 'og:description' : null,
                    $ogImage === null ? 'og:image' : null,
                ])),
            ]);
        }

        return $findings;
    }

    private function metaContent(Crawler $crawler, string $name, string $attribute = 'name'): ?string
    {
        $node = $crawler->filter("meta[{$attribute}=\"{$name}\"]");

        if ($node->count() === 0) {
            return null;
        }

        $content = trim((string) $node->first()->attr('content'));

        return $content === '' ? null : $content;
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
