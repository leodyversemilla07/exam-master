import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from '@/components/ui/empty';
import {
    Plus,
    Eye,
    Edit,
    Trash2,
    Clock,
    Users,
    Copy,
    CheckCircle,
    XCircle,
    AlertCircle,
} from 'lucide-react';
import { BreadcrumbItem } from '@/types';
import { ExamSession } from '@/types/models';
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
import PageHeader from '@/components/page-header';
import * as examSessions from '@/routes/exam-sessions';
import { index as modulesIndex } from '@/routes/modules';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Exam Sessions', href: examSessions.index.url() }];

interface PaginatedSessions {
    data: (ExamSession & {
        exam: {
            id: number;
            title: string;
            module: { id: number; name: string } | null;
        };
        creator: { id: number; name: string };
        attempts_count: number;
    })[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface PageProps {
    sessions: PaginatedSessions;
}

function getStatusBadge(session: ExamSession) {
    const now = new Date();
    const startTime = new Date(session.start_time);
    const endTime = new Date(session.end_time);

    if (session.status === 'ended' || now > endTime) {
        return (
            <Badge variant="secondary" className="gap-1">
                <XCircle className="size-3" /> Ended
            </Badge>
        );
    }
    if (session.status === 'draft') {
        return (
            <Badge variant="outline" className="gap-1">
                <AlertCircle className="size-3" /> Draft
            </Badge>
        );
    }
    if (now < startTime) {
        return (
            <Badge variant="outline" className="gap-1 text-blue-600 border-blue-600">
                <Clock className="size-3" /> Upcoming
            </Badge>
        );
    }
    return (
        <Badge className="gap-1 bg-green-600">
            <CheckCircle className="size-3" /> Active
        </Badge>
    );
}

export default function Index({ sessions }: PageProps) {
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    const handleDelete = (id: number) => {
        router.delete(examSessions.destroy.url(id));
    };

    const copyAccessCode = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Exam Sessions" />

            <div className="p-6 md:p-8">
                <div className="mx-auto max-w-7xl space-y-6">
                    <PageHeader
                        title="Exam Sessions"
                        description="Create and manage online exam sessions for students."
                        actions={
                            <Button asChild>
                                <Link href={modulesIndex.url()}>
                                    <Plus className="mr-2 size-4" />
                                    Create Session
                                </Link>
                            </Button>
                        }
                    />

                    {sessions.data.length === 0 ? (
                        <Empty>
                            <EmptyHeader>
                                <EmptyMedia variant="icon">
                                    <Clock className="size-8" />
                                </EmptyMedia>
                                <EmptyTitle>No Exam Sessions</EmptyTitle>
                                <EmptyDescription>
                                    Create your first exam session to allow students to take exams
                                    online.
                                </EmptyDescription>
                            </EmptyHeader>
                            <EmptyContent>
                                <Button asChild>
                                    <Link href={modulesIndex.url()}>
                                        <Plus className="mr-2 size-4" />
                                        Create Session
                                    </Link>
                                </Button>
                            </EmptyContent>
                        </Empty>
                    ) : (
                        <Card>
                            <CardHeader>
                                <CardTitle>All Sessions</CardTitle>
                                <CardDescription>
                                    {sessions.total} session{sessions.total !== 1 ? 's' : ''} total
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Session</TableHead>
                                            <TableHead>Exam</TableHead>
                                            <TableHead>Access Code</TableHead>
                                            <TableHead>Schedule</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-center">Attempts</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {sessions.data.map((session) => (
                                            <TableRow key={session.id}>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium">
                                                            {session.title}
                                                        </div>
                                                        {session.description && (
                                                            <div className="text-sm text-muted-foreground truncate max-w-50">
                                                                {session.description}
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium">
                                                            {session.exam.title}
                                                        </div>
                                                        {session.exam.module && (
                                                            <div className="text-sm text-muted-foreground">
                                                                {session.exam.module.name}
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() =>
                                                                        copyAccessCode(
                                                                            session.access_code,
                                                                        )
                                                                    }
                                                                    className="font-mono gap-2"
                                                                >
                                                                    {session.access_code}
                                                                    {copiedCode ===
                                                                    session.access_code ? (
                                                                        <CheckCircle className="size-4 text-green-600" />
                                                                    ) : (
                                                                        <Copy className="size-4" />
                                                                    )}
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                {copiedCode === session.access_code
                                                                    ? 'Copied!'
                                                                    : 'Click to copy'}
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm">
                                                        <div>
                                                            {new Date(
                                                                session.start_time,
                                                            ).toLocaleDateString()}{' '}
                                                            {new Date(
                                                                session.start_time,
                                                            ).toLocaleTimeString([], {
                                                                hour: '2-digit',
                                                                minute: '2-digit',
                                                            })}
                                                        </div>
                                                        <div className="text-muted-foreground">
                                                            to{' '}
                                                            {new Date(
                                                                session.end_time,
                                                            ).toLocaleDateString()}{' '}
                                                            {new Date(
                                                                session.end_time,
                                                            ).toLocaleTimeString([], {
                                                                hour: '2-digit',
                                                                minute: '2-digit',
                                                            })}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{getStatusBadge(session)}</TableCell>
                                                <TableCell className="text-center">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <Users className="size-4 text-muted-foreground" />
                                                        {session.attempts_count}
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
                                                                            href={examSessions.show.url(
                                                                                session.id,
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
                                                                            href={examSessions.edit.url(
                                                                                session.id,
                                                                            )}
                                                                        >
                                                                            <Edit className="size-4" />
                                                                        </Link>
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    Edit Session
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>

                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button
                                                                    variant="destructive"
                                                                    size="icon"
                                                                    disabled={
                                                                        session.attempts_count > 0
                                                                    }
                                                                >
                                                                    <Trash2 className="size-4" />
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>
                                                                        Delete Session?
                                                                    </AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        This action cannot be
                                                                        undone. This will
                                                                        permanently delete the
                                                                        session "{session.title}".
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>
                                                                        Cancel
                                                                    </AlertDialogCancel>
                                                                    <AlertDialogAction
                                                                        onClick={() =>
                                                                            handleDelete(session.id)
                                                                        }
                                                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                                    >
                                                                        Delete
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>

                                {/* Pagination */}
                                {sessions.last_page > 1 && (
                                    <div className="flex items-center justify-between mt-6">
                                        <p className="text-sm text-muted-foreground">
                                            Showing {sessions.data.length} of {sessions.total}{' '}
                                            sessions
                                        </p>
                                        <Pagination>
                                            <PaginationContent>
                                                <PaginationItem>
                                                    <PaginationPrevious
                                                        href={sessions.links[0].url || '#'}
                                                        className={
                                                            !sessions.links[0].url
                                                                ? 'pointer-events-none opacity-50'
                                                                : ''
                                                        }
                                                    />
                                                </PaginationItem>
                                                {sessions.links.slice(1, -1).map((link, i) => {
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
                                                        href={
                                                            sessions.links[
                                                                sessions.links.length - 1
                                                            ].url || '#'
                                                        }
                                                        className={
                                                            !sessions.links[
                                                                sessions.links.length - 1
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
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
