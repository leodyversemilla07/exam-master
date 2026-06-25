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
import PageHeader from '@/components/page-header';
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
            return 'text-green-600';
        }

        if (percentage >= 60) {
            return 'text-yellow-600';
        }

        return 'text-red-600';
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

            <div className="flex flex-col gap-6">
                <PageHeader
                    title="Exam History"
                    description="View all your past exam attempts and results"
                />

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <History className="h-5 w-5" />
                            All Attempts
                        </CardTitle>
                        <CardDescription>
                            {attempts.total} total attempt
                            {attempts.total !== 1 ? 's' : ''}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {attempts.data.length === 0 ? (
                            <div className="py-12 text-center">
                                <Trophy className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                                <p className="text-muted-foreground">
                                    You haven't taken any exams yet.
                                </p>
                                <Button render={<Link href={DashboardController.url()} />} nativeButton={false} className="mt-4">
                                    Find Available Exams
                                </Button>
                            </div>
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
                                                    <Clock className="h-4 w-4 text-muted-foreground" />
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
                                                    <Button size="sm" render={<Link href={take.url(attempt.id)} />} nativeButton={false}>
                                                        Continue
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        render={<Link href={results.url(attempt.id)} />}
                                                        nativeButton={false}
                                                    >
                                                        <Eye className="mr-1 h-4 w-4" />
                                                        View
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}

                        {/* Pagination */}
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
                                        render={<Link href={historyRoute.url({ query: { page } })} />}
                                        nativeButton={false}
                                    >
                                        {page}
                                    </Button>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

ExamHistory.layout = { breadcrumbs: [] };
