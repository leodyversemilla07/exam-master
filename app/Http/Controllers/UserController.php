<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreUserRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    /**
     * Display a listing of users.
     */
    public function index(Request $request): Response
    {
        $query = User::with('roles')->latest();

        // Search
        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%'.$request->search.'%')
                    ->orWhere('email', 'like', '%'.$request->search.'%');
            });
        }

        $users = $query->paginate(15)->withQueryString();

        // Transform users to include role names
        $users->getCollection()->transform(function ($user) {
            $user->role = $user->roles->first()?->name ?? 'educator';

            return $user;
        });

        // Get available roles for the dropdown
        $roles = Role::query()
            ->when(! auth()->user()->hasRole('super-admin'), fn ($query) => $query->where('name', '!=', 'super-admin'))
            ->pluck('name');

        return Inertia::render('users/index', [
            'users' => $users,
            'roles' => $roles,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Store a newly created user.
     */
    public function store(StoreUserRequest $request): RedirectResponse
    {
        abort_unless(auth()->user()->can('create users'), 403);

        $role = $request->input('role', 'educator');

        abort_if($role === 'super-admin' && ! auth()->user()->hasRole('super-admin'), 403);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'organization' => $request->organization,
            'password' => Hash::make($request->password),
            'email_verified_at' => now(),
        ]);

        // Assign role
        $user->assignRole($role);

        return back()->with('success', 'User created successfully.');
    }

    /**
     * Update the specified user.
     */
    public function update(StoreUserRequest $request, User $user): RedirectResponse
    {
        abort_unless(auth()->user()->can('edit users'), 403);
        abort_unless($this->canManageUser($user), 403);

        $data = [
            'name' => $request->name,
            'email' => $request->email,
            'organization' => $request->organization,
        ];

        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        $user->update($data);

        // Update role if provided
        if ($request->filled('role')) {
            $role = $request->input('role');

            abort_if($role === 'super-admin' && ! auth()->user()->hasRole('super-admin'), 403);

            $user->syncRoles([$role]);
        }

        return back()->with('success', 'User updated successfully.');
    }

    /**
     * Remove the specified user.
     */
    public function destroy(User $user): RedirectResponse
    {
        abort_unless(auth()->user()->can('delete users'), 403);
        abort_unless($this->canManageUser($user), 403);

        // Prevent deleting yourself
        if ($user->id === auth()->id()) {
            return back()->with('error', 'You cannot delete your own account.');
        }

        $user->delete();

        return back()->with('success', 'User deleted successfully.');
    }

    /**
     * Toggle user active status.
     */
    public function toggleActive(User $user): RedirectResponse
    {
        abort_unless(auth()->user()->can('edit users'), 403);
        abort_unless($this->canManageUser($user), 403);

        // Prevent deactivating yourself
        if ($user->id === auth()->id()) {
            return back()->with('error', 'You cannot deactivate your own account.');
        }

        $user->update(['is_active' => ! $user->is_active]);

        $status = $user->is_active ? 'activated' : 'deactivated';

        return back()->with('success', "User {$status} successfully.");
    }

    private function canManageUser(User $user): bool
    {
        return auth()->user()->hasRole('super-admin') || ! $user->hasRole('super-admin');
    }
}
