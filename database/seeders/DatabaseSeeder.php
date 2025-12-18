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

        // Create additional users with random roles
        User::factory(5)->create()->each(function ($user) {
            $user->assignRole(['super-admin', 'admin', 'educator'][rand(0, 2)]);
        });
    }
}
