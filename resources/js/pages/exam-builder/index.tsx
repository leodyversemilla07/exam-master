import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { Head, router, Link, usePage } from '@inertiajs/react';
import { Exam } from '@/types/models';
import { Plus, Eye, Edit, Copy, Trash2, FileText } from 'lucide-react';
import { useState } from 'react';
import PageHeader from '@/components/page-header';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from '@/components/ui/empty';
import { BreadcrumbItem, SharedData } from '@/types';
import * as examBuilder from '@/routes/exam-builder';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Exam Builder', href: examBuilder.index.url() }];

interface PageProps {
    exams: {
        data: (Exam & {
            module: {
                code: string;
                name: string;
            };
            creator: {
                name: string;
            };
            tos_generate?: {
                title: string;
            };
            questions_count: number;
        })[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        links: { url: string | null; label: string; active: boolean }[];
    };
    modules: {
        id: number;
        code: string;
        name: string;
    }[];
    filters: {
        module_id?: string;
        status?: string;
        exam_type?: string;
        search?: string;
    };
}

export default function ExamBuilderIndex({ exams, modules, filters }: PageProps) {
    const { auth } = usePage<SharedData>().props;
    const userPermissions = auth.user?.permissions || [];
    const currentUserId = auth.user?.id;

    const [search, setSearch] = useState(filters.search || '');
    const [moduleFilter, setModuleFilter] = useState(filters.module_id || 'all');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [typeFilter, setTypeFilter] = useState(filters.exam_type || 'all');
    const [deletingExam, setDeletingExam] = useState<Exam | null>(null);

    const canDeleteExam = (exam: Exam) => {
        return userPermissions.includes('delete exams') || exam.created_by === currentUserId;
    };

    const handleSearch = (value: string) => {
        setSearch(value);
        const timer = setTimeout(() => {
            applyFilters({ search: value || undefined });
        }, 300);
        return () => clearTimeout(timer);
    };

    const applyFilters = (newFilters: Partial<typeof filters> = {}) => {
        const currentFilters = {
            module_id: moduleFilter === 'all' ? undefined : moduleFilter || undefined,
            status: statusFilter === 'all' ? undefined : statusFilter || undefined,
            exam_type: typeFilter === 'all' ? undefined : typeFilter || undefined,
            search: search || undefined,
            ...newFilters,
        };

        router.get('/exam-builder', currentFilters, { preserveState: true });
    };

    const handleDelete = (exam: Exam) => {
        setDeletingExam(exam);
    };

    const confirmDelete = () => {
        if (deletingExam) {
            router.delete(`/exam-builder/${deletingExam.id}`, {
                onSuccess: () => setDeletingExam(null),
            });
        }
    };

    const getStatusBadge = (status: string) => {
        const colors = {
            draft: 'bg-muted text-muted-foreground border-border',
            published:
                'bg-success/10 text-success border-success/20 dark:bg-success/20 dark:border-success/30',
            archived:
                'bg-secondary/10 text-secondary border-secondary/20 dark:bg-secondary/20 dark:border-secondary/30',
        } as const;

        return (
            <Badge
                className={
                    colors[status as keyof typeof colors] ||
                    'bg-muted text-muted-foreground border-border'
                }
            >
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
        );
    };

    const getTypeBadge = (type: string) => {
        const colors = {
            formative: 'bg-info/10 text-info border-info/20 dark:bg-info/20 dark:border-info/30',
            summative:
                'bg-primary/10 text-primary border-primary/20 dark:bg-primary/20 dark:border-primary/30',
            diagnostic:
                'bg-warning/10 text-warning border-warning/20 dark:bg-warning/20 dark:border-warning/30',
        } as const;

        return (
            <Badge
                className={
                    colors[type as keyof typeof colors] ||
                    'bg-muted text-muted-foreground border-border'
                }
            >
                {type.charAt(0).toUpperCase() + type.slice(1)}
            </Badge>
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Exam Builder" />

            <div className="p-6 md:p-8">
                <div className="mx-auto max-w-7xl space-y-6">
                <PageHeader
                    title="Exam Builder"
                    description="Create complete exams by combining questions from your question bank"
                    actions={
                        <Button asChild>
                            <Link href={examBuilder.create.url()}>
                                <Plus className="mr-2 size-4" />
                                Create Exam
                            </Link>
                        </Button>
                    }
                />

                {/* Filters */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                            <div>
                                <Input
                                    placeholder="Search exams..."
                                    value={search}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    className="w-full"
                                />
                            </div>
                            <Select
                                value={moduleFilter}
                                onValueChange={(value) => {
                                    setModuleFilter(value);
                                    applyFilters({
                                        module_id: value === 'all' ? undefined : value || undefined,
                                    });
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="All Modules" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Modules</SelectItem>
                                    {modules.map((module) => (
                                        <SelectItem key={module.id} value={module.id.toString()}>
                                            {module.code}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select
                                value={statusFilter}
                                onValueChange={(value) => {
                                    setStatusFilter(value);
                                    applyFilters({
                                        status: value === 'all' ? undefined : value || undefined,
                                    });
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="All Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="published">Published</SelectItem>
                                    <SelectItem value="archived">Archived</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select
                                value={typeFilter}
                                onValueChange={(value) => {
                                    setTypeFilter(value);
                                    applyFilters({
                                        exam_type: value === 'all' ? undefined : value || undefined,
                                    });
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="All Types" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    <SelectItem value="formative">Formative</SelectItem>
                                    <SelectItem value="summative">Summative</SelectItem>
                                    <SelectItem value="diagnostic">Diagnostic</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setSearch('');
                                    setModuleFilter('all');
                                    setStatusFilter('all');
                                    setTypeFilter('all');
                                    router.get(examBuilder.index.url(), {}, { preserveState: true });
                                }}
                            >
                                Clear Filters
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {exams.data.length === 0 ? (
                    <Empty>
                        <EmptyHeader>
                            <EmptyMedia variant="icon">
                                <FileText className="size-8" />
                            </EmptyMedia>
                            <EmptyTitle>No Exams</EmptyTitle>
                            <EmptyDescription>
                                Create your first exam to start building assessments from your question bank.
                            </EmptyDescription>
                        </EmptyHeader>
                        <EmptyContent>
                            <Button asChild>
                                <Link href={examBuilder.create.url()}>
                                    <Plus className="mr-2 size-4" />
                                    Create Exam
                                </Link>
                            </Button>
                        </EmptyContent>
                    </Empty>
                ) : (
                    <Card>
                        <CardHeader>
                            <CardTitle>All Exams</CardTitle>
                            <CardDescription>
                                {exams.total} exam{exams.total !== 1 ? 's' : ''} total
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Exam</TableHead>
                                        <TableHead>Module</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-center">Questions</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {exams.data.map((exam) => (
                                        <TableRow key={exam.id}>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">
                                                        {exam.title}
                                                    </div>
                                                    {exam.description && (
                                                        <div className="text-sm text-muted-foreground truncate max-w-50">
                                                            {exam.description}
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium">
                                                    {exam.module.code}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {exam.module.name}
                                                </div>
                                            </TableCell>
                                            <TableCell>{getTypeBadge(exam.exam_type)}</TableCell>
                                            <TableCell>{getStatusBadge(exam.status)}</TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    <FileText className="size-4 text-muted-foreground" />
                                                    {exam.questions_count}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex justify-end gap-2">
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    variant="outline"
                                                                    size="icon"
                                                                    asChild
                                                                >
                                                                    <Link
                                                                        href={examBuilder.show.url(
                                                                            exam.id,
                                                                        )}
                                                                    >
                                                                        <Eye className="size-4" />
                                                                    </Link>
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                View Details
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>

                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    variant="outline"
                                                                    size="icon"
                                                                    asChild
                                                                >
                                                                    <Link
                                                                        href={examBuilder.edit.url(
                                                                            exam.id,
                                                                        )}
                                                                    >
                                                                        <Edit className="size-4" />
                                                                    </Link>
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                Edit Exam
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>

                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    variant="outline"
                                                                    size="icon"
                                                                    onClick={() =>
                                                                        router.post(examBuilder.duplicate.url(exam.id))
                                                                    }
                                                                >
                                                                    <Copy className="size-4" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                Duplicate Exam
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>

                                                    {canDeleteExam(exam) && (
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button
                                                                    variant="destructive"
                                                                    size="icon"
                                                                >
                                                                    <Trash2 className="size-4" />
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>
                                                                        Delete Exam?
                                                                    </AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        This action cannot be undone.
                                                                        This will permanently delete the
                                                                        exam "{exam.title}".
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>
                                                                        Cancel
                                                                    </AlertDialogCancel>
                                                                    <AlertDialogAction
                                                                        onClick={() =>
                                                                            handleDelete(exam)
                                                                        }
                                                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                                    >
                                                                        Delete
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            {/* Pagination */}
                            {exams.last_page > 1 && (
                                <div className="flex items-center justify-between mt-6">
                                    <p className="text-sm text-muted-foreground">
                                        Showing {exams.data.length} of {exams.total} exams
                                    </p>
                                    <Pagination>
                                        <PaginationContent>
                                            <PaginationItem>
                                                <PaginationPrevious
                                                    href={exams.links[0].url || '#'}
                                                    className={!exams.links[0].url ? 'pointer-events-none opacity-50' : ''}
                                                />
                                            </PaginationItem>
                                            {exams.links.slice(1, -1).map((link, i) => {
                                                if (link.label.includes('...')) {
                                                    return (
                                                        <PaginationItem key={i}>
                                                            <PaginationEllipsis />
                                                        </PaginationItem>
                                                    );
                                                }
                                                return (
                                                    <PaginationItem key={i}>
                                                        <PaginationLink
                                                            href={link.url || '#'}
                                                            isActive={link.active}
                                                        >
                                                            {link.label}
                                                        </PaginationLink>
                                                    </PaginationItem>
                                                );
                                            })}
                                            <PaginationItem>
                                                <PaginationNext
                                                    href={exams.links[exams.links.length - 1].url || '#'}
                                                    className={!exams.links[exams.links.length - 1].url ? 'pointer-events-none opacity-50' : ''}
                                                />
                                            </PaginationItem>
                                        </PaginationContent>
                                    </Pagination>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!deletingExam} onOpenChange={() => setDeletingExam(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Exam</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete "{deletingExam?.title}"? This action
                            cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
