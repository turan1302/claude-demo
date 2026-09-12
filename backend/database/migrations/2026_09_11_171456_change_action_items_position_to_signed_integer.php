<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * "Başa al" ile tekrar tekrar en öne taşınan maddeler pozisyonu
     * negatife düşürebilir (min(pozisyon) - 1); unsigned kolon bunu
     * reddeder, bu yüzden signed'a çeviriyoruz.
     */
    public function up(): void
    {
        DB::statement('ALTER TABLE action_items MODIFY position INT NOT NULL DEFAULT 0');
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE action_items MODIFY position INT UNSIGNED NOT NULL DEFAULT 0');
    }
};
