<?php

namespace Database\Factories;

use App\Models\Exam;
use App\Models\Module;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Exam>
 */
class ExamFactory extends Factory
{
    /**
     * Define the model's default state.
     */
    public function definition(): array
    {
        return [
            'module_id' => Module::factory(),
            'tos_generate_id' => null,
            'created_by' => User::factory(),
            'title' => fake()->sentence(5),
            'description' => fake()->paragraph(),
            'exam_type' => fake()->randomElement(['formative', 'summative', 'diagnostic']),
            'time_limit' => fake()->randomElement([30, 45, 60, 90, 120]),
            'passing_score' => fake()->randomFloat(2, 60, 80),
            'instructions' => fake()->paragraph(),
            'total_points' => 0,
            'total_items' => 0,
            'status' => 'draft',
            'shuffle_questions' => fake()->boolean(),
            'show_answers' => fake()->boolean(30),
            'metadata' => null,
        ];
    }

    /**
     * Indicate that the exam is published.
     */
    public function published(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'published',
        ]);
    }

    /**
     * Indicate that the exam is archived.
     */
    public function archived(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'archived',
        ]);
    }
}
