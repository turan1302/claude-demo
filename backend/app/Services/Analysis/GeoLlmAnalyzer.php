<?php

namespace App\Services\Analysis;

use App\Enums\FindingCategory;
use App\Enums\FindingSource;
use App\Enums\IntegrationProvider;
use App\Enums\Priority;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;
use Illuminate\Support\Str;

/**
 * Kullanıcının opsiyonel olarak eklediği bir LLM API key'i (Anthropic ya da
 * OpenAI) varsa, çıkarılan sayfa içeriğini sabit bir GEO/E-E-A-T
 * değerlendirme rubriği ile bu modele gönderip yapılandırılmış ek bulgular
 * üretir. Key yoksa bu adım zaten hiç çağrılmaz (bkz. RunGeoLlmJob).
 */
class GeoLlmAnalyzer
{
    private const MAX_CONTENT_CHARS = 6000;

    private const RUBRIC = <<<'PROMPT'
        Bir SEO/GEO (Generative Engine Optimization) uzmanı olarak aşağıdaki web
        sayfası içeriğini değerlendir. Şu kriterlere göre puanla:
        - İçerik net, doğrudan cevaplar sunuyor mu?
        - E-E-A-T sinyalleri (deneyim, uzmanlık, güvenilirlik, otorite) güçlü mü?
        - İçerik bir AI arama motoru (ChatGPT, Perplexity, Google AI Overview) tarafından
          kolayca alıntılanabilecek şekilde yapılandırılmış mı?

        SADECE aşağıdaki JSON şemasına uyan bir dizi döndür, başka hiçbir metin ekleme:
        [
          {
            "type": "kisa_snake_case_tanimlayici",
            "severity": "critical" | "important" | "improvement",
            "title": "Kısa başlık (Türkçe)",
            "description": "1-2 cümlelik açıklama ve öneri (Türkçe)",
            "score_impact": 1-10 arası bir tam sayı
          }
        ]

        En fazla 5 bulgu döndür. Sayfa içeriği:
        ---
        PROMPT;

    public function __construct(private readonly Client $client = new Client())
    {
    }

    /**
     * @return list<array<string, mixed>>
     */
    public function analyze(string $content, IntegrationProvider $provider, string $apiKey): array
    {
        $prompt = self::RUBRIC."\n".Str::limit($content, self::MAX_CONTENT_CHARS, '');

        $raw = match ($provider) {
            IntegrationProvider::Anthropic => $this->callAnthropic($prompt, $apiKey),
            IntegrationProvider::Openai => $this->callOpenai($prompt, $apiKey),
            default => null,
        };

        if ($raw === null) {
            return [];
        }

        return $this->parseFindings($raw);
    }

    private function callAnthropic(string $prompt, string $apiKey): ?string
    {
        try {
            $response = $this->client->post('https://api.anthropic.com/v1/messages', [
                'headers' => [
                    'x-api-key' => $apiKey,
                    'anthropic-version' => '2023-06-01',
                    'content-type' => 'application/json',
                ],
                'json' => [
                    'model' => 'claude-3-5-haiku-latest',
                    'max_tokens' => 1024,
                    'messages' => [['role' => 'user', 'content' => $prompt]],
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

        return $data['content'][0]['text'] ?? null;
    }

    private function callOpenai(string $prompt, string $apiKey): ?string
    {
        try {
            $response = $this->client->post('https://api.openai.com/v1/chat/completions', [
                'headers' => [
                    'Authorization' => "Bearer {$apiKey}",
                    'content-type' => 'application/json',
                ],
                'json' => [
                    'model' => 'gpt-4o-mini',
                    'messages' => [['role' => 'user', 'content' => $prompt]],
                    'response_format' => ['type' => 'json_object'],
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

        return $data['choices'][0]['message']['content'] ?? null;
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function parseFindings(string $raw): array
    {
        $json = trim($raw);
        // Bazı modeller JSON'ı ```json ... ``` bloğuna sarabiliyor; temizle.
        $json = preg_replace('/^```(?:json)?|```$/m', '', $json);

        $decoded = json_decode(trim($json), true);

        if (! is_array($decoded)) {
            return [];
        }

        // OpenAI json_object modu bazen {"findings": [...]} gibi bir sarmalayıcı döndürür.
        if (! array_is_list($decoded)) {
            $decoded = $decoded['findings'] ?? $decoded['results'] ?? [];
        }

        $findings = [];

        foreach ($decoded as $item) {
            if (! is_array($item) || ! isset($item['type'], $item['severity'], $item['title'], $item['description'])) {
                continue;
            }

            $severity = Priority::tryFrom($item['severity']);

            if ($severity === null) {
                continue;
            }

            $findings[] = [
                'category' => FindingCategory::Geo,
                'type' => Str::slug((string) $item['type'], '_'),
                'source' => FindingSource::Llm,
                'severity' => $severity,
                'title' => (string) $item['title'],
                'description' => (string) $item['description'],
                'evidence' => null,
                'score_impact' => max(1, min(10, (int) ($item['score_impact'] ?? 3))),
            ];
        }

        return $findings;
    }
}
