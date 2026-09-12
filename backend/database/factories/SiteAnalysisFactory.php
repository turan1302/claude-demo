<?php

namespace Database\Factories;

use App\Enums\AnalysisStatus;
use App\Models\Site;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\SiteAnalysis>
 */
class SiteAnalysisFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'site_id' => Site::factory(),
            'version' => 1,
            'status' => AnalysisStatus::Completed,
            'current_step' => null,
            'overall_seo_score' => fake()->numberBetween(40, 95),
            'overall_geo_score' => fake()->numberBetween(30, 90),
            'core_web_vitals' => [
                'mobile' => ['lcp' => 2.4, 'cls' => 0.05, 'inp' => 180],
                'desktop' => ['lcp' => 1.6, 'cls' => 0.02, 'inp' => 90],
            ],
            'raw_data' => ['status_code' => 200, 'content_type' => 'text/html; charset=UTF-8'],
            'error_message' => null,
            'started_at' => now()->subMinutes(3),
            'completed_at' => now(),
        ];
    }

    public function queued(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => AnalysisStatus::Queued,
            'overall_seo_score' => null,
            'overall_geo_score' => null,
            'core_web_vitals' => null,
            'raw_data' => null,
            'started_at' => null,
            'completed_at' => null,
        ]);
    }
}
