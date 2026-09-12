<?php

namespace Database\Factories;

use App\Enums\FindingCategory;
use App\Enums\FindingSource;
use App\Enums\Priority;
use App\Models\SiteAnalysis;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\AnalysisFinding>
 */
class AnalysisFindingFactory extends Factory
{
    /**
     * Representative finding types, grouped by category, used both by this
     * factory and mirrored by ActionPlanGenerator's real template table.
     */
    public const SAMPLE_FINDINGS = [
        ['category' => 'seo', 'type' => 'missing_meta_description', 'severity' => 'critical', 'title' => 'Meta description eksik', 'impact' => 8],
        ['category' => 'seo', 'type' => 'multiple_h1_tags', 'severity' => 'important', 'title' => 'Sayfada birden fazla H1 etiketi var', 'impact' => 5],
        ['category' => 'seo', 'type' => 'missing_alt_text', 'severity' => 'improvement', 'title' => 'Görsellerde alt metni eksik', 'impact' => 2],
        ['category' => 'technical', 'type' => 'no_sitemap_xml', 'severity' => 'critical', 'title' => 'sitemap.xml bulunamadı', 'impact' => 10],
        ['category' => 'technical', 'type' => 'no_structured_data', 'severity' => 'important', 'title' => 'Schema.org / JSON-LD yapılandırılmış veri yok', 'impact' => 6],
        ['category' => 'geo', 'type' => 'no_direct_answer_paragraph', 'severity' => 'important', 'title' => 'İçerikte net, doğrudan cevap veren bir paragraf yok', 'impact' => 7],
        ['category' => 'geo', 'type' => 'missing_author_byline', 'severity' => 'improvement', 'title' => 'Yazar/kaynak bilgisi (E-E-A-T sinyali) eksik', 'impact' => 3],
        ['category' => 'content', 'type' => 'thin_content', 'severity' => 'important', 'title' => 'İçerik hacmi düşük', 'impact' => 6],
    ];

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $sample = fake()->randomElement(self::SAMPLE_FINDINGS);

        return [
            'site_analysis_id' => SiteAnalysis::factory(),
            'category' => FindingCategory::from($sample['category']),
            'type' => $sample['type'],
            'source' => FindingSource::Rule,
            'severity' => Priority::from($sample['severity']),
            'title' => $sample['title'],
            'description' => fake()->sentence(12),
            'evidence' => null,
            'score_impact' => $sample['impact'],
        ];
    }
}
