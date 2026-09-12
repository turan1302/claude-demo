<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command schedule.
     */
    protected function schedule(Schedule $schedule): void
    {
        $schedule->command('app:check-keyword-rankings')->daily();
        $schedule->command('app:send-periodic-reports')->daily();

        // Paylaşımlı hosting'de sürekli çalışan bir `queue:work` daemonu
        // barındırılamaz (systemd/supervisor yok); bunun yerine kuyruk her
        // dakika kısaca işletilip mevcut işler bitince kendiliğinden kapanır.
        $schedule->command('queue:work --stop-when-empty --tries=1')
            ->everyMinute()
            ->withoutOverlapping();
    }

    /**
     * Register the commands for the application.
     */
    protected function commands(): void
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}
