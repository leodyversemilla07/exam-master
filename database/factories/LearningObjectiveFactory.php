<?php

namespace Database\Factories;

use App\Models\LearningObjective;
use App\Models\Topic;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<LearningObjective>
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
            'topic_id' => Topic::factory(),
            'code' => strtoupper(fake()->unique()->bothify('LO-###')),
            'objective' => fake()->sentence(8),
            'cognitive_level' => fake()->randomElement($cognitiveLevels),
            'order' => fake()->numberBetween(1, 10),
            'assessment_criteria' => fake()->paragraph(),
            'is_active' => true,
        ];
    }
}
