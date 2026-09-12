<?php

namespace App\Services\Analysis;

use App\Enums\ActionItemStatus;
use App\Enums\EstimatedImpact;
use App\Enums\Priority;
use App\Models\ActionPlan;
use App\Models\SiteAnalysis;

class ActionPlanGenerator
{
    /**
     * Bilinen bulgu tiplerini somut, uygulanabilir aksiyon maddelerine çevirir.
     * Haritada olmayan bir tip (örn. LLM'in ürettiği dinamik tipler) bulgunun
     * kendi başlık/açıklamasına düşer — bu da zaten LLM tarafından yeterince
     * aksiyona dönük üretilmiş olur.
     *
     * @var array<string, array{title: string, description: string}>
     */
    private const TEMPLATES = [
        'missing_title' => ['title' => 'Sayfa başlığı (<title>) ekleyin', 'description' => 'Sayfanın ana konusunu özetleyen, 50-60 karakter uzunluğunda benzersiz bir <title> etiketi ekleyin.'],
        'title_too_long' => ['title' => 'Sayfa başlığını kısaltın', 'description' => 'Başlığı arama sonuçlarında kırpılmayacak şekilde 60 karakterin altına indirin.'],
        'missing_meta_description' => ['title' => 'Meta description ekleyin', 'description' => 'Sayfayı özetleyen, 120-160 karakter uzunluğunda bir meta description yazın.'],
        'meta_description_too_long' => ['title' => 'Meta description\'ı kısaltın', 'description' => 'Açıklamayı arama sonuçlarında kırpılmayacak şekilde 160 karakterin altına indirin.'],
        'incomplete_open_graph_tags' => ['title' => 'Open Graph etiketlerini tamamlayın', 'description' => 'og:title, og:description ve og:image etiketlerinin tümünü ekleyerek sosyal medya paylaşım kartını iyileştirin.'],
        'missing_h1' => ['title' => 'Sayfaya bir H1 başlığı ekleyin', 'description' => 'Sayfanın ana konusunu net şekilde ifade eden tek bir H1 etiketi ekleyin.'],
        'multiple_h1_tags' => ['title' => 'Birden fazla H1 etiketini tekilleştirin', 'description' => 'Sayfada yalnızca bir H1 kalacak şekilde diğer başlıkları H2/H3 seviyesine indirin.'],
        'heading_hierarchy_skip' => ['title' => 'Başlık hiyerarşisindeki atlamaları giderin', 'description' => 'Ara seviye başlık seviyelerini atlamadan (H2 -> H3 -> H4) sıralı bir yapı kurun.'],
        'no_internal_links' => ['title' => 'İç bağlantılar (internal link) ekleyin', 'description' => 'Site içindeki ilgili sayfalara bağlantı vererek hem kullanıcı deneyimini hem taranabilirliği artırın.'],
        'no_external_links' => ['title' => 'Güvenilir dış kaynaklara bağlantı verin', 'description' => 'İddialarınızı destekleyen otoriter dış kaynaklara referans ekleyin.'],
        'no_robots_txt' => ['title' => 'robots.txt dosyası oluşturun', 'description' => 'Site köküne, tarama kurallarını ve sitemap referansını içeren bir robots.txt dosyası ekleyin.'],
        'robots_txt_missing_sitemap_reference' => ['title' => 'robots.txt dosyasına sitemap referansı ekleyin', 'description' => 'robots.txt içine "Sitemap: https://.../sitemap.xml" satırını ekleyin.'],
        'no_sitemap_xml' => ['title' => 'sitemap.xml oluşturun', 'description' => 'Sitenizdeki tüm önemli sayfaları listeleyen bir XML site haritası oluşturup yayınlayın.'],
        'invalid_sitemap_xml' => ['title' => 'sitemap.xml dosyasını düzeltin', 'description' => 'Dosyanın geçerli bir <urlset> veya <sitemapindex> kök öğesi içerdiğinden emin olun.'],
        'no_structured_data' => ['title' => 'Schema.org / JSON-LD yapılandırılmış veri ekleyin', 'description' => 'İçerik tipinize uygun (Article, Product, FAQPage vb.) JSON-LD işaretlemesi ekleyin.'],
        'invalid_structured_data' => ['title' => 'Bozuk JSON-LD bloklarını düzeltin', 'description' => 'Geçersiz JSON-LD içeriğini bir doğrulayıcıdan (schema.org validator) geçirerek düzeltin.'],
        'poor_lcp' => ['title' => 'Largest Contentful Paint\'i iyileştirin', 'description' => 'Büyük görselleri optimize edin, kritik CSS\'i öne alın ve sunucu yanıt süresini kısaltın.'],
        'needs_improvement_lcp' => ['title' => 'Largest Contentful Paint\'i iyileştirin', 'description' => 'Görsel boyutlarını küçültün ve render-blocking kaynakları azaltın.'],
        'poor_cls' => ['title' => 'Cumulative Layout Shift\'i azaltın', 'description' => 'Görsel/reklam alanlarına sabit boyut tanımlayın ve dinamik içerik eklemelerini üstten yapmaktan kaçının.'],
        'needs_improvement_cls' => ['title' => 'Cumulative Layout Shift\'i azaltın', 'description' => 'Sayfa yüklenirken boyut değişen öğelere önceden yer ayırın.'],
        'no_direct_answer_paragraph' => ['title' => 'Açılışa net bir özet paragraf ekleyin', 'description' => 'Sayfanın en başına, konuyu 2-3 cümlede doğrudan yanıtlayan bir paragraf ekleyin.'],
        'no_question_style_headings' => ['title' => 'Soru biçiminde alt başlıklar ekleyin', 'description' => 'Kullanıcıların arayabileceği soruları (örn. "X nedir?") alt başlık olarak kullanın.'],
        'missing_author_byline' => ['title' => 'Yazar ve yayın tarihi bilgisi ekleyin', 'description' => 'İçeriğe yazar adı, uzmanlık bilgisi ve yayın/güncelleme tarihi ekleyerek E-E-A-T sinyalini güçlendirin.'],
        'no_structured_content_blocks' => ['title' => 'İçeriğe liste veya tablo ekleyin', 'description' => 'Uygun yerlerde madde işaretli listeler veya tablolar kullanarak içeriği daha kolay ayrıştırılabilir hale getirin.'],
        'no_source_citations' => ['title' => 'Kaynak gösterimi ekleyin', 'description' => 'İddialarınızı destekleyen alıntılar veya dış kaynaklara bağlantılar ekleyin.'],
        'no_geo_friendly_schema' => ['title' => 'FAQPage/HowTo gibi GEO dostu schema ekleyin', 'description' => 'İçeriğinize uygun soru-cevap veya adım adım schema işaretlemesi ekleyin.'],
    ];

    private const IMPACT_BY_SEVERITY = [
        'critical' => EstimatedImpact::High,
        'important' => EstimatedImpact::Medium,
        'improvement' => EstimatedImpact::Low,
    ];

    public function generate(SiteAnalysis $analysis): ActionPlan
    {
        $plan = $analysis->actionPlans()->create([
            'summary' => 'Bu analizde tespit edilen bulgulara göre otomatik oluşturulmuş, önceliklendirilmiş aksiyon planı.',
            'generated_at' => now(),
        ]);

        $findings = $analysis->findings()
            ->get()
            ->sortBy(fn ($finding) => match ($finding->severity) {
                Priority::Critical => 0,
                Priority::Important => 1,
                Priority::Improvement => 2,
            })
            ->values();

        foreach ($findings as $index => $finding) {
            $template = self::TEMPLATES[$finding->type] ?? null;

            $plan->items()->create([
                'analysis_finding_id' => $finding->id,
                'category' => $finding->category,
                'priority' => $finding->severity,
                'title' => $template['title'] ?? $finding->title,
                'description' => $template['description'] ?? $finding->description,
                'estimated_impact' => self::IMPACT_BY_SEVERITY[$finding->severity->value],
                'status' => ActionItemStatus::Pending,
                'position' => $index,
            ]);
        }

        return $plan;
    }
}
