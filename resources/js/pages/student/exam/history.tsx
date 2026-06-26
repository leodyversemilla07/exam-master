import { Head, Link } from '@inertiajs/react';
import { History, Eye, Clock, Trophy } from 'lucide-react';
import { format } from 'date-fns';
import type { PageProps } from '@/types';
import type { ExamAttempt } from '@/types/models';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Empty,
    EmptyHeader,
    EmptyTitle,
    EmptyDescription,
    EmptyMedia,
    EmptyContent,
} from '@/components/ui/empty';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import DashboardController from '@/actions/App/Http/Controllers/DashboardController';
import {
    take,
    results,
    history as historyRoute,
} from '@/actions/App/Http/Controllers/StudentExamController';

interface Pagination<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface ExamHistoryProps extends PageProps {
    attempts: Pagination<ExamAttempt>;
}

export default function ExamHistory({ attempts }: ExamHistoryProps) {
    const getScoreColor = (percentage: number | null) => {
        if (percentage === null) {
            return '';
        }

        if (percentage >= 80) {
            return 'text-primary';
        }

        if (percentage >= 60) {
            return 'text-muted-foreground';
        }

        return 'text-destructive';
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'in_progress':
                return <Badge variant="outline">In Progress</Badge>;
            case 'submitted':
                return <Badge variant="secondary">Submitted</Badge>;
            case 'graded':
                return <Badge>Graded</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const formatDuration = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);

        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }

        return `${minutes}m`;
    };

    return (
        <>
            <Head title="Exam History" />

            <div className="p-6 md:p-8">
                <div className="mx-auto max-w-7xl flex flex-col gap-8">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-3xl font-bold tracking-tight">
                            Exam History
                        </h1>
                        <p className="text-muted-foreground">
                            View all your past exam attempts and results
                        </p>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <History data-icon="inline-start" className="text-primary" />
                                All Attempts
                            </CardTitle>
                            <CardDescription>
                                {attempts.total} total attempt
                                {attempts.total !== 1 ? 's' : ''}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {attempts.data.length === 0 ? (
                                <Empty>
                                    <EmptyMedia variant="icon">
                                        <Trophy />
                                    </EmptyMedia>
                                    <EmptyHeader>
                                        <EmptyTitle>
                                            No exams taken yet
                                        </EmptyTitle>
                                        <EmptyDescription>
                                            You haven't taken any exams yet.
                                            Find available exams to get started.
                                        </EmptyDescription>
                                    </EmptyHeader>
                                    <EmptyContent>
                                        <Button
                                            render={
                                                <Link
                                                    href={DashboardController.url()}
                                                />
                                            }
                                        >
                                            Find Available Exams
                                        </Button>
                                    </EmptyContent>
                                </Empty>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Exam</TableHead>
                                            <TableHead>Subject</TableHead>
                                            <TableHead>Attempt</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Duration</TableHead>
                                            <TableHead>Score</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">
                                                Actions
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {attempts.data.map((attempt) => (
                                            <TableRow key={attempt.id}>
                                                <TableCell className="font-medium">
                                                    {attempt.exam_session?.exam
                                                        ?.title || 'Unknown Exam'}
                                                </TableCell>
                                                <TableCell>
                                                    {attempt.exam_session?.exam
                                                        ?.module?.name || '-'}
                                                </TableCell>
                                                <TableCell>
                                                    #{attempt.attempt_number}
                                                </TableCell>
                                                <TableCell>
                                                    {attempt.submitted_at
                                                        ? format(
                                                              new Date(
                                                                  attempt.submitted_at,
                                                              ),
                                                              'MMM d, yyyy',
                                                          )
                                                        : format(
                                                              new Date(
                                                                  attempt.started_at,
                                                              ),
                                                              'MMM d, yyyy',
                                                          )}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1">
                                                        <Clock data-icon="inline-start" className="text-muted-foreground" />
                                                        {formatDuration(
                                                            attempt.time_spent_seconds,
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {attempt.percentage !== null ? (
                                                        <span
                                                            className={cn(
                                                                'font-medium',
                                                                getScoreColor(
                                                                    attempt.percentage,
                                                                ),
                                                            )}
                                                        >
                                                            {attempt.percentage.toFixed(
                                                                1,
                                                            )}
                                                            %
                                                        </span>
                                                    ) : (
                                                        <span className="text-muted-foreground">
                                                            -
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {getStatusBadge(attempt.status)}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {attempt.status ===
                                                    'in_progress' ? (
                                                        <Button
                                                            size="sm"
                                                            render={
                                                                <Link
                                                                    href={take.url(
                                                                        attempt.id,
                                                                    )}
                                                                />
                                                            }
                                                        >
                                                            Continue
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            render={
                                                                <Link
                                                                    href={results.url(
                                                                        attempt.id,
                                                                    )}
                                                                />
                                                            }
                                                        >
                                                            <Eye data-icon="inline-start" />
                                                            View
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}

                            {attempts.last_page > 1 && (
                                <div className="mt-6 flex justify-center gap-2">
                                    {Array.from(
                                        { length: attempts.last_page },
                                        (_, i) => i + 1,
                                    ).map((page) => (
                                        <Button
                                            key={page}
                                            variant={
                                                page === attempts.current_page
                                                    ? 'default'
                                                    : 'outline'
                                            }
                                            size="sm"
                                            render={
                                                <Link
                                                    href={historyRoute.url({
                                                        query: { page },
                                                    })}
                                                />
                                            }
                                        >
                                            {page}
                                        </Button>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

ExamHistory.layout = { breadcrumbs: [] };
