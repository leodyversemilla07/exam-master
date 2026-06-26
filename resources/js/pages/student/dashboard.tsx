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

    const getScoreColor = (percentage: number) => {
        if (percentage >= 80) {
            return 'text-green-600';
        }

        if (percentage >= 60) {
            return 'text-yellow-600';
        }

        return 'text-red-600';
    };

    const getScoreBadge = (percentage: number) => {
        if (percentage >= 80) {
            return (<Badge className="bg-green-100 text-green-800">Passed</Badge>);
        }

        if (percentage >= 60) {
            return (<Badge className="bg-yellow-100 text-yellow-800">Fair</Badge>);
        }

        return (<Badge className="bg-red-100 text-red-800">Needs Improvement</Badge>);
    };

    const hasNoData =
        stats.total_attempts === 0 &&
        availableSessions.length === 0 &&
        inProgressAttempts.length === 0;

    return (
        <>
            <Head title="Student Dashboard" />

            <div className="p-6 md:p-8">
                <div className="mx-auto max-w-7xl space-y-8">
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
                                <div className="rounded-lg bg-green-100 p-2">
                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
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
                                <div className="rounded-lg bg-amber-100 p-2">
                                    <BarChart3 className="h-4 w-4 text-amber-600" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div
                                    className={`text-3xl font-bold ${stats.completed_exams > 0 ? getScoreColor(stats.average_score) : 'text-muted-foreground'}`}
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
                                <div className="rounded-lg bg-blue-100 p-2">
                                    <Timer className="h-4 w-4 text-blue-600" />
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
                            <CardContent className="flex flex-col items-center justify-center gap-3 py-8">
                                <div className="rounded-full bg-primary/10 p-4">
                                    <LogIn className="h-6 w-6 text-primary" />
                                </div>
                                <div className="text-center">
                                    <p className="font-semibold">Join an Exam</p>
                                    <p className="text-sm text-muted-foreground">
                                        Use an access code from your instructor
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border-dashed transition-colors hover:border-amber-500/50 hover:bg-accent/50">
                            <CardContent className="flex flex-col items-center justify-center gap-3 py-8">
                                <div className="rounded-full bg-amber-100 p-4">
                                    <History className="h-6 w-6 text-amber-600" />
                                </div>
                                <div className="text-center">
                                    <p className="font-semibold">
                                        View History
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Review your past results
                                    </p>
                                </div>
                                <Button variant="outline" size="sm" render={<Link href={history.url()} />}>
                                    See All Results
                                </Button>
                            </CardContent>
                        </Card>
                        <Card className="border-dashed transition-colors hover:border-green-500/50 hover:bg-accent/50">
                            <CardContent className="flex flex-col items-center justify-center gap-3 py-8">
                                <div className="rounded-full bg-green-100 p-4">
                                    <BookOpen className="h-6 w-6 text-green-600" />
                                </div>
                                <div className="text-center">
                                    <p className="font-semibold">
                                        Available Exams
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {availableSessions.length > 0
                                            ? `${availableSessions.length} exam(s) ready for you`
                                            : 'No exams available right now'}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Join Exam Form */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <LogIn className="h-5 w-5 text-primary" />
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
                                    <LogIn className="mr-2 h-4 w-4" />
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
                        {inProgressAttempts.length > 0 && (
                            <Card className="border-yellow-200 bg-linear-to-br from-yellow-50 to-transparent">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-yellow-700">
                                        <Timer className="h-5 w-5" />
                                        Continue Your Exam
                                    </CardTitle>
                                    <CardDescription>
                                        Pick up where you left off
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {inProgressAttempts.map((attempt) => (
                                            <div
                                                key={attempt.id}
                                                className="flex items-center justify-between rounded-lg border bg-white p-4 transition-shadow hover:shadow-sm"
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
                                                    <Play className="mr-2 h-4 w-4" />
                                                    Continue
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Available Exams */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <ClipboardList className="h-5 w-5 text-primary" />
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
                                    <div className="flex flex-col items-center gap-2 py-12 text-center">
                                        <ClipboardList className="h-12 w-12 text-muted-foreground/40" />
                                        <p className="font-medium text-muted-foreground">
                                            No exams available
                                        </p>
                                        <p className="text-sm text-muted-foreground/70">
                                            Check back later or ask your
                                            instructor
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
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
                                                        <ArrowRight className="ml-2 h-4 w-4" />
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
                                        <Trophy className="h-5 w-5 text-amber-500" />
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
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                )}
                            </CardHeader>
                            <CardContent>
                                {recentResults.length === 0 ? (
                                    <div className="flex flex-col items-center gap-2 py-12 text-center">
                                        <Trophy className="h-12 w-12 text-muted-foreground/40" />
                                        <p className="font-medium text-muted-foreground">
                                            No results yet
                                        </p>
                                        <p className="text-sm text-muted-foreground/70">
                                            Complete an exam to see your results
                                            here
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
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
                                                            className={`text-lg font-bold ${getScoreColor(result.percentage || 0)}`}
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

                    {/* Performance Overview (only if there's data) */}
                    {stats.completed_exams > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BarChart3 className="h-5 w-5 text-primary" />
                                    Performance Overview
                                </CardTitle>
                                <CardDescription>
                                    Your overall exam statistics
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-6 sm:grid-cols-2">
                                    <div className="space-y-2">
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
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">
                                                Average Score
                                            </span>
                                            <span
                                                className={`font-medium ${getScoreColor(stats.average_score)}`}
                                            >
                                                {stats.average_score.toFixed(
                                                    1,
                                                )}
                                                %
                                            </span>
                                        </div>
                                        <Progress
                                            value={stats.average_score}
                                            className="h-2"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </>
    );
}

StudentDashboard.layout = {
    breadcrumbs: [{ title: 'Dashboard', href: '' }],
};
