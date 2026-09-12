<?php

namespace App\Services\Analysis;

use App\Enums\FindingCategory;
use App\Enums\Priority;

class RobotsSitemapChecker
{
    public function __construct(private readonly HtmlFetcherService $fetcher)
    {
    }

    /**
     * @return list<array<string, mixed>>
     */
    public function check(string $baseUrl): array
    {
        $findings = [];
        $origin = $this->origin($baseUrl);

        $robots = $this->fetcher->fetchOptional("{$origin}/robots.txt");

        if ($robots === null) {
            $findings[] = $this->finding('technical', 'no_robots_txt', Priority::Important, 'robots.txt bulunamadı', 'robots.txt, arama motoru botlarına hangi sayfaları tarayabileceklerini bildirir; eksikliği varsayılan davranışa güvenmeyi zorunlu kılar.', 4);
        } elseif (! str_contains(strtolower($robots), 'sitemap')) {
            $findings[] = $this->finding('technical', 'robots_txt_missing_sitemap_reference', Priority::Improvement, 'robots.txt içinde sitemap referansı yok', 'robots.txt dosyasına "Sitemap:" satırı eklemek arama motorlarının site haritasını daha hızlı bulmasını sağlar.', 2);
        }

        $sitemap = $this->fetcher->fetchOptional("{$origin}/sitemap.xml");

        if ($sitemap === null) {
            $findings[] = $this->finding('technical', 'no_sitemap_xml', Priority::Critical, 'sitemap.xml bulunamadı', 'Site haritası, arama motorlarının sitedeki tüm önemli sayfaları keşfetmesini hızlandırır.', 6);
        } elseif (! str_contains($sitemap, '<urlset') && ! str_contains($sitemap, '<sitemapindex')) {
            $findings[] = $this->finding('technical', 'invalid_sitemap_xml', Priority::Important, 'sitemap.xml geçerli bir XML site haritası gibi görünmüyor', 'Dosya bulundu ancak beklenen <urlset> veya <sitemapindex> kök öğesini içermiyor.', 4);
        }

        return $findings;
    }

    private function origin(string $url): string
    {
        $parts = parse_url($url);

        return sprintf('%s://%s', $parts['scheme'] ?? 'https', $parts['host'] ?? '');
    }

    /**
     * @return array<string, mixed>
     */
    private function finding(string $category, string $type, Priority $severity, string $title, string $description, int $scoreImpact): array
    {
        return [
            'category' => FindingCategory::from($category),
            'type' => $type,
            'severity' => $severity,
            'title' => $title,
            'description' => $description,
            'evidence' => null,
            'score_impact' => $scoreImpact,
        ];
    }
}
