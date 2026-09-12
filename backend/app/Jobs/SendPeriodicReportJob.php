<?php

namespace App\Jobs;

use App\Mail\PeriodicReportMail;
use App\Models\ReportSubscription;
use App\Services\Reports\ReportDataBuilder;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;

class SendPeriodicReportJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public readonly int $subscriptionId)
    {
    }

    public function handle(ReportDataBuilder $builder): void
    {
        $subscription = ReportSubscription::with('user')->find($this->subscriptionId);

        if ($subscription === null || ! $subscription->is_active) {
            return;
        }

        $data = $builder->build($subscription);

        Mail::to($subscription->user->email)->send(new PeriodicReportMail($data, $subscription->format));

        $subscription->update(['last_sent_at' => now()]);
    }
}
