<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Module>
 */
class ModuleFactory extends Factory
{
    /**
     * Define the model's default state.
     */
    public function definition(): array
    {
        $subjects = ['Mathematics', 'Science', 'English', 'Filipino', 'History', 'Physical Education'];
        $areas = ['Algebra', 'Geometry', 'Biology', 'Chemistry', 'Literature', 'Grammar'];

        return [
            'code' => strtoupper(fake()->unique()->lexify('???-###')),
            'name' => fake()->words(3, true).' Module',
            'description' => fake()->sentence(10),
            'subject_area' => fake()->randomElement($subjects),
            'grade_level' => 'Grade '.fake()->numberBetween(7, 12),
            'curriculum_year' => fake()->numberBetween(2020, 2025),
            'is_active' => fake()->boolean(80),
            'created_by' => User::factory(),
        ];
    }

    /**
     * Indicate the module is active.
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => true,
        ]);
    }

    /**
     * Indicate the module is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }
}
