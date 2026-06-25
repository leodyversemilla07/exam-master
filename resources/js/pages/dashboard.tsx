import { Head, Link, router } from '@inertiajs/react';
import {
    Plus,
    MoreVertical,
    Eye,
    Copy,
    Trash2,
    FileText,
    ClipboardList,
    BookOpen,
    MessageSquare,
    CheckCircle2,
    Stethoscope,
} from 'lucide-react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import type { PageProps } from '@/types';
import { dashboard as dashboardRoute } from '@/routes';
import { duplicate as examBuilderDuplicate } from '@/routes/exam-builder';
import { index as modulesIndex, show as moduleShow } from '@/routes/modules';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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

interface DashboardStats {
    total_modules: number;
    active_modules: number;
    total_questions: number;
    approved_questions: number;
    pending_questions: number;
    ai_generated_questions: number;
    total_exams: number;
    published_exams: number;
    draft_exams: number;
    total_tos: number;
    completed_tos: number;
    total_users: number;
}

interface RecentExam {
    id: number;
    title: string;
    description: string | null;
    exam_type: 'formative' | 'summative' | 'diagnostic';
    status: 'draft' | 'published' | 'archived';
    created_at: string;
    created_by: number;
    module: { id: number; code: string; name: string };
    creator: { id: number; name: string };
    questions_count: number;
}

interface DashboardPageProps extends PageProps {
    stats: DashboardStats;
    recentExams: RecentExam[];
}

const breadcrumbs = [{ title: 'Dashboard', href: dashboardRoute.url() }];

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

export default function Dashboard({
    auth,
    stats,
    recentExams,
}: DashboardPageProps) {
    const [deletingExam, setDeletingExam] = useState<RecentExam | null>(null);

    const confirmDelete = () => {
        if (deletingExam) {
            router.delete(`/exam-builder/${deletingExam.id}`, {
                onSuccess: () => setDeletingExam(null),
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="px-4 py-6 md:px-8 md:py-8">
                <div className="mx-auto max-w-5xl space-y-8">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight">
                                Recent exams
                            </h1>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Welcome back, {auth.user.name}
                            </p>
                        </div>
                        <Button asChild>
                            <Link href={modulesIndex.url()}>
                                <Plus className="mr-2 size-4" />
                                Create Exam
                            </Link>
                        </Button>
                    </div>

                    {/* Stat Pills */}
                    <div className="flex flex-wrap gap-3">
                        <div className="flex items-center gap-2 rounded-full border px-4 py-2 text-sm">
                            <BookOpen className="size-4 text-primary" />
                            <span className="font-medium">
                                {stats.active_modules}
                            </span>
                            <span className="text-muted-foreground">
                                Modules
                            </span>
                        </div>
                        <div className="flex items-center gap-2 rounded-full border px-4 py-2 text-sm">
                            <MessageSquare className="size-4 text-secondary" />
                            <span className="font-medium">
                                {stats.total_questions}
                            </span>
                            <span className="text-muted-foreground">
                                Questions
                            </span>
                        </div>
                        <div className="flex items-center gap-2 rounded-full border px-4 py-2 text-sm">
                            <ClipboardList className="size-4 text-success" />
                            <span className="font-medium">
                                {stats.total_exams}
                            </span>
                            <span className="text-muted-foreground">Exams</span>
                        </div>
                        <div className="flex items-center gap-2 rounded-full border px-4 py-2 text-sm">
                            <CheckCircle2 className="size-4 text-info" />
                            <span className="font-medium">
                                {stats.published_exams}
                            </span>
                            <span className="text-muted-foreground">
                                Published
                            </span>
                        </div>
                    </div>

                    {/* Exam List */}
                    {recentExams.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 text-center">
                            <div className="mb-6 rounded-2xl bg-muted/50 p-6">
                                <ClipboardList className="size-12 text-muted-foreground" />
                            </div>
                            <h2 className="mb-2 text-lg font-medium">
                                No exams yet
                            </h2>
                            <p className="mb-6 max-w-sm text-sm text-muted-foreground">
                                Create your first exam to start building
                                assessments from your question bank.
                            </p>
                            <Button asChild>
                                <Link href={modulesIndex.url()}>
                                    <Plus className="mr-2 size-4" />
                                    Create Exam
                                </Link>
                            </Button>
                        </div>
                    ) : (
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
                            {recentExams.map((exam) => (
                                <Link
                                    key={exam.id}
                                    href={moduleShow.url(exam.module.id)}
                                    className="group grid grid-cols-[1fr_120px_140px_100px_48px] items-center gap-4 border-b px-6 py-4 transition-colors last:border-0 hover:bg-accent/50"
                                >
                                    {/* Title with icon */}
                                    <div className="flex min-w-0 items-center gap-3">
                                        <div className="shrink-0">
                                            {getExamTypeIcon(exam.exam_type)}
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
                                                            examBuilderDuplicate.url(
                                                                exam.id,
                                                            ),
                                                        )
                                                    }
                                                >
                                                    <Copy className="mr-2 size-4" />
                                                    Duplicate
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className="text-destructive focus:text-destructive"
                                                    onClick={() =>
                                                        setDeletingExam(exam)
                                                    }
                                                >
                                                    <Trash2 className="mr-2 size-4" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </Link>
                            ))}
                        </div>
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
