<?php

namespace App\Notifications;

use App\Models\SiteAnalysis;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class CriticalSeoIssueDetected extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly SiteAnalysis $analysis,
        public readonly int $criticalFindingCount,
    ) {
    }

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        // `broadcast` kanalı mevcut Reverb altyapısını kullanır — bildirim
        // zili, routes/channels.php'de zaten kayıtlı olan
        // `private-App.Models.User.{id}` kanalından anlık güncellenir.
        return ['mail', 'database', 'broadcast'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $site = $this->analysis->site;

        return (new MailMessage)
            ->subject("Kritik SEO/GEO sorunu tespit edildi — {$site->name}")
            ->greeting('Merhaba '.$notifiable->name.',')
            ->line("\"{$site->name}\" ({$site->url}) için yapılan analizde {$this->criticalFindingCount} adet kritik önemde sorun tespit edildi.")
            ->action('Analiz Sonuçlarını Gör', url("/sites/{$site->id}/analyses/{$this->analysis->id}"))
            ->line('Bu sorunları aksiyon planınızdan takip edebilirsiniz.');
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $site = $this->analysis->site;

        return [
            'type' => 'critical_seo_issue',
            'site_id' => $site->id,
            'site_name' => $site->name,
            'analysis_id' => $this->analysis->id,
            'critical_finding_count' => $this->criticalFindingCount,
            'message' => "\"{$site->name}\" için {$this->criticalFindingCount} kritik sorun tespit edildi.",
        ];
    }
}
