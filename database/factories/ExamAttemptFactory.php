<?php

namespace Database\Factories;

use App\Models\ExamAttempt;
use App\Models\ExamSession;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ExamAttempt>
 */
class ExamAttemptFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'exam_session_id' => ExamSession::factory(),
            'user_id' => User::factory(),
            'attempt_number' => 1,
            'started_at' => now(),
            'submitted_at' => null,
            'time_spent_seconds' => $this->faker->numberBetween(300, 7200),
            'score' => null,
            'percentage' => null,
            'correct_answers' => 0,
            'total_questions' => 0,
            'status' => 'in_progress',
        ];
    }

    /**
     * Indicate the attempt has been submitted.
     */
    public function submitted(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'submitted',
            'submitted_at' => now(),
            'score' => $this->faker->numberBetween(0, 100),
            'percentage' => $this->faker->numberBetween(0, 100),
            'correct_answers' => $this->faker->numberBetween(0, 20),
            'total_questions' => 20,
        ]);
    }

    /**
     * Indicate the attempt has been graded.
     */
    public function graded(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'graded',
            'submitted_at' => now(),
            'score' => $this->faker->numberBetween(0, 100),
            'percentage' => $this->faker->numberBetween(0, 100),
            'correct_answers' => $this->faker->numberBetween(0, 20),
            'total_questions' => 20,
        ]);
    }
}
