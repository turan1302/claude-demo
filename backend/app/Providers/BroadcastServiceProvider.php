<?php

namespace App\Providers;

use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\ServiceProvider;

class BroadcastServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Bu API'de auth tamamen Sanctum Bearer token ile yapılıyor (web/session
        // guard'ı hiç kullanılmıyor); broadcasting/auth route'u da aynı guard'ı
        // kullanmazsa istek her zaman kimliksiz sayılır ve kanal yetkilendirmesi
        // 403 ile başarısız olur.
        Broadcast::routes(['middleware' => ['auth:sanctum']]);

        require base_path('routes/channels.php');
    }
}
