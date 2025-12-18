<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Topic>
 */
class TopicFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'module_id' => \App\Models\Module::factory(),
            'code' => strtoupper(fake()->unique()->bothify('TOP-###')),
            'title' => fake()->sentence(4),
            'description' => fake()->paragraph(),
            'order' => fake()->numberBetween(1, 10),
            'hours_allocated' => fake()->numberBetween(5, 40),
            'weight_percentage' => fake()->numberBetween(10, 30),
            'is_active' => true,
        ];
    }
}
