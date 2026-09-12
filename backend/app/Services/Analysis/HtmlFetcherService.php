<?php

namespace App\Services\Analysis;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;
use RuntimeException;

class HtmlFetcherService
{
    private const USER_AGENT = 'Mozilla/5.0 (compatible; SeoGeoManagerBot/1.0; +https://example.com/bot)';

    public function __construct(private readonly Client $client = new Client())
    {
    }

    /**
     * @return array{status_code: int, html: string, headers: array<string, string>, final_url: string, content_type: string}
     */
    public function fetch(string $url): array
    {
        try {
            $response = $this->client->get($url, [
                'headers' => ['User-Agent' => self::USER_AGENT],
                'timeout' => 20,
                'connect_timeout' => 10,
                'allow_redirects' => ['max' => 5, 'track_redirects' => true],
                'http_errors' => false,
            ]);
        } catch (GuzzleException $e) {
            throw new RuntimeException("Site erişilemedi: {$e->getMessage()}", previous: $e);
        }

        $statusCode = $response->getStatusCode();

        if ($statusCode >= 400) {
            throw new RuntimeException("Site {$statusCode} HTTP durum kodu döndürdü.");
        }

        $redirects = $response->getHeader('X-Guzzle-Redirect-History');
        $finalUrl = ! empty($redirects) ? end($redirects) : $url;

        return [
            'status_code' => $statusCode,
            'html' => (string) $response->getBody(),
            'headers' => array_map(fn (array $v) => implode(', ', $v), $response->getHeaders()),
            'final_url' => $finalUrl,
            'content_type' => $response->getHeaderLine('Content-Type'),
        ];
    }

    /**
     * robots.txt / sitemap.xml gibi yardımcı dosyalar için basit GET; 404 dahil hiçbir
     * durumda exception fırlatmaz, sadece null döner — bu dosyaların yokluğu bir bulgudur,
     * bir hata değildir.
     */
    public function fetchOptional(string $url): ?string
    {
        try {
            $response = $this->client->get($url, [
                'headers' => ['User-Agent' => self::USER_AGENT],
                'timeout' => 10,
                'http_errors' => false,
            ]);
        } catch (GuzzleException) {
            return null;
        }

        return $response->getStatusCode() === 200 ? (string) $response->getBody() : null;
    }
}
