<?php

namespace Database\Factories;

use App\Models\Module;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\TosGenerate>
 */
class TosGenerateFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'module_id' => Module::factory(),
            'created_by' => User::factory(),
            'grade_level' => $this->faker->randomElement(['Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12']),
            'subject' => $this->faker->randomElement(['Mathematics', 'Science', 'English', 'History', 'Computer Science']),
            'quarter' => $this->faker->randomElement(['First Quarter', 'Second Quarter', 'Third Quarter', 'Fourth Quarter']),
            'total_items' => $this->faker->numberBetween(20, 50),
            'learning_objectives' => [
                [
                    'code' => 'LO-1',
                    'description' => $this->faker->sentence(),
                    'weight' => 30,
                ],
                [
                    'code' => 'LO-2',
                    'description' => $this->faker->sentence(),
                    'weight' => 40,
                ],
                [
                    'code' => 'LO-3',
                    'description' => $this->faker->sentence(),
                    'weight' => 30,
                ],
            ],
            'cognitive_levels' => [
                'remembering' => 20,
                'understanding' => 20,
                'applying' => 20,
                'analyzing' => 15,
                'evaluating' => 15,
                'creating' => 10,
            ],
            'question_types' => [
                'multiple_choice' => 30,
                'true_false' => 10,
                'identification' => 10,
            ],
            'item_distribution' => [],
            'difficulty_level' => $this->faker->randomElement(['easy', 'moderate', 'difficult', 'mixed']),
            'language' => $this->faker->randomElement(['english', 'filipino']),
            'additional_instructions' => $this->faker->optional()->sentence(),
            'status' => 'draft',
            'error_message' => null,
        ];
    }

    /**
     * Indicate that the TOS is completed.
     */
    public function completed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'completed',
        ]);
    }

    /**
     * Indicate that the TOS is generating.
     */
    public function generating(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'generating',
        ]);
    }

    /**
     * Indicate that the TOS failed.
     */
    public function failed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'failed',
            'error_message' => 'Generation failed due to an error.',
        ]);
    }
}
