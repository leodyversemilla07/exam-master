<?php

namespace Database\Factories;

use App\Models\Plan;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Plan>
 */
class PlanFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = Str::title(fake()->unique()->words(2, true));

        return [
            'name' => $name,
            'price' => fake()->numberBetween(9900, 49900),
            'features' => fake()->unique()->randomElements([
                'AI question generation',
                'Exam templates',
                'Analytics dashboard',
                'Question bank',
                'Export to PDF',
                'Export to DOCX',
                'Collaboration tools',
                'Student portal access',
            ], 4),
        ];
    }
}
