<?php

namespace App\Console\Commands;

use App\Jobs\SendPeriodicReportJob;
use App\Models\ReportSubscription;
use Illuminate\Console\Command;

class SendPeriodicReportsCommand extends Command
{
    /**
     * @var string
     */
    protected $signature = 'app:send-periodic-reports';

    /**
     * @var string
     */
    protected $description = 'Sırası gelen haftalık/aylık rapor aboneliklerini kuyruğa alır.';

    private const DAYS_BY_FREQUENCY = [
        'weekly' => 7,
        'monthly' => 28,
    ];

    public function handle(): void
    {
        $count = 0;

        ReportSubscription::where('is_active', true)->chunkById(200, function ($subscriptions) use (&$count) {
            foreach ($subscriptions as $subscription) {
                if ($this->isDue($subscription)) {
                    SendPeriodicReportJob::dispatch($subscription->id);
                    $count++;
                }
            }
        });

        $this->info("{$count} rapor aboneliği kuyruğa alındı.");
    }

    private function isDue(ReportSubscription $subscription): bool
    {
        if ($subscription->last_sent_at === null) {
            return true;
        }

        $days = self::DAYS_BY_FREQUENCY[$subscription->frequency->value] ?? 7;

        return $subscription->last_sent_at->diffInDays(now()) >= $days;
    }
}
