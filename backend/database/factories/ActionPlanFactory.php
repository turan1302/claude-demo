<?php

namespace Database\Factories;

use App\Models\SiteAnalysis;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ActionPlan>
 */
class ActionPlanFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'site_analysis_id' => SiteAnalysis::factory(),
            'summary' => 'Analiz sonucunda tespit edilen bulgulara göre otomatik oluşturulmuş aksiyon planı.',
            'generated_at' => now(),
        ];
    }
}
