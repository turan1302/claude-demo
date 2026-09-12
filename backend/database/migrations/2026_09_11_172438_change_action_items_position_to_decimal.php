<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Sürükle-bırak sıralamasında bir kart iki komşu kart arasına
     * bırakıldığında hedef pozisyon komşuların ortalaması olarak
     * hesaplanır ((prev + next) / 2); tamsayı kolonda bitişik
     * pozisyonlar arasına eklenecek değer olmaz, bu yüzden ondalığa
     * geçiyoruz (klasik "fractional indexing" deseni).
     */
    public function up(): void
    {
        DB::statement('ALTER TABLE action_items MODIFY position DECIMAL(14,4) NOT NULL DEFAULT 0');
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE action_items MODIFY position INT NOT NULL DEFAULT 0');
    }
};
