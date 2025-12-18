<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\LearningObjective>
 */
class LearningObjectiveFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $cognitiveLevels = ['remembering', 'understanding', 'applying', 'analyzing', 'evaluating', 'creating'];

        return [
            'topic_id' => \App\Models\Topic::factory(),
            'code' => strtoupper(fake()->unique()->bothify('LO-###')),
            'objective' => fake()->sentence(8),
            'cognitive_level' => fake()->randomElement($cognitiveLevels),
            'order' => fake()->numberBetween(1, 10),
            'assessment_criteria' => fake()->paragraph(),
            'is_active' => true,
        ];
    }
}
