import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Edit,
    Copy,
    RefreshCw,
    Download,
    Clock,
    Users,
    Calendar,
    CheckCircle,
    XCircle,
    AlertCircle,
    BarChart3,
    TrendingUp,
    TrendingDown,
} from 'lucide-react';
import { BreadcrumbItem } from '@/types';
import { ExamAttempt, Exam } from '@/types/models';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
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
import * as examSessions from '@/routes/exam-sessions';
import { useState } from 'react';
import PageHeader from '@/components/page-header';

const breadcrumbs = (session: SessionWithRelations): BreadcrumbItem[] => [
    { title: 'Exam Sessions', href: examSessions.index.url() },
    { title: session.title, href: examSessions.show.url(session.id) },
];

interface SessionUser {
    id: number;
    name: string;
    email: string;
}

interface SessionWithRelations {
    id: number;
    exam_id: number;
    title: string;
    description: string | null;
    access_code: string;
    start_time: string;
    end_time: string;
    time_limit_minutes: number | null;
    max_attempts: number;
    shuffle_questions: boolean;
    shuffle_options: boolean;
    show_results: boolean;
    show_results_immediately: boolean;
    show_correct_answers: boolean;
    allow_review: boolean;
    passing_score: number | null;
    status: 'draft' | 'active' | 'ended';
    created_by: number;
    created_at: string;
    updated_at: string;
    exam: Exam & {
        module: { id: number; name: string } | null;
        questions: { id: number }[];
    };
    creator: SessionUser;
    attempts: (ExamAttempt & { user: SessionUser })[];
}

interface SessionStats {
    total_attempts: number;
    completed_attempts: number;
    in_progress: number;
    average_score: number;
    highest_score: number;
    lowest_score: number;
}

interface PageProps {
    session: SessionWithRelations;
    stats: SessionStats;
}

function getStatusBadge(session: SessionWithRelations) {
    const now = new Date();
    const startTime = new Date(session.start_time);
    const endTime = new Date(session.end_time);

    if (session.status === 'ended' || now > endTime) {
        return (
            <Badge variant="secondary" className="gap-1">
                <XCircle className="h-3 w-3" /> Ended
            </Badge>
        );
    }
    if (session.status === 'draft') {
        return (
            <Badge variant="outline" className="gap-1">
                <AlertCircle className="h-3 w-3" /> Draft
            </Badge>
        );
    }
    if (now < startTime) {
        return (
            <Badge variant="outline" className="gap-1 text-blue-600 border-blue-600">
                <Clock className="h-3 w-3" /> Upcoming
            </Badge>
        );
    }
    return (
        <Badge className="gap-1 bg-green-600">
            <CheckCircle className="h-3 w-3" /> Active
        </Badge>
    );
}

function getAttemptStatusBadge(status: string) {
    switch (status) {
        case 'in_progress':
            return (
                <Badge variant="outline" className="gap-1 text-blue-600 border-blue-600">
                    <Clock className="h-3 w-3" /> In Progress
                </Badge>
            );
        case 'submitted':
            return (
                <Badge variant="secondary" className="gap-1">
                    <CheckCircle className="h-3 w-3" /> Submitted
                </Badge>
            );
        case 'graded':
            return (
                <Badge className="gap-1 bg-green-600">
                    <CheckCircle className="h-3 w-3" /> Graded
                </Badge>
            );
        default:
            return <Badge variant="outline">{status}</Badge>;
    }
}

export default function Show({ session, stats }: PageProps) {
    const [copiedCode, setCopiedCode] = useState(false);
    const [regenerating, setRegenerating] = useState(false);

    const copyAccessCode = () => {
        navigator.clipboard.writeText(session.access_code);
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
    };

    const handleRegenerateCode = () => {
        setRegenerating(true);
        router.post(
            examSessions.regenerateCode.url(session.id),
            {},
            {
                onFinish: () => setRegenerating(false),
            },
        );
    };

    const handleExport = () => {
        window.location.href = examSessions.exportResults.url(session.id);
    };

    const completedAttempts = session.attempts.filter(
        (a) => a.status === 'submitted' || a.status === 'graded',
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs(session)}>
            <Head title={session.title} />

            <div className="p-4 md:p-6 space-y-6">
                <PageHeader
                    title={
                        <div className="flex items-center gap-3">
                            {session.title}
                            {getStatusBadge(session)}
                        </div>
                    }
                    description={`${session.exam.title}${session.exam.module ? ` • ${session.exam.module.name}` : ''}`}
                    actions={
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={handleExport}
                                disabled={completedAttempts.length === 0}
                            >
                                <Download className="mr-2 h-4 w-4" />
                                Export CSV
                            </Button>
                            <Button variant="outline" asChild>
                                <Link href={examSessions.edit.url(session.id)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                </Link>
                            </Button>
                        </div>
                    }
                />

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Stats Cards */}
                        <div className="grid gap-4 md:grid-cols-3">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Total Attempts
                                    </CardTitle>
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stats.total_attempts}</div>
                                    <p className="text-xs text-muted-foreground">
                                        {stats.in_progress} in progress, {stats.completed_attempts}{' '}
                                        completed
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Average Score
                                    </CardTitle>
                                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {stats.average_score
                                            ? `${stats.average_score.toFixed(1)}%`
                                            : 'N/A'}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Based on {stats.completed_attempts} submissions
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Score Range
                                    </CardTitle>
                                    <div className="flex gap-1">
                                        <TrendingUp className="h-4 w-4 text-green-600" />
                                        <TrendingDown className="h-4 w-4 text-red-600" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {stats.lowest_score
                                            ? `${stats.lowest_score.toFixed(0)}%`
                                            : '--'}{' '}
                                        -{' '}
                                        {stats.highest_score
                                            ? `${stats.highest_score.toFixed(0)}%`
                                            : '--'}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Lowest to highest
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Student Attempts */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Student Attempts</CardTitle>
                                <CardDescription>
                                    {session.attempts.length} total attempt
                                    {session.attempts.length !== 1 ? 's' : ''}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {session.attempts.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-8 text-center">
                                        <Users className="h-12 w-12 text-muted-foreground mb-4" />
                                        <h3 className="font-semibold mb-2">No Attempts Yet</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Share the access code with students to get started.
                                        </p>
                                    </div>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Student</TableHead>
                                                <TableHead>Attempt</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Score</TableHead>
                                                <TableHead>Time Spent</TableHead>
                                                <TableHead>Submitted</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {session.attempts.map((attempt) => (
                                                <TableRow key={attempt.id}>
                                                    <TableCell>
                                                        <div>
                                                            <div className="font-medium">
                                                                {attempt.user.name}
                                                            </div>
                                                            <div className="text-sm text-muted-foreground">
                                                                {attempt.user.email}
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>#{attempt.attempt_number}</TableCell>
                                                    <TableCell>
                                                        {getAttemptStatusBadge(attempt.status)}
                                                    </TableCell>
                                                    <TableCell>
                                                        {attempt.status !== 'in_progress' ? (
                                                            <div>
                                                                <div className="font-medium">
                                                                    {attempt.score?.toFixed(1)} /{' '}
                                                                    {session.exam.questions.length}
                                                                </div>
                                                                <div className="text-sm text-muted-foreground">
                                                                    {attempt.percentage?.toFixed(1)}
                                                                    %
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <span className="text-muted-foreground">
                                                                —
                                                            </span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        {attempt.time_spent_seconds ? (
                                                            `${Math.floor(attempt.time_spent_seconds / 60)} min`
                                                        ) : (
                                                            <span className="text-muted-foreground">
                                                                —
                                                            </span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        {attempt.submitted_at ? (
                                                            <div className="text-sm">
                                                                {new Date(
                                                                    attempt.submitted_at,
                                                                ).toLocaleDateString()}
                                                                <br />
                                                                <span className="text-muted-foreground">
                                                                    {new Date(
                                                                        attempt.submitted_at,
                                                                    ).toLocaleTimeString([], {
                                                                        hour: '2-digit',
                                                                        minute: '2-digit',
                                                                    })}
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-muted-foreground">
                                                                In progress
                                                            </span>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Session Info */}
                    <div className="space-y-6">
                        {/* Access Code Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Access Code</CardTitle>
                                <CardDescription>
                                    Share this code with students to join the exam
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 p-4 bg-muted rounded-lg text-center">
                                        <code className="text-3xl font-bold tracking-widest">
                                            {session.access_code}
                                        </code>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        className="flex-1"
                                        onClick={copyAccessCode}
                                    >
                                        {copiedCode ? (
                                            <>
                                                <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                                                Copied!
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="mr-2 h-4 w-4" />
                                                Copy
                                            </>
                                        )}
                                    </Button>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="outline" disabled={regenerating}>
                                                <RefreshCw
                                                    className={`h-4 w-4 ${regenerating ? 'animate-spin' : ''}`}
                                                />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>
                                                    Regenerate Access Code?
                                                </AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This will create a new access code. Students
                                                    with the old code will no longer be able to
                                                    join.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={handleRegenerateCode}>
                                                    Regenerate
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Schedule Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5" />
                                    Schedule
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Start Time</p>
                                    <p className="font-medium">
                                        {new Date(session.start_time).toLocaleDateString()} at{' '}
                                        {new Date(session.start_time).toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">End Time</p>
                                    <p className="font-medium">
                                        {new Date(session.end_time).toLocaleDateString()} at{' '}
                                        {new Date(session.end_time).toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Settings Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Clock className="h-5 w-5" />
                                    Settings
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">
                                        Time Limit
                                    </span>
                                    <span className="text-sm font-medium">
                                        {session.time_limit_minutes
                                            ? `${session.time_limit_minutes} min`
                                            : session.exam.time_limit
                                              ? `${session.exam.time_limit} min (default)`
                                              : 'No limit'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">
                                        Max Attempts
                                    </span>
                                    <span className="text-sm font-medium">
                                        {session.max_attempts}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">
                                        Shuffle Questions
                                    </span>
                                    <span className="text-sm font-medium">
                                        {session.shuffle_questions ? 'Yes' : 'No'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">
                                        Shuffle Options
                                    </span>
                                    <span className="text-sm font-medium">
                                        {session.shuffle_options ? 'Yes' : 'No'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">
                                        Show Results
                                    </span>
                                    <span className="text-sm font-medium">
                                        {session.show_results_immediately
                                            ? 'Immediately'
                                            : 'After review'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">
                                        Show Correct Answers
                                    </span>
                                    <span className="text-sm font-medium">
                                        {session.show_correct_answers ? 'Yes' : 'No'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">
                                        Allow Review
                                    </span>
                                    <span className="text-sm font-medium">
                                        {session.allow_review ? 'Yes' : 'No'}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Creator Info */}
                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-sm text-muted-foreground">
                                    Created by{' '}
                                    <span className="font-medium text-foreground">
                                        {session.creator.name}
                                    </span>
                                    <br />
                                    on {new Date(session.created_at).toLocaleDateString()}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
