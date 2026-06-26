import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    ClipboardList,
    Clock,
    Play,
    Trophy,
    ArrowRight,
    CheckCircle2,
    Timer,
    History,
    LogIn,
    BarChart3,
    BookOpen,
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import type { PageProps } from '@/types';
import type { ExamAttempt, ExamSession } from '@/types/models';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia } from '@/components/ui/empty';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
    joinByCode,
    take,
    showStart,
    history,
} from '@/actions/App/Http/Controllers/StudentExamController';
import type { SharedData } from '@/types';

interface StudentDashboardProps extends PageProps {
    availableSessions: ExamSession[];
    inProgressAttempts: ExamAttempt[];
    recentResults: ExamAttempt[];
    stats: {
        total_attempts: number;
        completed_exams: number;
        average_score: number;
        in_progress: number;
    };
}

export default function StudentDashboard({
    availableSessions,
    inProgressAttempts,
    recentResults,
    stats,
}: StudentDashboardProps) {
    const { auth } = usePage<SharedData>().props;

    const joinForm = useForm({
        access_code: '',
    });

    const handleJoinExam = (e: React.FormEvent) => {
        e.preventDefault();
        joinForm.post(joinByCode.url());
    };

    const getScoreBadge = (percentage: number) => {
        if (percentage >= 80) {
            return <Badge>Passed</Badge>;
        }

        if (percentage >= 60) {
            return <Badge variant="secondary">Fair</Badge>;
        }

        return <Badge variant="outline">Needs Improvement</Badge>;
    };

    const hasNoData =
        stats.total_attempts === 0 &&
        availableSessions.length === 0 &&
        inProgressAttempts.length === 0;

    return (
        <>
            <Head title="Student Dashboard" />

            <div className="p-6 md:p-8">
                <div className="mx-auto max-w-7xl flex flex-col gap-8">
                    {/* Welcome Section */}
                    <div className="flex flex-col gap-2">
                        <h1 className="text-3xl font-bold tracking-tight">
                            Welcome back, {auth.user.name}
                        </h1>
                        <p className="text-muted-foreground">
                            {hasNoData
                                ? 'Your dashboard is ready. Start by joining an exam using an access code from your instructor.'
                                : 'Track your exams, monitor progress, and review your results.'}
                        </p>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <Card className="transition-shadow hover:shadow-md">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Total Attempts
                                </CardTitle>
                                <div className="rounded-lg bg-primary/10 p-2">
                                    <ClipboardList className="h-4 w-4 text-primary" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">
                                    {stats.total_attempts}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    All time
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="transition-shadow hover:shadow-md">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Completed
                                </CardTitle>
                                <div className="rounded-lg bg-primary/10 p-2">
                                    <CheckCircle2 className="h-4 w-4 text-primary" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">
                                    {stats.completed_exams}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Exams finished
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="transition-shadow hover:shadow-md">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Average Score
                                </CardTitle>
                                <div className="rounded-lg bg-primary/10 p-2">
                                    <BarChart3 className="h-4 w-4 text-primary" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div
                                    className="text-3xl font-bold"
                                >
                                    {stats.completed_exams > 0
                                        ? `${stats.average_score.toFixed(1)}%`
                                        : '—'}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Overall performance
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="transition-shadow hover:shadow-md">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    In Progress
                                </CardTitle>
                                <div className="rounded-lg bg-primary/10 p-2">
                                    <Timer className="h-4 w-4 text-primary" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">
                                    {stats.in_progress}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Active exams
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card className="border-dashed transition-colors hover:border-primary/50 hover:bg-accent/50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <div className="rounded-lg bg-primary/10 p-2">
                                        <LogIn className="h-4 w-4 text-primary" />
                                    </div>
                                    Join an Exam
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    Use an access code from your instructor
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="border-dashed transition-colors hover:border-primary/50 hover:bg-accent/50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <div className="rounded-lg bg-primary/10 p-2">
                                        <History className="h-4 w-4 text-primary" />
                                    </div>
                                    View History
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-3">
                                <p className="text-sm text-muted-foreground">
                                    Review your past results
                                </p>
                                <Button variant="outline" size="sm" render={<Link href={history.url()} />}>
                                    See All Results
                                </Button>
                            </CardContent>
                        </Card>
                        <Card className="border-dashed transition-colors hover:border-primary/50 hover:bg-accent/50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <div className="rounded-lg bg-primary/10 p-2">
                                        <BookOpen className="h-4 w-4 text-primary" />
                                    </div>
                                    Available Exams
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    {availableSessions.length > 0
                                        ? `${availableSessions.length} exam(s) ready for you`
                                        : 'No exams available right now'}
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Join Exam Form */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <LogIn data-icon="inline-start" className="text-primary" />
                                Join an Exam
                            </CardTitle>
                            <CardDescription>
                                Enter the 8-character access code provided by
                                your instructor
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form
                                onSubmit={handleJoinExam}
                                className="flex flex-col gap-4 sm:flex-row"
                            >
                                <Input
                                    placeholder="Enter access code"
                                    value={joinForm.data.access_code}
                                    onChange={(e) =>
                                        joinForm.setData(
                                            'access_code',
                                            e.target.value.toUpperCase(),
                                        )
                                    }
                                    className="max-w-xs font-mono text-lg tracking-widest uppercase"
                                    maxLength={8}
                                />
                                <Button
                                    type="submit"
                                    disabled={
                                        joinForm.processing ||
                                        joinForm.data.access_code.length !== 8
                                    }
                                >
                                    <LogIn data-icon="inline-start" />
                                    Join Exam
                                </Button>
                            </form>
                            {joinForm.errors.access_code && (
                                <p className="mt-2 text-sm text-destructive">
                                    {joinForm.errors.access_code}
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    <div className="grid gap-6 lg:grid-cols-2">
                        {/* In Progress Exams */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Timer data-icon="inline-start" className="text-primary" />
                                    Continue Your Exam
                                </CardTitle>
                                <CardDescription>
                                    Pick up where you left off
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {inProgressAttempts.length === 0 ? (
                                    <Empty>
                                        <EmptyMedia variant="icon">
                                            <Timer />
                                        </EmptyMedia>
                                        <EmptyHeader>
                                            <EmptyTitle>
                                                No exams in progress
                                            </EmptyTitle>
                                            <EmptyDescription>
                                                Join an exam to get started
                                            </EmptyDescription>
                                        </EmptyHeader>
                                    </Empty>
                                ) : (
                                    <div className="flex flex-col gap-3">
                                        {inProgressAttempts.map((attempt) => (
                                            <div
                                                key={attempt.id}
                                                className="flex items-center justify-between rounded-lg border p-4 transition-shadow hover:shadow-sm"
                                            >
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate font-medium">
                                                        {attempt.exam_session
                                                            ?.exam?.title || 'Untitled Exam'}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        Started{' '}
                                                        {formatDistanceToNow(
                                                            new Date(
                                                                attempt.started_at,
                                                            ),
                                                            { addSuffix: true },
                                                        )}
                                                    </p>
                                                </div>
                                                <Button
                                                    className="ml-4 shrink-0"
                                                    render={
                                                        <Link
                                                            href={take.url(
                                                                attempt.id,
                                                            )}
                                                        />
                                                    }
                                                >
                                                    <Play data-icon="inline-start" />
                                                    Continue
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Available Exams */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <ClipboardList data-icon="inline-start" className="text-primary" />
                                        Available Exams
                                    </CardTitle>
                                    <CardDescription>
                                        Exams you can take right now
                                    </CardDescription>
                                </div>
                                {availableSessions.length > 0 && (
                                    <Badge variant="secondary">
                                        {availableSessions.length} available
                                    </Badge>
                                )}
                            </CardHeader>
                            <CardContent>
                                {availableSessions.length === 0 ? (
                                    <Empty>
                                        <EmptyMedia variant="icon">
                                            <ClipboardList />
                                        </EmptyMedia>
                                        <EmptyHeader>
                                            <EmptyTitle>
                                                No exams available
                                            </EmptyTitle>
                                            <EmptyDescription>
                                                Check back later or ask your
                                                instructor
                                            </EmptyDescription>
                                        </EmptyHeader>
                                    </Empty>
                                ) : (
                                    <div className="flex flex-col gap-3">
                                        {availableSessions
                                            .slice(0, 5)
                                            .map((session) => (
                                                <div
                                                    key={session.id}
                                                    className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
                                                >
                                                    <div className="min-w-0 flex-1">
                                                        <p className="truncate font-medium">
                                                            {session.title}
                                                        </p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {session.exam
                                                                ?.module
                                                                ?.name ||
                                                                'General'}{' '}
                                                            •{' '}
                                                            {session.exam
                                                                ?.total_items ||
                                                                0}{' '}
                                                            questions
                                                        </p>
                                                        <div className="mt-1 flex flex-wrap gap-2">
                                                            {session.time_limit_minutes && (
                                                                <Badge
                                                                    variant="outline"
                                                                    className="text-xs"
                                                                >
                                                                    <Clock className="mr-1 h-3 w-3" />
                                                                    {
                                                                        session.time_limit_minutes
                                                                    }{' '}
                                                                    min
                                                                </Badge>
                                                            )}
                                                            <Badge
                                                                variant="outline"
                                                                className="text-xs"
                                                            >
                                                                {
                                                                    session.max_attempts
                                                                }{' '}
                                                                attempt
                                                                {session.max_attempts !== 1
                                                                    ? 's'
                                                                    : ''}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        variant="outline"
                                                        className="ml-4 shrink-0"
                                                        render={
                                                            <Link
                                                                href={showStart.url(
                                                                    session.id,
                                                                )}
                                                            />
                                                        }
                                                    >
                                                        Start
                                                        <ArrowRight data-icon="inline-end" />
                                                    </Button>
                                                </div>
                                            ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Recent Results */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <Trophy data-icon="inline-start" className="text-primary" />
                                        Recent Results
                                    </CardTitle>
                                    <CardDescription>
                                        Your latest exam outcomes
                                    </CardDescription>
                                </div>
                                {recentResults.length > 0 && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        render={<Link href={history.url()} />}
                                    >
                                        View All
                                        <ArrowRight data-icon="inline-end" />
                                    </Button>
                                )}
                            </CardHeader>
                            <CardContent>
                                {recentResults.length === 0 ? (
                                    <Empty>
                                        <EmptyMedia variant="icon">
                                            <Trophy />
                                        </EmptyMedia>
                                        <EmptyHeader>
                                            <EmptyTitle>
                                                No results yet
                                            </EmptyTitle>
                                            <EmptyDescription>
                                                Complete an exam to see your
                                                results here
                                            </EmptyDescription>
                                        </EmptyHeader>
                                    </Empty>
                                ) : (
                                    <div className="flex flex-col gap-3">
                                        {recentResults
                                            .slice(0, 5)
                                            .map((result) => (
                                                <div
                                                    key={result.id}
                                                    className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
                                                >
                                                    <div className="min-w-0 flex-1">
                                                        <p className="truncate font-medium">
                                                            {result
                                                                .exam_session
                                                                ?.exam?.title ||
                                                                'Untitled Exam'}
                                                        </p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {result.submitted_at
                                                                ? format(
                                                                      new Date(
                                                                          result.submitted_at,
                                                                      ),
                                                                      'MMM d, yyyy',
                                                                  )
                                                                : 'In progress'}
                                                        </p>
                                                    </div>
                                                    <div className="ml-4 shrink-0 text-right">
                                                        <p
                                                            className="text-lg font-bold"
                                                        >
                                                            {result.percentage?.toFixed(
                                                                1,
                                                            )}
                                                            %
                                                        </p>
                                                        {getScoreBadge(
                                                            result.percentage ||
                                                                0,
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Performance Overview */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 data-icon="inline-start" className="text-primary" />
                                Performance Overview
                            </CardTitle>
                            <CardDescription>
                                Your overall exam statistics
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {stats.completed_exams === 0 ? (
                                <Empty>
                                    <EmptyMedia variant="icon">
                                        <BarChart3 />
                                    </EmptyMedia>
                                    <EmptyHeader>
                                        <EmptyTitle>
                                            No performance data yet
                                        </EmptyTitle>
                                        <EmptyDescription>
                                            Complete an exam to see your
                                            performance statistics
                                        </EmptyDescription>
                                    </EmptyHeader>
                                </Empty>
                            ) : (
                                <div className="grid gap-6 sm:grid-cols-2">
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">
                                                Completion Rate
                                            </span>
                                            <span className="font-medium">
                                                {stats.total_attempts > 0
                                                    ? `${((stats.completed_exams / stats.total_attempts) * 100).toFixed(0)}%`
                                                    : '0%'}
                                            </span>
                                        </div>
                                        <Progress
                                            value={
                                                stats.total_attempts > 0
                                                    ? (stats.completed_exams /
                                                          stats.total_attempts) *
                                                      100
                                                    : 0
                                            }
                                            className="h-2"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">
                                                Average Score
                                            </span>
                                            <span className="font-medium">
                                                {stats.average_score.toFixed(1)}%
                                            </span>
                                        </div>
                                        <Progress
                                            value={stats.average_score}
                                            className="h-2"
                                        />
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

StudentDashboard.layout = {
    breadcrumbs: [{ title: 'Dashboard', href: '' }],
};
