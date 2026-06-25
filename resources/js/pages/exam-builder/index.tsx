import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Plus,
    MoreVertical,
    Eye,
    Copy,
    Trash2,
    FileText,
    ClipboardList,
    Stethoscope,
    Search,
    X,
} from 'lucide-react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import type { Exam } from '@/types/models';
import type { BreadcrumbItem, SharedData } from '@/types';
import * as examBuilder from '@/routes/exam-builder';
import { index as modulesIndex, show as moduleShow } from '@/routes/modules';
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from '@/components/ui/empty';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Exam Builder', href: examBuilder.index.url() },
];

interface PageProps {
    exams: {
        data: (Exam & {
            module: { id: number; code: string; name: string };
            creator: { name: string };
            tos_generate?: { title: string };
            questions_count: number;
        })[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        links: { url: string | null; label: string; active: boolean }[];
    };
    modules: { id: number; code: string; name: string }[];
    filters: {
        module_id?: string;
        status?: string;
        exam_type?: string;
        search?: string;
    };
}

function getExamTypeIcon(type: string) {
    switch (type) {
        case 'formative':
            return <FileText className="size-5 text-blue-500" />;
        case 'summative':
            return <ClipboardList className="size-5 text-purple-500" />;
        case 'diagnostic':
            return <Stethoscope className="size-5 text-amber-500" />;
        default:
            return <FileText className="size-5 text-muted-foreground" />;
    }
}

function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

function getStatusBadge(status: string) {
    const styles: Record<string, string> = {
        draft: 'bg-muted text-muted-foreground',
        published: 'bg-success/10 text-success',
        archived: 'bg-secondary/10 text-secondary',
    };

    return (
        <Badge
            variant="outline"
            className={styles[status] || 'bg-muted text-muted-foreground'}
        >
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
    );
}

export default function ExamBuilderIndex({
    exams,
    modules,
    filters,
}: PageProps) {
    const { auth } = usePage<SharedData>().props;
    const userPermissions = auth.user?.permissions || [];
    const currentUserId = auth.user?.id;

    const [search, setSearch] = useState(filters.search || '');
    const [moduleFilter, setModuleFilter] = useState(
        filters.module_id || 'all',
    );
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [typeFilter, setTypeFilter] = useState(filters.exam_type || 'all');
    const [deletingExam, setDeletingExam] = useState<Exam | null>(null);

    const canDeleteExam = (exam: Exam) => {
        return (
            userPermissions.includes('delete exams') ||
            exam.created_by === currentUserId
        );
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
            module_id:
                moduleFilter === 'all' ? undefined : moduleFilter || undefined,
            status:
                statusFilter === 'all' ? undefined : statusFilter || undefined,
            exam_type:
                typeFilter === 'all' ? undefined : typeFilter || undefined,
            search: search || undefined,
            ...newFilters,
        };

        router.get('/exam-builder', currentFilters, { preserveState: true });
    };

    const confirmDelete = () => {
        if (deletingExam) {
            router.delete(`/exam-builder/${deletingExam.id}`, {
                onSuccess: () => setDeletingExam(null),
            });
        }
    };

    const hasActiveFilters =
        moduleFilter !== 'all' ||
        statusFilter !== 'all' ||
        typeFilter !== 'all' ||
        search !== '';

    const clearFilters = () => {
        setSearch('');
        setModuleFilter('all');
        setStatusFilter('all');
        setTypeFilter('all');
        router.get(examBuilder.index.url(), {}, { preserveState: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Exam Builder" />

            <div className="px-4 py-6 md:px-8 md:py-8">
                <div className="mx-auto max-w-5xl space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight">
                                Exam Builder
                            </h1>
                            <p className="mt-1 text-sm text-muted-foreground">
                                {exams.total} exam{exams.total !== 1 ? 's' : ''}{' '}
                                total
                            </p>
                        </div>
                        <Button asChild>
                            <Link href={modulesIndex.url()}>
                                <Plus className="mr-2 size-4" />
                                Create Exam
                            </Link>
                        </Button>
                    </div>

                    {/* Filters Row */}
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="relative max-w-sm min-w-48 flex-1">
                            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search exams..."
                                value={search}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <Select
                            value={moduleFilter}
                            onValueChange={(value) => {
                                setModuleFilter(value);
                                applyFilters({
                                    module_id:
                                        value === 'all'
                                            ? undefined
                                            : value || undefined,
                                });
                            }}
                        >
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder="All Modules" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Modules</SelectItem>
                                {modules.map((module) => (
                                    <SelectItem
                                        key={module.id}
                                        value={module.id.toString()}
                                    >
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
                                    status:
                                        value === 'all'
                                            ? undefined
                                            : value || undefined,
                                });
                            }}
                        >
                            <SelectTrigger className="w-36">
                                <SelectValue placeholder="All Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="published">
                                    Published
                                </SelectItem>
                                <SelectItem value="archived">
                                    Archived
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        <Select
                            value={typeFilter}
                            onValueChange={(value) => {
                                setTypeFilter(value);
                                applyFilters({
                                    exam_type:
                                        value === 'all'
                                            ? undefined
                                            : value || undefined,
                                });
                            }}
                        >
                            <SelectTrigger className="w-36">
                                <SelectValue placeholder="All Types" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="formative">
                                    Formative
                                </SelectItem>
                                <SelectItem value="summative">
                                    Summative
                                </SelectItem>
                                <SelectItem value="diagnostic">
                                    Diagnostic
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        {hasActiveFilters && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={clearFilters}
                            >
                                <X className="mr-1 size-3" />
                                Clear
                            </Button>
                        )}
                    </div>

                    {/* Exam List */}
                    {exams.data.length === 0 ? (
                        <Empty>
                            <EmptyHeader>
                                <EmptyMedia variant="icon">
                                    <FileText className="size-8" />
                                </EmptyMedia>
                                <EmptyTitle>No exams found</EmptyTitle>
                                <EmptyDescription>
                                    {hasActiveFilters
                                        ? "Try adjusting your filters to find what you're looking for."
                                        : 'Create your first exam to start building assessments from your question bank.'}
                                </EmptyDescription>
                            </EmptyHeader>
                            <EmptyContent>
                                {hasActiveFilters ? (
                                    <Button
                                        variant="outline"
                                        onClick={clearFilters}
                                    >
                                        Clear Filters
                                    </Button>
                                ) : (
                                    <Button asChild>
                                        <Link href={modulesIndex.url()}>
                                            <Plus className="mr-2 size-4" />
                                            Create Exam
                                        </Link>
                                    </Button>
                                )}
                            </EmptyContent>
                        </Empty>
                    ) : (
                        <>
                            <div className="rounded-xl border">
                                {/* Table Header */}
                                <div className="grid grid-cols-[1fr_120px_140px_100px_48px] gap-4 border-b px-6 py-3 text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                    <span>Title</span>
                                    <span>Questions</span>
                                    <span>Created</span>
                                    <span>Status</span>
                                    <span />
                                </div>

                                {/* Exam Rows */}
                                {exams.data.map((exam) => (
                                    <Link
                                        key={exam.id}
                                        href={moduleShow.url(exam.module.id)}
                                        className="group grid grid-cols-[1fr_120px_140px_100px_48px] items-center gap-4 border-b px-6 py-4 transition-colors last:border-0 hover:bg-accent/50"
                                    >
                                        {/* Title with icon */}
                                        <div className="flex min-w-0 items-center gap-3">
                                            <div className="shrink-0">
                                                {getExamTypeIcon(
                                                    exam.exam_type,
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="truncate font-medium">
                                                    {exam.title}
                                                </p>
                                                <p className="truncate text-xs text-muted-foreground">
                                                    {exam.module?.name}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Questions count */}
                                        <span className="text-sm text-muted-foreground">
                                            {exam.questions_count}{' '}
                                            {exam.questions_count === 1
                                                ? 'Question'
                                                : 'Questions'}
                                        </span>

                                        {/* Created date */}
                                        <span className="text-sm text-muted-foreground">
                                            {formatDate(exam.created_at)}
                                        </span>

                                        {/* Status */}
                                        {getStatusBadge(exam.status)}

                                        {/* 3-dot menu */}
                                        <div
                                            onClick={(e) => e.preventDefault()}
                                            className="flex justify-center"
                                        >
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="size-8 opacity-0 transition-opacity group-hover:opacity-100"
                                                    >
                                                        <MoreVertical className="size-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem asChild>
                                                        <Link
                                                            href={moduleShow.url(
                                                                exam.module.id,
                                                            )}
                                                        >
                                                            <Eye className="mr-2 size-4" />
                                                            View in Module
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            router.post(
                                                                examBuilder.duplicate.url(
                                                                    exam.id,
                                                                ),
                                                            )
                                                        }
                                                    >
                                                        <Copy className="mr-2 size-4" />
                                                        Duplicate
                                                    </DropdownMenuItem>
                                                    {canDeleteExam(exam) && (
                                                        <>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                className="text-destructive focus:text-destructive"
                                                                onClick={() =>
                                                                    setDeletingExam(
                                                                        exam,
                                                                    )
                                                                }
                                                            >
                                                                <Trash2 className="mr-2 size-4" />
                                                                Delete
                                                            </DropdownMenuItem>
                                                        </>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </Link>
                                ))}
                            </div>

                            {/* Pagination */}
                            {exams.last_page > 1 && (
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-muted-foreground">
                                        Showing {exams.data.length} of{' '}
                                        {exams.total} exams
                                    </p>
                                    <Pagination>
                                        <PaginationContent>
                                            <PaginationItem>
                                                <PaginationPrevious
                                                    href={
                                                        exams.links[0].url ||
                                                        '#'
                                                    }
                                                    className={
                                                        !exams.links[0].url
                                                            ? 'pointer-events-none opacity-50'
                                                            : ''
                                                    }
                                                />
                                            </PaginationItem>
                                            {exams.links
                                                .slice(1, -1)
                                                .map((link, i) => {
                                                    if (
                                                        link.label.includes(
                                                            '...',
                                                        )
                                                    ) {
                                                        return (
                                                            <PaginationItem
                                                                key={i}
                                                            >
                                                                <PaginationEllipsis />
                                                            </PaginationItem>
                                                        );
                                                    }

                                                    return (
                                                        <PaginationItem key={i}>
                                                            <PaginationLink
                                                                href={
                                                                    link.url ||
                                                                    '#'
                                                                }
                                                                isActive={
                                                                    link.active
                                                                }
                                                            >
                                                                {link.label}
                                                            </PaginationLink>
                                                        </PaginationItem>
                                                    );
                                                })}
                                            <PaginationItem>
                                                <PaginationNext
                                                    href={
                                                        exams.links[
                                                            exams.links.length -
                                                                1
                                                        ].url || '#'
                                                    }
                                                    className={
                                                        !exams.links[
                                                            exams.links.length -
                                                                1
                                                        ].url
                                                            ? 'pointer-events-none opacity-50'
                                                            : ''
                                                    }
                                                />
                                            </PaginationItem>
                                        </PaginationContent>
                                    </Pagination>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Delete Confirmation */}
            <AlertDialog
                open={!!deletingExam}
                onOpenChange={() => setDeletingExam(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Exam</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete "
                            {deletingExam?.title}"? This action cannot be
                            undone.
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
