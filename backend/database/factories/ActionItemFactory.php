<?php

namespace Database\Factories;

use App\Enums\ActionItemStatus;
use App\Enums\EstimatedImpact;
use App\Enums\FindingCategory;
use App\Enums\Priority;
use App\Models\ActionPlan;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ActionItem>
 */
class ActionItemFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'action_plan_id' => ActionPlan::factory(),
            'analysis_finding_id' => null,
            'category' => fake()->randomElement(FindingCategory::cases()),
            'priority' => fake()->randomElement(Priority::cases()),
            'title' => fake()->sentence(6),
            'description' => fake()->sentence(15),
            'estimated_impact' => fake()->randomElement(EstimatedImpact::cases()),
            'status' => ActionItemStatus::Pending,
            'position' => 0,
            'completed_at' => null,
        ];
    }

    public function completed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => ActionItemStatus::Completed,
            'completed_at' => now(),
        ]);
    }
}
