<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create permissions
        $permissions = [
            // User management
            'view users',
            'create users',
            'edit users',
            'delete users',

            // Module management
            'view modules',
            'create modules',
            'edit modules',
            'delete modules',

            // TOS management
            'view tos',
            'create tos',
            'edit tos',
            'delete tos',
            'generate questions',

            // Exam management
            'view exams',
            'create exams',
            'edit exams',
            'delete exams',
            'approve questions',
            'bulk delete questions',

            // Profile management
            'edit own profile',
            'change own password',
        ];

        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission]);
        }

        // Create roles and assign permissions

        // Super Admin - has all permissions
        $superAdmin = Role::create(['name' => 'super-admin']);
        $superAdmin->givePermissionTo(Permission::all());

        // Admin - can manage users and all content
        $admin = Role::create(['name' => 'admin']);
        $admin->givePermissionTo([
            'view users',
            'create users',
            'edit users',
            'view modules',
            'create modules',
            'edit modules',
            'delete modules',
            'view tos',
            'create tos',
            'edit tos',
            'delete tos',
            'generate questions',
            'view exams',
            'create exams',
            'edit exams',
            'delete exams',
            'approve questions',
            'bulk delete questions',
            'edit own profile',
            'change own password',
        ]);

        // Educator - can create and manage own content
        $educator = Role::create(['name' => 'educator']);
        $educator->givePermissionTo([
            'view modules',
            'create modules',
            'edit modules',
            'view tos',
            'create tos',
            'edit tos',
            'delete tos',
            'generate questions',
            'view exams',
            'create exams',
            'edit exams',
            'edit own profile',
            'change own password',
        ]);

        // Create Super Admin user
        $superAdminUser = User::factory()->create([
            'name' => 'Super Admin',
            'email' => 'superadmin@example.com',
        ]);
        $superAdminUser->assignRole('super-admin');

        // Create Admin user
        $adminUser = User::factory()->create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
        ]);
        $adminUser->assignRole('admin');

        // Create Educator user
        $educatorUser = User::factory()->create([
            'name' => 'Educator User',
            'email' => 'educator@example.com',
        ]);
        $educatorUser->assignRole('educator');

        // Create realistic modules for educator
        $mathModule = \App\Models\Module::create([
            'code' => 'MATH-10',
            'name' => 'Advanced Algebra',
            'description' => 'This module covers advanced topics in algebra including quadratic equations, polynomials, and systems of equations.',
            'subject_area' => 'Mathematics',
            'grade_level' => 'Grade 10',
            'curriculum_year' => 2024,
            'is_active' => true,
            'created_by' => $educatorUser->id,
        ]);

        $scienceModule = \App\Models\Module::create([
            'code' => 'SCI-9',
            'name' => 'Biology: Ecosystems and Biodiversity',
            'description' => 'Study of ecosystems, food chains, biodiversity, and environmental conservation.',
            'subject_area' => 'Science',
            'grade_level' => 'Grade 9',
            'curriculum_year' => 2024,
            'is_active' => true,
            'created_by' => $educatorUser->id,
        ]);

        $englishModule = \App\Models\Module::create([
            'code' => 'ENG-8',
            'name' => 'English Literature and Composition',
            'description' => 'Analysis of literary texts, essay writing, and critical thinking skills.',
            'subject_area' => 'English',
            'grade_level' => 'Grade 8',
            'curriculum_year' => 2024,
            'is_active' => true,
            'created_by' => $educatorUser->id,
        ]);

        // Create realistic TOS for Math Module
        \App\Models\TosGenerate::create([
            'module_id' => $mathModule->id,
            'created_by' => $educatorUser->id,
            'grade_level' => 'Grade 10',
            'subject' => 'Mathematics',
            'quarter' => 'Q2',
            'total_items' => 40,
            'learning_objectives' => [
                ['code' => 'MATH-10-01', 'description' => 'Solve quadratic equations using various methods'],
                ['code' => 'MATH-10-02', 'description' => 'Factor polynomials of different degrees'],
                ['code' => 'MATH-10-03', 'description' => 'Graph quadratic functions and identify key features'],
                ['code' => 'MATH-10-04', 'description' => 'Apply algebraic concepts to real-world problems'],
                ['code' => 'MATH-10-05', 'description' => 'Solve systems of linear equations'],
            ],
            'cognitive_levels' => [
                'Remembering' => 20,
                'Understanding' => 30,
                'Applying' => 30,
                'Analyzing' => 15,
                'Evaluating' => 5,
            ],
            'item_distribution' => [
                'Multiple Choice' => 60,
                'Problem Solving' => 25,
                'Essay' => 15,
            ],
            'difficulty_level' => 'medium',
            'question_type' => 'mixed',
            'status' => 'draft',
        ]);

        // Create realistic TOS for Science Module
        \App\Models\TosGenerate::create([
            'module_id' => $scienceModule->id,
            'created_by' => $educatorUser->id,
            'grade_level' => 'Grade 9',
            'subject' => 'Science',
            'quarter' => 'Q3',
            'total_items' => 50,
            'learning_objectives' => [
                ['code' => 'SCI-9-01', 'description' => 'Describe the components and interactions in ecosystems'],
                ['code' => 'SCI-9-02', 'description' => 'Explain food chains and energy flow in ecosystems'],
                ['code' => 'SCI-9-03', 'description' => 'Identify factors affecting biodiversity'],
                ['code' => 'SCI-9-04', 'description' => 'Analyze the impact of human activities on ecosystems'],
                ['code' => 'SCI-9-05', 'description' => 'Propose solutions for environmental conservation'],
            ],
            'cognitive_levels' => [
                'Remembering' => 25,
                'Understanding' => 30,
                'Applying' => 20,
                'Analyzing' => 20,
                'Evaluating' => 5,
            ],
            'item_distribution' => [
                'Multiple Choice' => 50,
                'True/False' => 20,
                'Short Answer' => 20,
                'Essay' => 10,
            ],
            'difficulty_level' => 'easy',
            'question_type' => 'mixed',
            'status' => 'draft',
        ]);

        // Create realistic TOS for English Module
        \App\Models\TosGenerate::create([
            'module_id' => $englishModule->id,
            'created_by' => $educatorUser->id,
            'grade_level' => 'Grade 8',
            'subject' => 'English',
            'quarter' => 'Q1',
            'total_items' => 35,
            'learning_objectives' => [
                ['code' => 'ENG-8-01', 'description' => 'Identify literary devices in poems and short stories'],
                ['code' => 'ENG-8-02', 'description' => 'Analyze character development and plot structure'],
                ['code' => 'ENG-8-03', 'description' => 'Write coherent and well-structured essays'],
                ['code' => 'ENG-8-04', 'description' => 'Apply grammar rules in writing'],
                ['code' => 'ENG-8-05', 'description' => 'Evaluate themes and author\'s purpose in literary texts'],
            ],
            'cognitive_levels' => [
                'Remembering' => 15,
                'Understanding' => 25,
                'Applying' => 25,
                'Analyzing' => 25,
                'Evaluating' => 10,
            ],
            'item_distribution' => [
                'Multiple Choice' => 45,
                'Short Answer' => 30,
                'Essay' => 25,
            ],
            'difficulty_level' => 'medium',
            'question_type' => 'mixed',
            'status' => 'draft',
        ]);

        // Create additional users with random roles
        User::factory(5)->create()->each(function ($user) {
            $user->assignRole(['super-admin', 'admin', 'educator'][rand(0, 2)]);
        });
    }
}
