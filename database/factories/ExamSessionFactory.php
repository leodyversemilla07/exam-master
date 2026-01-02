<?php

namespace Database\Factories;

use App\Models\Exam;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ExamSession>
 */
class ExamSessionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'exam_id' => Exam::factory(),
            'created_by' => User::factory(),
            'title' => $this->faker->sentence(3),
            'description' => $this->faker->optional()->paragraph(),
            'access_code' => strtoupper(Str::random(8)),
            'start_time' => now()->subHour(),
            'end_time' => now()->addDays(1),
            'time_limit_minutes' => $this->faker->optional()->randomElement([30, 60, 90, 120]),
            'max_attempts' => $this->faker->numberBetween(1, 3),
            'shuffle_questions' => $this->faker->boolean(),
            'shuffle_options' => $this->faker->boolean(),
            'show_results_immediately' => true,
            'show_correct_answers' => false,
            'allow_review' => true,
            'status' => 'active',
        ];
    }

    /**
     * Indicate the session is active.
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'active',
            'start_time' => now()->subHour(),
            'end_time' => now()->addDays(1),
        ]);
    }

    /**
     * Indicate the session is closed.
     */
    public function closed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'closed',
        ]);
    }
}
