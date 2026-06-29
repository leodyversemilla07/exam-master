<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // Create permissions
        $permissions = [
            // User management
            'view users',
            'create users',
            'edit users',
            'delete users',

            // System operations
            'view system logs',
            'manage system logs',
            'view queue monitor',
            'manage queue monitor',

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
            'publish exams',
            'create questions',
            'approve questions',
            'bulk delete questions',
            'view analytics',

            // Profile management
            'edit own profile',
            'change own password',

            // Template management
            'view templates',
            'create templates',
            'edit templates',
            'delete templates',

            // Collaborator management
            'manage collaborators',

            // Exam collaboration permissions
            'view exam collaborators',
            'add exam collaborator',
            'remove exam collaborator',
            'update exam collaborator',
            'can delete exam',
            'leave exam',

            // Student Portal
            'view available exams',
            'take exams',
            'view own results',
            'view own attempts',

            // Exam Session management (educator)
            'create exam sessions',
            'edit exam sessions',
            'delete exam sessions',
            'view exam sessions',
            'view student results',
            'grade exams',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // Create roles and assign permissions

        // Super Admin - has all permissions
        $superAdmin = Role::firstOrCreate(['name' => 'super-admin']);
        $superAdmin->syncPermissions(Permission::all());

        // Admin - can manage users and all content
        $admin = Role::firstOrCreate(['name' => 'admin']);
        $admin->syncPermissions([
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
            'publish exams',
            'create questions',
            'approve questions',
            'bulk delete questions',
            'view analytics',
            'view templates',
            'create templates',
            'edit templates',
            'delete templates',
            'edit own profile',
            'change own password',
            'manage collaborators',
            // Exam session permissions
            'create exam sessions',
            'edit exam sessions',
            'delete exam sessions',
            'view exam sessions',
            'view student results',
            'grade exams',
        ]);

        // Educator - can create and manage own content
        $educator = Role::firstOrCreate(['name' => 'educator']);
        $educator->syncPermissions([
            'view modules',
            'create modules',
            'edit modules',
            'view tos',
            'create tos',
            'edit tos',
            'generate questions',
            'view exams',
            'create exams',
            'edit exams',
            'publish exams',
            'create questions',
            'approve questions',
            'view analytics',
            'view templates',
            'create templates',
            'edit templates',
            'delete templates',
            'edit own profile',
            'change own password',
            // Exam session permissions
            'create exam sessions',
            'edit exam sessions',
            'delete exam sessions',
            'view exam sessions',
            'view student results',
            'grade exams',
        ]);

        // Student - can take exams and view results
        $student = Role::firstOrCreate(['name' => 'student']);
        $student->syncPermissions([
            'view available exams',
            'take exams',
            'view own results',
            'view own attempts',
            'edit own profile',
            'change own password',
        ]);

        // Create default student user if not exists
        $studentUser = User::firstOrCreate(
            ['email' => 'student@example.com'],
            [
                'name' => 'Student User',
                'email_verified_at' => now(),
                'password' => bcrypt('password'),
            ]
        );
        if ($studentUser->email_verified_at === null) {
            $studentUser->forceFill(['email_verified_at' => now()])->save();
        }

        if (! $studentUser->hasRole('student')) {
            $studentUser->assignRole('student');
        }
    }
}
