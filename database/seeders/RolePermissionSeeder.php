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
            'generate questions',
            'view exams',
            'create exams',
            'edit exams',
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
