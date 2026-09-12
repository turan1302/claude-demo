<?php

namespace App\Jobs;

use App\Models\Keyword;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

/**
 * Bir anahtar kelime için sıralama (rank) kontrolü yapar ve yeni bir
 * `keyword_rankings` satırı (snapshot) oluşturur.
 *
 * TODO: Gerçek bir SERP API'si (örn. DataForSEO, SerpApi) bağlanana kadar,
 * bu job GERÇEK arama sonucu verisi ÇEKMEZ — önceki pozisyona göre küçük,
 * gerçekçi görünen bir rastgele değişim uygulayan deterministik olmayan bir
 * mock üretir. Gerçek entegrasyon eklenince SADECE bu sınıfın `resolvePosition()`
 * metodunun içi değişecek; şema, API ve zamanlayıcı zaten hazır.
 */
class CheckKeywordRankingJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public readonly int $keywordId)
    {
    }

    public function handle(): void
    {
        $keyword = Keyword::with('latestRanking')->find($this->keywordId);

        if ($keyword === null || ! $keyword->is_active) {
            return;
        }

        $position = $this->resolvePosition($keyword);

        $keyword->rankings()->create([
            'position' => $position,
            'ranking_url' => $keyword->site->url,
            'checked_at' => now(),
        ]);
    }

    private function resolvePosition(Keyword $keyword): ?int
    {
        $previous = $keyword->latestRanking?->position;

        if ($previous === null) {
            return random_int(5, 60);
        }

        $drift = random_int(-3, 3);
        $next = $previous + $drift;

        // %5 ihtimalle "ilk 100'de bulunamadı" durumunu simüle et.
        if (random_int(1, 100) <= 5) {
            return null;
        }

        return max(1, min(100, $next));
    }
}
