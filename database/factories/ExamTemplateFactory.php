<?php

namespace Database\Factories;

use App\Models\ExamTemplate;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ExamTemplate>
 */
class ExamTemplateFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'name' => fake()->words(3, true).' Template',
            'header_content' => fake()->optional()->paragraph(),
            'footer_content' => fake()->optional()->paragraph(),
            'custom_styles' => null,
        ];
    }
}
