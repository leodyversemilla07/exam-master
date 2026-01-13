import { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Search, UserMinus, Shield, Edit, X, Eye, Users } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import PageHeader from '@/components/page-header';
import { BreadcrumbItem } from '@/types';

interface Collaborator {
    id: number;
    name: string;
    email: string;
    pivot: {
        role: string;
        can_delete: boolean;
    };
}

interface PageProps {
    exam: {
        id: number;
        title: string;
        collaborators: Collaborator[];
        created_by: number;
        creator?: {
            name: string;
            email: string;
        };
    };
    availableUsers: {
        id: number;
        name: string;
        email: string;
    }[];
    auth: {
        user: {
            id: number;
        };
    };
}

export default function ExamCollaboratorsIndex({ exam, availableUsers }: PageProps) {
    const page = usePage();
    const currentUserId = (page.props as any).auth.user.id;

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUser, setSelectedUser] = useState<number | null>(null);
    const [role, setRole] = useState('editor');
    const [canDelete, setCanDelete] = useState(false);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

    const filteredUsers = availableUsers.filter((user) =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleAddCollaborator = () => {
        if (!selectedUser) return;

        router.post(
            `/exam-builder/${exam.id}/collaborators`,
            {
                user_id: selectedUser,
                role,
                can_delete: canDelete,
            } as any,
            {
                onSuccess: () => {
                    setIsAddDialogOpen(false);
                    setSelectedUser(null);
                    setSearchQuery('');
                    setRole('editor');
                    setCanDelete(false);
                },
                preserveScroll: true,
            }
        );
    };

    const handleRemoveCollaborator = (userId: number, userName: string) => {
        if (confirm(`Are you sure you want to remove ${userName} from this exam?`)) {
            router.delete(`/exam-builder/${exam.id}/collaborators/${userId}`, {
                onSuccess: () => {
                    // Refresh handled by Inertia
                },
                preserveScroll: true,
            });
        }
    };

    const handleLeaveExam = () => {
        if (confirm('Are you sure you want to leave this exam? You will lose access to edit it.')) {
            router.post(`/exam-builder/${exam.id}/collaborators/leave`, {} as any, {
                onSuccess: () => {
                    window.location.href = '/exam-builder';
                },
            } as any);
        }
    };

    const handleUpdateCollaborator = (userId: number, newRole: string, newCanDelete: boolean) => {
        router.patch(`/exam-builder/${exam.id}/collaborators/${userId}`, {
            role: newRole,
            can_delete: newCanDelete,
        } as any, {
            onSuccess: () => {
                // Refresh handled by Inertia
            },
            preserveScroll: true,
        } as any);
    };

    const isOwner = exam.created_by === (currentUserId as number);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Exam Builder', href: '/exam-builder' },
        { title: exam.title, href: `/exam-builder/${exam.id}` },
        { title: 'Collaborators', href: '' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Collaborators - ${exam.title}`} />

            <div className="p-4 md:p-6">
                <div className="mx-auto max-w-7xl">
                    <PageHeader
                        title="Exam Collaborators"
                        description={`Manage collaborators for "${exam.title}"`}
                        actions={
                            <>
                                <Link href={`/exam-builder/${exam.id}`}>
                                    <Button variant="outline" size="sm">
                                        Back to Exam
                                    </Button>
                                </Link>
                                {isOwner && (
                                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                                        <DialogTrigger asChild>
                                            <Button size="sm">
                                                <UserPlus className="mr-2 h-4 w-4" />
                                                Add Collaborator
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Add Collaborator</DialogTitle>
                                                <DialogDescription>
                                                    Invite another educator to collaborate on this exam.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="space-y-4 py-4">
                                                <div>
                                                    <Label htmlFor="search">Search Users</Label>
                                                    <div className="relative">
                                                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                        <Input
                                                            id="search"
                                                            placeholder="Search by name or email..."
                                                            value={searchQuery}
                                                            onChange={(e) => setSearchQuery(e.target.value)}
                                                            className="pl-9"
                                                        />
                                                    </div>
                                                </div>

                                                {filteredUsers.length > 0 && (
                                                    <div className="border rounded-md max-h-48 overflow-y-auto">
                                                        {filteredUsers.map((user) => (
                                                            <div
                                                                key={user.id}
                                                                className={`p-3 cursor-pointer hover:bg-accent flex items-center justify-between ${selectedUser === user.id ? 'bg-accent' : ''
                                                                    }`}
                                                                onClick={() => setSelectedUser(user.id)}
                                                            >
                                                                <div>
                                                                    <div className="font-medium">{user.name}</div>
                                                                    <div className="text-sm text-muted-foreground">{user.email}</div>
                                                                </div>
                                                                {selectedUser === user.id && (
                                                                    <Shield className="h-4 w-4 text-green-500" />
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {filteredUsers.length === 0 && searchQuery && (
                                                    <p className="text-sm text-muted-foreground py-2">
                                                        No users found.
                                                    </p>
                                                )}

                                                {selectedUser && (
                                                    <>
                                                        <div>
                                                            <Label htmlFor="role">Role</Label>
                                                            <Select value={role} onValueChange={setRole}>
                                                                <SelectTrigger>
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="editor">
                                                                        <div className="flex items-center gap-2">
                                                                            <Edit className="h-4 w-4" />
                                                                            <span>Editor</span>
                                                                        </div>
                                                                        <p className="text-xs text-muted-foreground">
                                                                            Can edit questions, reorder, and export
                                                                        </p>
                                                                    </SelectItem>
                                                                    <SelectItem value="viewer">
                                                                        <div className="flex items-center gap-2">
                                                                            <Eye className="h-4 w-4" />
                                                                            <span>Viewer</span>
                                                                        </div>
                                                                        <p className="text-xs text-muted-foreground">
                                                                            Can only view the exam
                                                                        </p>
                                                                    </SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>

                                                        <div className="flex items-center space-x-2">
                                                            <input
                                                                type="checkbox"
                                                                id="can_delete"
                                                                checked={canDelete}
                                                                onChange={(e) => setCanDelete(e.target.checked)}
                                                                className="rounded"
                                                            />
                                                            <Label htmlFor="can_delete">Allow deletion</Label>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                            <DialogFooter>
                                                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                                                    Cancel
                                                </Button>
                                                <Button
                                                    onClick={handleAddCollaborator}
                                                    disabled={!selectedUser}
                                                >
                                                    Add Collaborator
                                                </Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                )}
                            </>
                        }
                    />

                    <div className="space-y-6 mt-6">
                        {/* Exam Info Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle>{exam.title}</CardTitle>
                                <CardDescription>
                                    Manage who can access and edit this exam
                                </CardDescription>
                            </CardHeader>
                        </Card>

                        {/* Collaborators List */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Collaborators ({exam.collaborators.length})</CardTitle>
                                <CardDescription>
                                    {isOwner
                                        ? 'You are the owner of this exam. You can manage collaborators.'
                                        : 'You are a collaborator on this exam.'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {exam.collaborators.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <Users className="mx-auto h-12 w-12 mb-4 opacity-50" />
                                        <p>No collaborators added yet.</p>
                                        {isOwner && (
                                            <p className="text-sm">
                                                Click "Add Collaborator" to invite others.
                                            </p>
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {/* Owner always first */}
                                        <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 rounded-full bg-primary items-center justify-center text-primary-foreground font-bold">
                                                    {exam.creator?.name?.charAt(0) || 'O'}
                                                </div>
                                                <div>
                                                    <div className="font-medium">{exam.creator?.name}</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {exam.creator?.email}
                                                    </div>
                                                </div>
                                            </div>
                                            <Badge variant="outline" className="bg-green-100 text-green-800">
                                                Owner
                                            </Badge>
                                        </div>

                                        {/* Collaborators */}
                                        {exam.collaborators.map((collaborator) => (
                                            <div
                                                key={collaborator.id}
                                                className="flex items-center justify-between p-4 border rounded-lg"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-10 w-10 rounded-full bg-secondary items-center justify-center text-secondary-foreground font-bold">
                                                        {collaborator.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium">{collaborator.name}</div>
                                                        <div className="text-sm text-muted-foreground">
                                                            {collaborator.email}
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <Badge
                                                                variant={
                                                                    collaborator.pivot.role === 'editor'
                                                                        ? 'default'
                                                                        : 'secondary'
                                                                }
                                                            >
                                                                {collaborator.pivot.role}
                                                            </Badge>
                                                            {collaborator.pivot.can_delete && (
                                                                <Badge variant="outline" className="text-xs">
                                                                    Can Delete
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {isOwner && (
                                                    <div className="flex items-center gap-2">
                                                        <select
                                                            value={collaborator.pivot.role}
                                                            onChange={(e) =>
                                                                handleUpdateCollaborator(
                                                                    collaborator.id,
                                                                    e.target.value,
                                                                    collaborator.pivot.can_delete
                                                                )
                                                            }
                                                            className="rounded border px-3 py-1.5 text-sm"
                                                        >
                                                            <option value="editor">Editor</option>
                                                            <option value="viewer">Viewer</option>
                                                        </select>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() =>
                                                                handleRemoveCollaborator(
                                                                    collaborator.id,
                                                                    collaborator.name
                                                                )
                                                            }
                                                        >
                                                            <UserMinus className="h-4 w-4 text-destructive" />
                                                        </Button>
                                                    </div>
                                                )}

                                                {!isOwner && collaborator.id === currentUserId && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={handleLeaveExam}
                                                    >
                                                        <X className="mr-2 h-4 w-4" />
                                                        Leave Exam
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
