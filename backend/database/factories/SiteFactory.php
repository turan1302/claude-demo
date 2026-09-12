<?php

namespace Database\Factories;

use App\Enums\SiteStatus;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Site>
 */
class SiteFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'url' => 'https://'.fake()->domainName(),
            'name' => fake()->company(),
            'status' => SiteStatus::Pending,
            'last_analyzed_at' => null,
        ];
    }

    public function analyzed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => SiteStatus::Analyzed,
            'last_analyzed_at' => now(),
        ]);
    }
}
