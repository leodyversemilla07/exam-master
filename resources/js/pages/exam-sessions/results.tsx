import { Head, Link } from '@inertiajs/react';
import {
    Download,
    Clock,
    Users,
    CheckCircle,
    Search,
    ShieldAlert,
} from 'lucide-react';
import { useState, useMemo } from 'react';
import type { ColumnDef, SortingState } from '@tanstack/react-table';
import {
    flexRender,
    getCoreRowModel,
    useReactTable,
    getSortedRowModel,
    getFilteredRowModel,
} from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
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
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from '@/components/ui/empty';
import type { BreadcrumbItem } from '@/types';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import * as examSessions from '@/routes/exam-sessions';
import PageHeader from '@/components/page-header';

interface User {
    id: number;
    name: string;
    email: string;
}

interface Answer {
    id: number;
    is_correct: boolean | null;
    points_earned: number;
    question: {
        id: number;
        question_text: string;
        points: number;
    };
}

interface AttemptWithDetails {
    id: number;
    exam_session_id: number;
    user_id: number;
    status: string;
    started_at: string;
    completed_at: string | null;
    submitted_at: string | null;
    attempt_number: number;
    score: number | null;
    total_points: number | null;
    percentage: number | null;
    time_spent_seconds: number | null;
    created_at: string;
    updated_at: string;
    user: User;
    answers: Answer[];
}

interface PaginatedAttempts {
    data: AttemptWithDetails[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface SessionWithExam {
    id: number;
    title: string;
    status: string;
    access_code: string;
    start_time: string;
    end_time: string;
    exam: {
        id: number;
        title: string;
        module: { id: number; name: string } | null;
    };
}

interface PageProps {
    session: SessionWithExam;
    attempts: PaginatedAttempts;
}

const breadcrumbs = (props: PageProps): BreadcrumbItem[] => [
    { title: 'Exam Sessions', href: examSessions.index.url() },
    {
        title: props.session.title,
        href: examSessions.show.url(props.session.id),
    },
    { title: 'Results', href: examSessions.results.url(props.session.id) },
];

function getAttemptStatusBadge(status: string) {
    switch (status) {
        case 'in_progress':
            return (
                <Badge
                    variant="outline"
                    className="gap-1 border-blue-600 text-blue-600"
                >
                    <Clock className="size-3" /> In Progress
                </Badge>
            );
        case 'submitted':
            return (
                <Badge variant="secondary" className="gap-1">
                    <CheckCircle className="size-3" /> Submitted
                </Badge>
            );
        case 'graded':
            return (
                <Badge className="gap-1 bg-green-600">
                    <CheckCircle className="size-3" /> Graded
                </Badge>
            );
        default:
            return <Badge variant="outline">{status}</Badge>;
    }
}

function getScoreColor(percentage: number): string {
    if (percentage >= 90) {
        return 'text-green-600';
    }

    if (percentage >= 75) {
        return 'text-blue-600';
    }

    if (percentage >= 60) {
        return 'text-amber-600';
    }

    return 'text-red-600';
}

const columns: ColumnDef<AttemptWithDetails>[] = [
    {
        accessorKey: 'user',
        header: 'Student',
        cell: ({ row }) => {
            const user = row.original.user;

            return (
                <div>
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-muted-foreground">
                        {user.email}
                    </div>
                </div>
            );
        },
        filterFn: (row, _, filterValue) => {
            const user = row.original.user;
            const query = filterValue.toLowerCase();

            return (
                user.name.toLowerCase().includes(query) ||
                user.email.toLowerCase().includes(query)
            );
        },
    },
    {
        accessorKey: 'attempt_number',
        header: 'Attempt',
        cell: ({ row }) => (
            <Badge variant="outline">#{row.getValue('attempt_number')}</Badge>
        ),
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => getAttemptStatusBadge(row.getValue('status')),
    },
    {
        accessorKey: 'score',
        header: 'Score',
        cell: ({ row }) => {
            const score = row.getValue('score') as number | null;

            return score !== null ? (
                <span className="font-medium">{score.toFixed(1)}</span>
            ) : (
                <span className="text-muted-foreground">—</span>
            );
        },
    },
    {
        accessorKey: 'percentage',
        header: 'Percentage',
        cell: ({ row }) => {
            const percentage = row.getValue('percentage') as number | null;

            return percentage !== null ? (
                <span className={`font-bold ${getScoreColor(percentage)}`}>
                    {percentage.toFixed(1)}%
                </span>
            ) : (
                <span className="text-muted-foreground">—</span>
            );
        },
    },
    {
        id: 'correct_total',
        header: 'Correct/Total',
        cell: ({ row }) => {
            const attempt = row.original;

            if (attempt.status === 'in_progress') {
                return <span className="text-muted-foreground">—</span>;
            }

            const correctAnswers = attempt.answers.filter(
                (a) => a.is_correct === true,
            ).length;
            const totalAnswers = attempt.answers.length;

            return (
                <div className="flex items-center gap-2">
                    <CheckCircle className="size-4 text-green-600" />
                    <span>{correctAnswers}</span>
                    <span className="text-muted-foreground">/</span>
                    <span>{totalAnswers}</span>
                </div>
            );
        },
    },
    {
        accessorKey: 'time_spent_seconds',
        header: 'Time Spent',
        cell: ({ row }) => {
            const seconds = row.getValue('time_spent_seconds') as number | null;

            return seconds ? (
                <div className="flex items-center gap-1">
                    <Clock className="size-4 text-muted-foreground" />
                    {Math.floor(seconds / 60)} min
                </div>
            ) : (
                <span className="text-muted-foreground">—</span>
            );
        },
    },
    {
        accessorKey: 'submitted_at',
        header: 'Submitted',
        cell: ({ row }) => {
            const submittedAt = row.getValue('submitted_at') as string | null;

            return submittedAt ? (
                <div className="text-sm">
                    {new Date(submittedAt).toLocaleDateString()}
                    <br />
                    <span className="text-muted-foreground">
                        {new Date(submittedAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                    </span>
                </div>
            ) : (
                <span className="text-muted-foreground">In progress</span>
            );
        },
    },
];

// Helper to update the page param in the current URL
function updatePageInUrl(page: number): string {
    const url = new URL(window.location.href);
    url.searchParams.set('page', String(page));

    return url.pathname + url.search;
}

export default function Results({ session, attempts }: PageProps) {
    "use no memo";
    const [globalFilter, setGlobalFilter] = useState('');
    const [sorting, setSorting] = useState<SortingState>([]);

    const table = useReactTable({
        data: attempts.data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
        globalFilterFn: (row, _, filterValue) => {
            const user = row.original.user;
            const query = filterValue.toLowerCase();

            return (
                user.name.toLowerCase().includes(query) ||
                user.email.toLowerCase().includes(query)
            );
        },
        state: {
            sorting,
            globalFilter,
        },
    });

    const handleExport = () => {
        window.location.href = examSessions.exportResults.url(session.id);
    };

    const completedAttempts = attempts.data.filter(
        (a) => a.status === 'submitted' || a.status === 'graded',
    );

    const stats = useMemo(() => {
        if (completedAttempts.length === 0) {
            return { average: 0, highest: 0, lowest: 0, passing: 0 };
        }

        const percentages = completedAttempts.map((a) => a.percentage || 0);

        return {
            average:
                percentages.reduce((a, b) => a + b, 0) / percentages.length,
            highest: Math.max(...percentages),
            lowest: Math.min(...percentages),
            passing: percentages.filter((p) => p >= 60).length,
        };
    }, [completedAttempts]);

    return (
        <>
            <Head title={`Results - ${session.title}`} />

            <div className="p-6 md:p-8">
                <div className="mx-auto max-w-7xl space-y-6">
                    <PageHeader
                        title="Exam Results"
                        description={`${session.title} • ${session.exam.title}`}
                        actions={
                            <div className="flex items-center gap-2">
                                <Button variant="outline" render={<Link
                                    href={`/exam-sessions/${session.id}/plagiarism`}
                                />} nativeButton={false}>
                                    <ShieldAlert className="mr-2 size-4" />
                                    Plagiarism Report
                                </Button>
                                <Button
                                    onClick={handleExport}
                                    disabled={completedAttempts.length === 0}
                                >
                                    <Download className="mr-2 size-4" />
                                    Export CSV
                                </Button>
                            </div>
                        }
                    />

                    {/* Summary Stats */}
                    <div className="grid gap-4 md:grid-cols-4">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Total Submissions
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {completedAttempts.length}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    of {attempts.total} total attempts
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Average Score
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div
                                    className={`text-2xl font-bold ${getScoreColor(stats.average)}`}
                                >
                                    {stats.average.toFixed(1)}%
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Highest / Lowest
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    <span className="text-green-600">
                                        {stats.highest.toFixed(0)}%
                                    </span>
                                    {' / '}
                                    <span className="text-red-600">
                                        {stats.lowest.toFixed(0)}%
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Passing Rate
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {completedAttempts.length > 0
                                        ? (
                                              (stats.passing /
                                                  completedAttempts.length) *
                                              100
                                          ).toFixed(0)
                                        : 0}
                                    %
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {stats.passing} of{' '}
                                    {completedAttempts.length} passed (≥60%)
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Results Table */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>All Attempts</CardTitle>
                                    <CardDescription>
                                        Detailed results for each student
                                        attempt
                                    </CardDescription>
                                </div>
                                <div className="relative w-64">
                                    <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        placeholder="Search by name or email..."
                                        value={globalFilter}
                                        onChange={(e) =>
                                            setGlobalFilter(e.target.value)
                                        }
                                        className="pl-9"
                                    />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {table.getRowModel().rows.length === 0 ? (
                                <Empty>
                                    <EmptyMedia>
                                        <Users className="size-10" />
                                    </EmptyMedia>
                                    <EmptyContent>
                                        <EmptyHeader>
                                            <EmptyTitle>
                                                {globalFilter
                                                    ? 'No Matching Results'
                                                    : 'No Attempts Yet'}
                                            </EmptyTitle>
                                            <EmptyDescription>
                                                {globalFilter
                                                    ? 'Try a different search term.'
                                                    : 'Students have not yet taken this exam.'}
                                            </EmptyDescription>
                                        </EmptyHeader>
                                    </EmptyContent>
                                </Empty>
                            ) : (
                                <>
                                    <div className="rounded-md border">
                                        <Table>
                                            <TableHeader>
                                                {table
                                                    .getHeaderGroups()
                                                    .map((headerGroup) => (
                                                        <TableRow
                                                            key={headerGroup.id}
                                                        >
                                                            {headerGroup.headers.map(
                                                                (header) => (
                                                                    <TableHead
                                                                        key={
                                                                            header.id
                                                                        }
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
                                                {table
                                                    .getRowModel()
                                                    .rows.map((row) => (
                                                        <TableRow key={row.id}>
                                                            {row
                                                                .getVisibleCells()
                                                                .map((cell) => (
                                                                    <TableCell
                                                                        key={
                                                                            cell.id
                                                                        }
                                                                    >
                                                                        {flexRender(
                                                                            cell
                                                                                .column
                                                                                .columnDef
                                                                                .cell,
                                                                            cell.getContext(),
                                                                        )}
                                                                    </TableCell>
                                                                ))}
                                                        </TableRow>
                                                    ))}
                                            </TableBody>
                                        </Table>
                                    </div>

                                    {/* Pagination */}
                                    {attempts.last_page > 1 &&
                                        !globalFilter && (
                                            <div className="mt-6 flex items-center justify-between">
                                                <p className="text-sm text-muted-foreground">
                                                    Showing{' '}
                                                    {attempts.data.length} of{' '}
                                                    {attempts.total} attempts
                                                </p>
                                                <Pagination>
                                                    <PaginationContent>
                                                        <PaginationItem>
                                                            <PaginationPrevious
                                                                href="#"
                                                                onClick={(
                                                                    e,
                                                                ) => {
                                                                    e.preventDefault();

                                                                    if (
                                                                        attempts.current_page >
                                                                        1
                                                                    ) {
                                                                        window.location.href =
                                                                            updatePageInUrl(
                                                                                attempts.current_page -
                                                                                    1,
                                                                            );
                                                                    }
                                                                }}
                                                                className={
                                                                    attempts.current_page ===
                                                                    1
                                                                        ? 'pointer-events-none opacity-50'
                                                                        : ''
                                                                }
                                                            />
                                                        </PaginationItem>
                                                        {Array.from(
                                                            {
                                                                length: attempts.last_page,
                                                            },
                                                            (_, i) => i + 1,
                                                        ).map((page) => {
                                                            const showPage =
                                                                page === 1 ||
                                                                page ===
                                                                    attempts.last_page ||
                                                                (page >=
                                                                    attempts.current_page -
                                                                        1 &&
                                                                    page <=
                                                                        attempts.current_page +
                                                                            1);

                                                            if (!showPage) {
                                                                if (
                                                                    page ===
                                                                        attempts.current_page -
                                                                            2 ||
                                                                    page ===
                                                                        attempts.current_page +
                                                                            2
                                                                ) {
                                                                    return (
                                                                        <PaginationItem
                                                                            key={
                                                                                page
                                                                            }
                                                                        >
                                                                            <PaginationEllipsis />
                                                                        </PaginationItem>
                                                                    );
                                                                }

                                                                return null;
                                                            }

                                                            return (
                                                                <PaginationItem
                                                                    key={page}
                                                                >
                                                                    <PaginationLink
                                                                        href="#"
                                                                        onClick={(
                                                                            e,
                                                                        ) => {
                                                                            e.preventDefault();
                                                                            window.location.href =
                                                                                updatePageInUrl(
                                                                                    page,
                                                                                );
                                                                        }}
                                                                        isActive={
                                                                            page ===
                                                                            attempts.current_page
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
                                                                onClick={(
                                                                    e,
                                                                ) => {
                                                                    e.preventDefault();

                                                                    if (
                                                                        attempts.current_page <
                                                                        attempts.last_page
                                                                    ) {
                                                                        window.location.href =
                                                                            updatePageInUrl(
                                                                                attempts.current_page +
                                                                                    1,
                                                                            );
                                                                    }
                                                                }}
                                                                className={
                                                                    attempts.current_page ===
                                                                    attempts.last_page
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
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

Results.layout = { breadcrumbs };
