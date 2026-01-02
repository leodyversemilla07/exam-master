<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class StudentRoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        $studentPermissions = [
            'view available exams',
            'take exams',
            'view own results',
            'view own attempts',
            'edit own profile',
        ];

        foreach ($studentPermissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        $educatorPermissions = [
            'create exam sessions',
            'edit exam sessions',
            'delete exam sessions',
            'view exam sessions',
            'view student results',
            'grade exams',
        ];

        foreach ($educatorPermissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        $student = Role::firstOrCreate(['name' => 'student']);
        $student->syncPermissions($studentPermissions);

        $educator = Role::where('name', 'educator')->first();
        if ($educator) {
            $educator->givePermissionTo($educatorPermissions);
        }

        $admin = Role::where('name', 'admin')->first();
        if ($admin) {
            $admin->givePermissionTo($educatorPermissions);
        }

        $studentUser = User::firstOrCreate(
            ['email' => 'student@example.com'],
            [
                'name' => 'Student User',
                'password' => bcrypt('password'),
            ]
        );
        $studentUser->assignRole('student');
    }
}
