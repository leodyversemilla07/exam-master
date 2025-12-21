import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { User } from '@/types/models';
import { Plus, Search, Mail, Shield, Trash2, Pencil } from 'lucide-react';
import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Users', href: '/users' },
];

interface PageProps {
    users: {
        data: User[];
        current_page: number;
        last_page: number;
        total: number;
    };
    filters: {
        search?: string;
    };
}

export default function UsersIndex({ users, filters }: PageProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    const form = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const handleSearch = (value: string) => {
        setSearch(value);
        const timer = setTimeout(() => {
            router.get('/users', { search: value || undefined }, { preserveState: true });
        }, 300);
        return () => clearTimeout(timer);
    };

    const openCreateDialog = () => {
        form.reset();
        setEditingUser(null);
        setShowCreateDialog(true);
    };

    const openEditDialog = (user: User) => {
        form.setData({
            name: user.name,
            email: user.email,
            password: '',
            password_confirmation: '',
        });
        setEditingUser(user);
        setShowCreateDialog(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingUser) {
            form.put(`/users/${editingUser.id}`, {
                onSuccess: () => {
                    setShowCreateDialog(false);
                    form.reset();
                },
            });
        } else {
            form.post('/users', {
                onSuccess: () => {
                    setShowCreateDialog(false);
                    form.reset();
                },
            });
        }
    };

    const handleDelete = (user: User) => {
        if (confirm(`Are you sure you want to delete ${user.name}?`)) {
            router.delete(`/users/${user.id}`);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="User Management" />

            <div className="p-4 md:p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
                        <p className="mt-2 text-muted-foreground">
                            Manage system users and access control
                        </p>
                    </div>
                    <Button onClick={openCreateDialog}>
                        <Plus className="mr-2 size-4" />
                        Add User
                    </Button>
                </div>

                {/* Search */}
                <Card>
                    <CardHeader>
                        <CardTitle>Search Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="relative">
                            <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by name or email..."
                                value={search}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Users List */}
                {users.data.length === 0 ? (
                    <Card>
                        <CardHeader>
                            <CardTitle>No Users Found</CardTitle>
                            <CardDescription>
                                {filters.search
                                    ? 'Try adjusting your search'
                                    : 'Get started by adding your first user'}
                            </CardDescription>
                        </CardHeader>
                    </Card>
                ) : (
                    <>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {users.data.map((user) => (
                                <Card key={user.id}>
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1 space-y-2">
                                                <CardTitle className="text-lg">{user.name}</CardTitle>
                                                <CardDescription className="flex items-center gap-2">
                                                    <Mail className="size-3" />
                                                    {user.email}
                                                </CardDescription>
                                                {user.email_verified_at && (
                                                    <Badge variant="secondary" className="text-xs">
                                                        <Shield className="mr-1 size-3" />
                                                        Verified
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="flex-1"
                                                onClick={() => openEditDialog(user)}
                                            >
                                                <Pencil className="mr-2 size-3" />
                                                Edit
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(user)}
                                            >
                                                <Trash2 className="size-4 text-destructive" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {/* Pagination */}
                        {users.last_page > 1 && (
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-muted-foreground">
                                    Showing {users.data.length} of {users.total} users
                                </p>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={users.current_page === 1}
                                        onClick={() =>
                                            router.get(`/users?page=${users.current_page - 1}`, filters)
                                        }
                                    >
                                        Previous
                                    </Button>
                                    <span className="text-sm">
                                        Page {users.current_page} of {users.last_page}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={users.current_page === users.last_page}
                                        onClick={() =>
                                            router.get(`/users?page=${users.current_page + 1}`, filters)
                                        }
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* Create/Edit Dialog */}
                <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingUser ? 'Edit User' : 'Create User'}</DialogTitle>
                            <DialogDescription>
                                {editingUser
                                    ? 'Update user information'
                                    : 'Add a new user to the system'}
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    value={form.data.name}
                                    onChange={(e) => form.setData('name', e.target.value)}
                                    placeholder="Full name"
                                />
                                {form.errors.name && (
                                    <p className="text-sm text-destructive">{form.errors.name}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={form.data.email}
                                    onChange={(e) => form.setData('email', e.target.value)}
                                    placeholder="email@example.com"
                                />
                                {form.errors.email && (
                                    <p className="text-sm text-destructive">{form.errors.email}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">
                                    Password {editingUser && '(leave blank to keep current)'}
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={form.data.password}
                                    onChange={(e) => form.setData('password', e.target.value)}
                                    placeholder="••••••••"
                                />
                                {form.errors.password && (
                                    <p className="text-sm text-destructive">{form.errors.password}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password_confirmation">Confirm Password</Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    value={form.data.password_confirmation}
                                    onChange={(e) => form.setData('password_confirmation', e.target.value)}
                                    placeholder="••••••••"
                                />
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={form.processing}>
                                    {form.processing ? 'Saving...' : editingUser ? 'Update' : 'Create'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
