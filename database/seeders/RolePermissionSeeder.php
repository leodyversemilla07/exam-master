<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
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
            'publish exams',
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

            // Student Portal
            'take exams',
            'view own results',
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
            'approve questions',
            'bulk delete questions',
            'view templates',
            'create templates',
            'edit templates',
            'delete templates',
            'edit own profile',
            'change own password',
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
            'approve questions',
            'view templates',
            'create templates',
            'edit templates',
            'delete templates',
            'edit own profile',
            'change own password',
        ]);

        // Student - can take exams and view results
        $student = Role::firstOrCreate(['name' => 'student']);
        $student->syncPermissions([
            'take exams',
            'view own results',
            'edit own profile',
            'change own password',
        ]);

        // Assign super-admin role to first user if exists
        $user = \App\Models\User::first();
        if ($user) {
            $user->assignRole('super-admin');
        }
    }
}
