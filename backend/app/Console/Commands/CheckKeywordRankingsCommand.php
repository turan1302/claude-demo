<?php

namespace App\Console\Commands;

use App\Jobs\CheckKeywordRankingJob;
use App\Models\Keyword;
use Illuminate\Console\Command;

class CheckKeywordRankingsCommand extends Command
{
    /**
     * @var string
     */
    protected $signature = 'app:check-keyword-rankings';

    /**
     * @var string
     */
    protected $description = 'Aktif tüm anahtar kelimeler için sıralama kontrolünü kuyruğa alır.';

    public function handle(): void
    {
        $count = 0;

        Keyword::where('is_active', true)->select('id')->chunkById(200, function ($keywords) use (&$count) {
            foreach ($keywords as $keyword) {
                CheckKeywordRankingJob::dispatch($keyword->id);
                $count++;
            }
        });

        $this->info("{$count} anahtar kelime için sıralama kontrolü kuyruğa alındı.");
    }
}
