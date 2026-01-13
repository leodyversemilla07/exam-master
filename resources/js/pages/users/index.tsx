import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PageHeader from '@/components/page-header';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { User } from '@/types/models';
import { Head, router, useForm } from '@inertiajs/react';
import { CheckCircle, Pencil, Plus, Search, Trash2, XCircle } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Users', href: '/users' }];

interface ExtendedUser extends User {
    role?: string;
}

interface PageProps {
    users: {
        data: ExtendedUser[];
        current_page: number;
        last_page: number;
        total: number;
    };
    roles: string[];
    filters: {
        search?: string;
    };
}

const getRoleBadgeVariant = (role: string) => {
    switch (role) {
        case 'super-admin':
            return 'destructive';
        case 'admin':
            return 'default';
        case 'educator':
            return 'secondary';
        default:
            return 'outline';
    }
};

const getRoleLabel = (role: string) => {
    switch (role) {
        case 'super-admin':
            return 'Super Admin';
        case 'admin':
            return 'Admin';
        case 'educator':
            return 'Educator';
        default:
            return role;
    }
};

export default function UsersIndex({ users, roles, filters }: PageProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [editingUser, setEditingUser] = useState<ExtendedUser | null>(null);

    const form = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'educator',
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
        form.setData('role', 'educator');
        setEditingUser(null);
        setShowCreateDialog(true);
    };

    const openEditDialog = (user: ExtendedUser) => {
        form.setData({
            name: user.name,
            email: user.email,
            password: '',
            password_confirmation: '',
            role: user.role || 'educator',
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

    const handleDelete = (user: ExtendedUser) => {
        if (confirm(`Are you sure you want to delete ${user.name}?`)) {
            router.delete(`/users/${user.id}`);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="User Management" />

            <div className="p-4 md:p-6 space-y-6">
                <PageHeader
                    title="User Management"
                    description="Manage system users and access control"
                    actions={
                        <Button onClick={openCreateDialog}>
                            <Plus className="mr-2 size-4" />
                            Add User
                        </Button>
                    }
                />

                {/* Search */}
                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle>Users</CardTitle>
                            <div className="relative w-64">
                                <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search users..."
                                    value={search}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {users.data.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-muted-foreground">
                                    {filters.search
                                        ? 'No users found matching your search'
                                        : 'No users yet. Add your first user to get started.'}
                                </p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Verified</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.data.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell className="font-medium">
                                                {user.name}
                                            </TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={getRoleBadgeVariant(
                                                        user.role || 'educator',
                                                    )}
                                                >
                                                    {getRoleLabel(user.role || 'educator')}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {user.email_verified_at ? (
                                                    <CheckCircle className="size-5 text-success" />
                                                ) : (
                                                    <XCircle className="size-5 text-muted-foreground" />
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => openEditDialog(user)}
                                                    >
                                                        <Pencil className="size-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDelete(user)}
                                                    >
                                                        <Trash2 className="size-4 text-destructive" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>

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
                                    <p className="text-sm text-destructive">
                                        {form.errors.password}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password_confirmation">Confirm Password</Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    value={form.data.password_confirmation}
                                    onChange={(e) =>
                                        form.setData('password_confirmation', e.target.value)
                                    }
                                    placeholder="••••••••"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="role">Role</Label>
                                <Select
                                    value={form.data.role}
                                    onValueChange={(value) => form.setData('role', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {roles.map((role) => (
                                            <SelectItem key={role} value={role}>
                                                {getRoleLabel(role)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {form.errors.role && (
                                    <p className="text-sm text-destructive">{form.errors.role}</p>
                                )}
                            </div>
                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowCreateDialog(false)}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={form.processing}>
                                    {form.processing
                                        ? 'Saving...'
                                        : editingUser
                                          ? 'Update'
                                          : 'Create'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
