<?php

namespace Database\Seeders;

use App\Models\Plan;
use Illuminate\Database\Seeder;

class PlanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Plan::create([
            'name' => 'Basic',
            'price' => 29900, // ₱299 in cents
            'features' => [
                '500 AI-generated questions per month',
                'Manual TOS creation',
                'Basic question bank (up to 100 questions)',
                'PDF export (exams only)',
                'Email support',
                '1 user account',
            ],
        ]);

        Plan::create([
            'name' => 'Pro',
            'price' => 99900, // ₱999 in cents
            'features' => [
                'Unlimited AI-generated questions',
                'Automated TOS generation with Bloom\'s Taxonomy',
                'Advanced question bank (unlimited questions)',
                'PDF/Word export with answer keys',
                'Basic analytics dashboard',
                'Duplicate detection',
                'Student portal access (up to 100 students)',
                'Priority email/chat support',
                'Up to 5 user accounts',
            ],
        ]);

        Plan::create([
            'name' => 'Enterprise',
            'price' => 299900, // ₱2,999 in cents
            'features' => [
                'All Pro features',
                'White-label branding',
                'Advanced analytics and reporting',
                'LMS integrations (Canvas, Moodle, etc.)',
                'Custom curriculum templates',
                'API access for integrations',
                'Bulk question import/export',
                'Dedicated account manager',
                'Phone/video support',
                'Unlimited users and students',
            ],
        ]);
    }
}
