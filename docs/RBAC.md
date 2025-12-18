# Role-Based Access Control (RBAC) Documentation

## Overview

This application uses [Spatie Laravel Permission](https://spatie.be/docs/laravel-permission) package to implement Role-Based Access Control (RBAC). The system provides granular permission management across three user roles with different access levels.

## Roles

### 1. Super Admin
- **Full system access** - Has all 21 permissions
- Can manage users, modules, exams, and TOS
- Can approve questions and perform bulk operations
- Typically assigned to system administrators

### 2. Admin
- **20 permissions** - Can manage content and some users
- Can view, create, and edit users (but not delete)
- Full access to modules, TOS, and exams
- Can approve questions and bulk delete
- Typically assigned to school administrators

### 3. Educator
- **12 permissions** - Can create and manage own content
- Can view and create modules (no deletion)
- Can create and edit TOS and exams
- Can generate AI questions
- Cannot manage users or approve questions
- Typically assigned to teachers

## Permissions

### User Management
- `view users` - View user list
- `create users` - Create new users
- `edit users` - Update existing users
- `delete users` - Delete users (Super Admin only)

### Module Management
- `view modules` - View module list
- `create modules` - Create new modules
- `edit modules` - Update modules and toggle status
- `delete modules` - Delete modules (Admin+ only)

### TOS Management
- `view tos` - View TOS list
- `create tos` - Create new TOS
- `edit tos` - Update existing TOS
- `delete tos` - Delete TOS (Admin+ only)
- `generate questions` - Trigger AI question generation

### Exam Management
- `view exams` - View exam questions
- `create exams` - Create new questions
- `edit exams` - Update existing questions
- `delete exams` - Delete questions (Admin+ only)
- `approve questions` - Approve/unapprove questions (Admin+ only)
- `bulk delete questions` - Bulk delete operations (Admin+ only)

### Profile Management
- `edit own profile` - Update own profile information
- `change own password` - Change own password

## Implementation

### Route Protection

Routes are protected using the `permission` middleware:

```php
Route::resource('users', UserController::class)
    ->middleware(['auth', 'verified', 'permission:view users']);

Route::resource('modules', ModuleController::class)
    ->middleware(['auth', 'verified', 'permission:view modules']);
```

### Controller Authorization

Controllers use `abort_unless()` to check specific action permissions:

```php
public function store(StoreUserRequest $request): RedirectResponse
{
    abort_unless(auth()->user()->can('create users'), 403);
    // ... create user logic
}
```

### Checking Permissions in Code

```php
// Check if user has a specific permission
if (auth()->user()->can('create modules')) {
    // User can create modules
}

// Check if user has a specific role
if (auth()->user()->hasRole('super-admin')) {
    // User is super admin
}

// Check if user has any of the given roles
if (auth()->user()->hasAnyRole(['super-admin', 'admin'])) {
    // User is either super admin or admin
}

// Get all user permissions
$permissions = auth()->user()->getAllPermissions();

// Get all user roles
$roles = auth()->user()->roles;
```

## Database Schema

The package creates five tables:

1. **roles** - Stores role definitions
2. **permissions** - Stores permission definitions
3. **model_has_roles** - Pivot table linking users to roles
4. **model_has_permissions** - Pivot table for direct user permissions
5. **role_has_permissions** - Pivot table linking roles to permissions

## Test Users

Three test users are created with different roles:

| Name | Email | Password | Role | Permissions |
|------|-------|----------|------|-------------|
| Test Teacher | teacher@test.com | password | super-admin | 21 |
| Test Admin | admin@test.com | password | admin | 20 |
| Test Educator | educator@test.com | password | educator | 12 |

## Seeding Roles and Permissions

To reseed roles and permissions:

```bash
php artisan db:seed --class=RolePermissionSeeder
```

**Note:** This will create roles and permissions but won't duplicate if they already exist.

## Assigning Roles

```php
// Assign a role to a user
$user->assignRole('educator');

// Assign multiple roles
$user->assignRole(['educator', 'admin']);

// Remove a role
$user->removeRole('educator');

// Sync roles (remove all current and add new ones)
$user->syncRoles(['admin']);
```

## Granting Direct Permissions

While users typically inherit permissions from roles, you can grant direct permissions:

```php
// Give permission to user
$user->givePermissionTo('approve questions');

// Remove permission
$user->revokePermissionTo('approve questions');

// Sync permissions
$user->syncPermissions(['view modules', 'create modules']);
```

## Blade Directives (for future frontend)

```blade
@role('super-admin')
    <!-- Only visible to super admins -->
@endrole

@can('create users')
    <!-- Only visible to users with create users permission -->
@endcan

@hasanyrole('super-admin|admin')
    <!-- Visible to super admins and admins -->
@endhasanyrole
```

## Middleware Aliases

The following middleware aliases are available:

- `role:role_name` - Checks if user has specific role
- `permission:permission_name` - Checks if user has specific permission
- `role_or_permission:role_name|permission_name` - Checks either role or permission

## Cache

Permissions are cached for performance. Clear the cache after making changes:

```php
// Clear permission cache
app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();
```

Or use Artisan:

```bash
php artisan permission:cache-reset
```

## Security Best Practices

1. **Always use middleware** on routes for first-level protection
2. **Add controller checks** for second-level authorization
3. **Follow principle of least privilege** - Give users minimum necessary permissions
4. **Regularly audit permissions** - Review user roles and permissions
5. **Test permission boundaries** - Verify users can't access unauthorized resources
6. **Log sensitive actions** - Track permission changes and role assignments

## Common Patterns

### Self-Service Actions

Users can always edit their own profile regardless of permissions:

```php
if (auth()->id() === $user->id || auth()->user()->can('edit users')) {
    // Allow edit
}
```

### Resource Ownership

Check if user owns a resource before allowing edits:

```php
if ($module->created_by === auth()->id() || auth()->user()->can('edit modules')) {
    // Allow edit
}
```

### Hierarchical Permissions

Higher roles automatically get lower role permissions:
- Super Admin ⊃ Admin ⊃ Educator

## Troubleshooting

### Permission denied errors
- Verify user has the role: `$user->roles`
- Check role has the permission: `Role::findByName('educator')->permissions`
- Clear permission cache: `php artisan permission:cache-reset`

### New permissions not working
- Run seeder: `php artisan db:seed --class=RolePermissionSeeder`
- Clear cache: `php artisan permission:cache-reset`
- Restart application: `php artisan optimize:clear`

## Future Enhancements

Potential improvements for the RBAC system:

1. **Resource-level permissions** - Permission to edit only own resources
2. **Time-based permissions** - Temporary role assignments
3. **Department/School scoping** - Limit permissions by organizational unit
4. **Audit logging** - Track all permission changes
5. **Permission groups** - Organize permissions into logical groups
6. **UI for role management** - Admin interface for managing roles and permissions
