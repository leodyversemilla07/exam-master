import { Head, router, useForm } from '@inertiajs/react';
import {
    CheckCircle,
    Pencil,
    Plus,
    Search,
    Trash2,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import {
    flexRender,
    getCoreRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from '@/components/ui/empty';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import type { User } from '@/types/models';
import {
    index as usersIndex,
    store as usersStore,
    update as usersUpdate,
    destroy as usersDestroy,
} from '@/actions/App/Http/Controllers/UserController';

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
        case 'student':
            return 'outline';
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
        case 'student':
            return 'Student';
        default:
            return role;
    }
};

const createColumns = (
    onEdit: (user: ExtendedUser) => void,
    onDelete: (user: ExtendedUser) => void,
): ColumnDef<ExtendedUser>[] => [
    {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => (
            <div className="font-medium">{row.getValue('name')}</div>
        ),
    },
    {
        accessorKey: 'email',
        header: 'Email',
    },
    {
        accessorKey: 'role',
        header: 'Role',
        cell: ({ row }) => {
            const role = row.getValue('role') as string;

            return (
                <Badge variant={getRoleBadgeVariant(role || 'educator')}>
                    {getRoleLabel(role || 'educator')}
                </Badge>
            );
        },
    },
    {
        accessorKey: 'email_verified_at',
        header: 'Verified',
        cell: ({ row }) => {
            const verified = row.getValue('email_verified_at');

            return verified ? (
                <CheckCircle className="size-5 text-success" />
            ) : (
                <XCircle className="size-5 text-muted-foreground" />
            );
        },
    },
    {
        id: 'actions',
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => {
            const user = row.original;

            return (
                <div className="flex items-center justify-end gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(user)}
                    >
                        <Pencil className="size-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(user)}
                    >
                        <Trash2 className="size-4 text-destructive" />
                    </Button>
                </div>
            );
        },
    },
];

export default function UsersIndex({ users, roles, filters }: PageProps) {
    'use no memo';
    const [search, setSearch] = useState(filters.search || '');
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [editingUser, setEditingUser] = useState<ExtendedUser | null>(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [userToDelete, setUserToDelete] = useState<ExtendedUser | null>(null);

    const form = useForm({
        name: '',
        email: '',
        organization: '',
        password: '',
        password_confirmation: '',
        role: 'educator',
    });

    const handleSearch = (value: string) => {
        setSearch(value);
        const timer = setTimeout(() => {
            router.get(
                usersIndex.url(),
                { search: value || undefined },
                { preserveState: true },
            );
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
            organization: user.organization || '',
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
            form.put(usersUpdate.url(editingUser.id), {
                onSuccess: () => {
                    setShowCreateDialog(false);
                    form.reset();
                },
            });
        } else {
            form.post(usersStore.url(), {
                onSuccess: () => {
                    setShowCreateDialog(false);
                    form.reset();
                },
            });
        }
    };

    const handleDelete = (user: ExtendedUser) => {
        setUserToDelete(user);
        setShowDeleteDialog(true);
    };

    const confirmDelete = () => {
        if (userToDelete) {
            router.delete(usersDestroy.url(userToDelete.id), {
                onSuccess: () => {
                    setShowDeleteDialog(false);
                    setUserToDelete(null);
                },
            });
        }
    };

    const columns = createColumns(openEditDialog, handleDelete);

    // eslint-disable-next-line react-hooks/incompatible-library
    const table = useReactTable({
        data: users.data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <>
            <Head title="User Management" />

            <div className="p-6 md:p-8">
                <div className="mx-auto max-w-7xl space-y-6">
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
                    <div className="mb-4 flex items-center">
                        <div className="relative w-64">
                            <Search className="absolute top-3 left-3 size-4 text-muted-foreground" />
                            <Input
                                placeholder="Search users..."
                                value={search}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>

                    {users.data.length === 0 ? (
                        <Empty>
                            <EmptyHeader>
                                <EmptyMedia variant="icon">
                                    <Search className="size-8" />
                                </EmptyMedia>
                                <EmptyTitle>
                                    {filters.search
                                        ? 'No Users Found'
                                        : 'No Users Yet'}
                                </EmptyTitle>
                                <EmptyDescription>
                                    {filters.search
                                        ? 'No users found matching your search'
                                        : 'No users yet. Add your first user to get started.'}
                                </EmptyDescription>
                            </EmptyHeader>
                        </Empty>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    {table
                                        .getHeaderGroups()
                                        .map((headerGroup) => (
                                            <TableRow key={headerGroup.id}>
                                                {headerGroup.headers.map(
                                                    (header) => (
                                                        <TableHead
                                                            key={header.id}
                                                        >
                                                            {header.isPlaceholder
                                                                ? null
                                                                : flexRender(
                                                                      header
                                                                          .column
                                                                          .columnDef
                                                                          .header,
                                                                      header.getContext(),
                                                                  )}
                                                        </TableHead>
                                                    ),
                                                )}
                                            </TableRow>
                                        ))}
                                </TableHeader>
                                <TableBody>
                                    {table.getRowModel().rows?.length ? (
                                        table.getRowModel().rows.map((row) => (
                                            <TableRow
                                                key={row.id}
                                                data-state={
                                                    row.getIsSelected() &&
                                                    'selected'
                                                }
                                            >
                                                {row
                                                    .getVisibleCells()
                                                    .map((cell) => (
                                                        <TableCell
                                                            key={cell.id}
                                                        >
                                                            {flexRender(
                                                                cell.column
                                                                    .columnDef
                                                                    .cell,
                                                                cell.getContext(),
                                                            )}
                                                        </TableCell>
                                                    ))}
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell
                                                colSpan={columns.length}
                                                className="h-24 text-center"
                                            >
                                                No results.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}

                    {/* Pagination */}
                    {users.last_page > 1 && (
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">
                                Showing {users.data.length} of {users.total}{' '}
                                users
                            </p>
                            <Pagination>
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious
                                            href="#"
                                            onClick={(e) => {
                                                e.preventDefault();

                                                if (users.current_page > 1) {
                                                    router.get(
                                                        usersIndex.url(),
                                                        {
                                                            ...filters,
                                                            page:
                                                                users.current_page -
                                                                1,
                                                        },
                                                        { preserveState: true },
                                                    );
                                                }
                                            }}
                                            className={
                                                users.current_page === 1
                                                    ? 'pointer-events-none opacity-50'
                                                    : ''
                                            }
                                        />
                                    </PaginationItem>
                                    {Array.from(
                                        { length: users.last_page },
                                        (_, i) => i + 1,
                                    ).map((page) => {
                                        // Show first page, last page, current page, and pages around current
                                        const showPage =
                                            page === 1 ||
                                            page === users.last_page ||
                                            (page >= users.current_page - 1 &&
                                                page <= users.current_page + 1);

                                        if (!showPage) {
                                            // Show ellipsis before/after current page range
                                            if (
                                                page ===
                                                    users.current_page - 2 ||
                                                page === users.current_page + 2
                                            ) {
                                                return (
                                                    <PaginationItem key={page}>
                                                        <PaginationEllipsis />
                                                    </PaginationItem>
                                                );
                                            }

                                            return null;
                                        }

                                        return (
                                            <PaginationItem key={page}>
                                                <PaginationLink
                                                    href="#"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        router.get(
                                                            usersIndex.url(),
                                                            {
                                                                ...filters,
                                                                page,
                                                            },
                                                            {
                                                                preserveState: true,
                                                            },
                                                        );
                                                    }}
                                                    isActive={
                                                        page ===
                                                        users.current_page
                                                    }
                                                >
                                                    {page}
                                                </PaginationLink>
                                            </PaginationItem>
                                        );
                                    })}
                                    <PaginationItem>
                                        <PaginationNext
                                            href="#"
                                            onClick={(e) => {
                                                e.preventDefault();

                                                if (
                                                    users.current_page <
                                                    users.last_page
                                                ) {
                                                    router.get(
                                                        usersIndex.url(),
                                                        {
                                                            ...filters,
                                                            page:
                                                                users.current_page +
                                                                1,
                                                        },
                                                        { preserveState: true },
                                                    );
                                                }
                                            }}
                                            className={
                                                users.current_page ===
                                                users.last_page
                                                    ? 'pointer-events-none opacity-50'
                                                    : ''
                                            }
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </div>
                    )}

                    {/* Create/Edit Dialog */}
                    <Dialog
                        open={showCreateDialog}
                        onOpenChange={setShowCreateDialog}
                    >
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>
                                    {editingUser ? 'Edit User' : 'Create User'}
                                </DialogTitle>
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
                                        onChange={(e) =>
                                            form.setData('name', e.target.value)
                                        }
                                        placeholder="Full name"
                                    />
                                    {form.errors.name && (
                                        <p className="text-sm text-destructive">
                                            {form.errors.name}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={form.data.email}
                                        onChange={(e) =>
                                            form.setData(
                                                'email',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="email@example.com"
                                    />
                                    {form.errors.email && (
                                        <p className="text-sm text-destructive">
                                            {form.errors.email}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="organization">
                                        Institution/Organization
                                    </Label>
                                    <Input
                                        id="organization"
                                        value={form.data.organization}
                                        onChange={(e) =>
                                            form.setData(
                                                'organization',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="University or Organization name"
                                    />
                                    {form.errors.organization && (
                                        <p className="text-sm text-destructive">
                                            {form.errors.organization}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password">
                                        Password{' '}
                                        {editingUser &&
                                            '(leave blank to keep current)'}
                                    </Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={form.data.password}
                                        onChange={(e) =>
                                            form.setData(
                                                'password',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="••••••••"
                                    />
                                    {form.errors.password && (
                                        <p className="text-sm text-destructive">
                                            {form.errors.password}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password_confirmation">
                                        Confirm Password
                                    </Label>
                                    <Input
                                        id="password_confirmation"
                                        type="password"
                                        value={form.data.password_confirmation}
                                        onChange={(e) =>
                                            form.setData(
                                                'password_confirmation',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="••••••••"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="role">Role</Label>
                                    <Select
                                        value={form.data.role}
                                        onValueChange={(value) =>
                                            form.setData('role', value ?? '')
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {roles.map((role) => (
                                                <SelectItem
                                                    key={role}
                                                    value={role}
                                                >
                                                    {getRoleLabel(role)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {form.errors.role && (
                                        <p className="text-sm text-destructive">
                                            {form.errors.role}
                                        </p>
                                    )}
                                </div>
                                <DialogFooter>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() =>
                                            setShowCreateDialog(false)
                                        }
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={form.processing}
                                    >
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

                    <AlertDialog
                        open={showDeleteDialog}
                        onOpenChange={setShowDeleteDialog}
                    >
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Delete User</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Are you sure you want to delete{' '}
                                    {userToDelete?.name}? This action cannot be
                                    undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={confirmDelete}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                    Delete
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>
        </>
    );
}

UsersIndex.layout = { breadcrumbs: [{ title: 'Users', href: '/users' }] };
