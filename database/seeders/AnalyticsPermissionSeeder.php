<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class AnalyticsPermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create analytics permission
        $permission = Permission::firstOrCreate(['name' => 'view analytics']);

        // Assign to admin and educator roles
        $adminRole = Role::findByName('admin');
        $educatorRole = Role::findByName('educator');

        $adminRole->givePermissionTo($permission);
        $educatorRole->givePermissionTo($permission);
    }
}
