<?php

namespace App\Services\Analysis;

use App\Enums\FindingCategory;
use App\Enums\Priority;
use Symfony\Component\DomCrawler\Crawler;

/**
 * Kural bazlı (heuristic) GEO — Generative Engine Optimization — analizörü.
 * Bir LLM'e hiç ihtiyaç duymadan, içeriğin AI arama motorları (ChatGPT,
 * Perplexity, Google AI Overview vb.) tarafından "alıntılanabilirliğini"
 * artıran yapısal sinyalleri kontrol eder.
 */
class GeoHeuristicAnalyzer
{
    private const QUESTION_STARTERS = ['nasıl', 'neden', 'ne ', 'nedir', 'kim', 'hangi', 'how', 'what', 'why', 'when', 'who', 'which'];

    /**
     * @param  list<string>  $structuredDataTypes  StructuredDataDetector tarafından tespit edilen @type değerleri.
     * @return list<array<string, mixed>>
     */
    public function analyze(Crawler $crawler, array $structuredDataTypes, int $externalLinkCount): array
    {
        $findings = [];

        $firstParagraph = $crawler->filter('p')->count() > 0
            ? trim($crawler->filter('p')->first()->text(''))
            : '';

        if (mb_strlen($firstParagraph) < 40) {
            $findings[] = $this->finding('no_direct_answer_paragraph', Priority::Important, 'İçerikte net, doğrudan cevap veren bir açılış paragrafı yok', 'AI arama motorları, konunun net bir şekilde özetlendiği açılış paragraflarını alıntılamayı tercih eder.', 7);
        }

        $headings = $crawler->filter('h2, h3, h4');
        $questionHeadings = 0;
        $headings->each(function (Crawler $node) use (&$questionHeadings) {
            $text = mb_strtolower(trim($node->text('')));
            $isQuestion = str_ends_with(trim($node->text('')), '?')
                || collect(self::QUESTION_STARTERS)->contains(fn (string $starter) => str_starts_with($text, $starter));

            if ($isQuestion) {
                $questionHeadings++;
            }
        });

        if ($headings->count() > 0 && $questionHeadings === 0) {
            $findings[] = $this->finding('no_question_style_headings', Priority::Improvement, 'Soru biçiminde başlık kullanılmamış', 'AI arama motorları, kullanıcı sorularına doğrudan karşılık gelen soru biçimindeki başlıkları öncelikli olarak alıntılar.', 3);
        }

        $hasByline = $crawler->filter('[class*="author"], [rel="author"], time[datetime], meta[property="article:author"], meta[property="article:published_time"]')->count() > 0;

        if (! $hasByline) {
            $findings[] = $this->finding('missing_author_byline', Priority::Improvement, 'Yazar veya yayın tarihi bilgisi (E-E-A-T sinyali) eksik', 'Yazar/kaynak ve tarih bilgisi, içeriğin güvenilirliğini değerlendiren AI motorları için önemli bir E-E-A-T sinyalidir.', 3);
        }

        $hasStructuredLists = $crawler->filter('ul, ol, table')->count() > 0;

        if (! $hasStructuredLists) {
            $findings[] = $this->finding('no_structured_content_blocks', Priority::Improvement, 'İçerikte liste veya tablo gibi yapılandırılmış bloklar yok', 'Liste ve tablolar, AI motorlarının içeriği ayrıştırıp doğrudan cevap olarak sunmasını kolaylaştırır.', 3);
        }

        $hasCitationElements = $crawler->filter('blockquote, cite')->count() > 0;

        if (! $hasCitationElements && $externalLinkCount === 0) {
            $findings[] = $this->finding('no_source_citations', Priority::Important, 'İçerikte kaynak gösterimi (alıntı/dış bağlantı) yok', 'Dış kaynaklara referans vermek, içeriğin doğrulanabilirliğini ve GEO güvenilirliğini artırır.', 5);
        }

        $geoFriendlyTypes = ['FAQPage', 'HowTo', 'QAPage', 'Article', 'NewsArticle', 'BlogPosting'];
        if (empty(array_intersect($structuredDataTypes, $geoFriendlyTypes))) {
            $findings[] = $this->finding('no_geo_friendly_schema', Priority::Improvement, 'FAQPage/HowTo/Article gibi GEO dostu schema türleri yok', 'Bu schema türleri, AI motorlarının içeriği doğrudan soru-cevap formatında sunmasını kolaylaştırır.', 3);
        }

        return $findings;
    }

    /**
     * @return array<string, mixed>
     */
    private function finding(string $type, Priority $severity, string $title, string $description, int $scoreImpact): array
    {
        return [
            'category' => FindingCategory::Geo,
            'type' => $type,
            'severity' => $severity,
            'title' => $title,
            'description' => $description,
            'evidence' => null,
            'score_impact' => $scoreImpact,
        ];
    }
}
