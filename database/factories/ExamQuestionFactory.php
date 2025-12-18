<?php

namespace Database\Factories;

use App\Models\Module;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ExamQuestion>
 */
class ExamQuestionFactory extends Factory
{
    /**
     * Define the model's default state.
     */
    public function definition(): array
    {
        $questionTypes = ['multiple_choice', 'true_false', 'identification', 'essay', 'short_answer'];
        $cognitiveLevels = ['remembering', 'understanding', 'applying', 'analyzing', 'evaluating', 'creating'];
        $difficulties = ['easy', 'medium', 'hard'];
        $type = fake()->randomElement($questionTypes);

        $options = $type === 'multiple_choice' ? [
            'A' => fake()->sentence(),
            'B' => fake()->sentence(),
            'C' => fake()->sentence(),
            'D' => fake()->sentence(),
        ] : null;

        return [
            'module_id' => Module::factory(),
            'tos_generate_id' => null,
            'created_by' => User::factory(),
            'question_type' => $type,
            'question' => fake()->sentence(15).'?',
            'options' => $options,
            'correct_answer' => $type === 'multiple_choice' ? fake()->randomElement(['A', 'B', 'C', 'D']) : fake()->word(),
            'explanation' => fake()->sentence(20),
            'cognitive_level' => fake()->randomElement($cognitiveLevels),
            'difficulty' => fake()->randomElement($difficulties),
            'learning_objective_code' => strtoupper(fake()->lexify('???-###')),
            'points' => fake()->numberBetween(1, 5),
            'is_approved' => fake()->boolean(70),
            'is_ai_generated' => fake()->boolean(30),
            'ai_metadata' => null,
        ];
    }

    /**
     * Indicate the question is approved.
     */
    public function approved(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_approved' => true,
        ]);
    }

    /**
     * Indicate the question is AI-generated.
     */
    public function aiGenerated(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_ai_generated' => true,
            'ai_metadata' => json_encode([
                'provider' => fake()->randomElement(['openai', 'gemini', 'anthropic']),
                'model' => 'gpt-4o-mini',
                'generated_at' => now()->toIso8601String(),
            ]),
        ]);
    }

    /**
     * Indicate the question is multiple choice.
     */
    public function multipleChoice(): static
    {
        return $this->state(fn (array $attributes) => [
            'question_type' => 'multiple_choice',
            'options' => [
                'A' => fake()->sentence(),
                'B' => fake()->sentence(),
                'C' => fake()->sentence(),
                'D' => fake()->sentence(),
            ],
            'correct_answer' => fake()->randomElement(['A', 'B', 'C', 'D']),
        ]);
    }
}
