import AppLayout from '@/layouts/app-layout';
import { PageProps } from '@/types';
import { ExamAttempt, ExamSession } from '@/types/models';
import { Head, Link, useForm } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PageHeader from '@/components/page-header';
import {
    ClipboardList,
    Clock,
    Play,
    Trophy,
    TrendingUp,
    FileText,
    ArrowRight,
    CheckCircle2,
    Timer,
    History,
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import {
    joinByCode,
    take,
    showStart,
    history,
} from '@/actions/App/Http/Controllers/StudentExamController';

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
    const joinForm = useForm({
        access_code: '',
    });

    const handleJoinExam = (e: React.FormEvent) => {
        e.preventDefault();
        joinForm.post(joinByCode.url());
    };

    const getScoreColor = (percentage: number) => {
        if (percentage >= 80) return 'text-green-600';
        if (percentage >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getScoreBadge = (percentage: number) => {
        if (percentage >= 80) return <Badge className="bg-green-100 text-green-800">Passed</Badge>;
        if (percentage >= 60) return <Badge className="bg-yellow-100 text-yellow-800">Fair</Badge>;
        return <Badge className="bg-red-100 text-red-800">Needs Improvement</Badge>;
    };

    return (
        <AppLayout>
            <Head title="Student Dashboard" />

            <div className="flex flex-col gap-6">
                <PageHeader
                    title="Student Dashboard"
                    description="Take exams, view results, and track your progress"
                />

                {/* Quick Stats */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Attempts</CardTitle>
                            <ClipboardList className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_attempts}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Completed Exams</CardTitle>
                            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.completed_exams}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div
                                className={`text-2xl font-bold ${getScoreColor(stats.average_score)}`}
                            >
                                {stats.average_score.toFixed(1)}%
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                            <Timer className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.in_progress}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Join Exam Form */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Join an Exam
                        </CardTitle>
                        <CardDescription>
                            Enter the access code provided by your instructor to join an exam
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleJoinExam} className="flex gap-4">
                            <Input
                                placeholder="Enter 8-character access code"
                                value={joinForm.data.access_code}
                                onChange={(e) =>
                                    joinForm.setData('access_code', e.target.value.toUpperCase())
                                }
                                className="max-w-xs font-mono text-lg tracking-wider uppercase"
                                maxLength={8}
                            />
                            <Button
                                type="submit"
                                disabled={
                                    joinForm.processing || joinForm.data.access_code.length !== 8
                                }
                            >
                                <Play className="h-4 w-4 mr-2" />
                                Join Exam
                            </Button>
                        </form>
                        {joinForm.errors.access_code && (
                            <p className="text-sm text-red-500 mt-2">
                                {joinForm.errors.access_code}
                            </p>
                        )}
                    </CardContent>
                </Card>

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* In Progress Exams */}
                    {inProgressAttempts.length > 0 && (
                        <Card className="border-yellow-200 bg-yellow-50/50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-yellow-700">
                                    <Clock className="h-5 w-5" />
                                    Continue Your Exam
                                </CardTitle>
                                <CardDescription>
                                    You have exams in progress - continue where you left off
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {inProgressAttempts.map((attempt) => (
                                        <div
                                            key={attempt.id}
                                            className="flex items-center justify-between p-3 bg-white rounded-lg border"
                                        >
                                            <div>
                                                <p className="font-medium">
                                                    {attempt.exam_session?.exam?.title}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    Started{' '}
                                                    {formatDistanceToNow(
                                                        new Date(attempt.started_at),
                                                        { addSuffix: true },
                                                    )}
                                                </p>
                                            </div>
                                            <Button asChild>
                                                <Link href={take.url(attempt.id)}>
                                                    <Play className="h-4 w-4 mr-2" />
                                                    Continue
                                                </Link>
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Available Exams */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ClipboardList className="h-5 w-5" />
                                Available Exams
                            </CardTitle>
                            <CardDescription>Exams you can take right now</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {availableSessions.length === 0 ? (
                                <p className="text-muted-foreground text-center py-8">
                                    No exams available at the moment
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {availableSessions.slice(0, 5).map((session) => (
                                        <div
                                            key={session.id}
                                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                                        >
                                            <div>
                                                <p className="font-medium">{session.title}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {session.exam?.module?.name} •{' '}
                                                    {session.exam?.total_items} questions
                                                </p>
                                                <div className="flex gap-2 mt-1">
                                                    {session.time_limit_minutes && (
                                                        <Badge variant="outline">
                                                            <Clock className="h-3 w-3 mr-1" />
                                                            {session.time_limit_minutes} min
                                                        </Badge>
                                                    )}
                                                    <Badge variant="outline">
                                                        {session.max_attempts} attempt(s)
                                                    </Badge>
                                                </div>
                                            </div>
                                            <Button asChild variant="outline">
                                                <Link href={showStart.url(session.id)}>
                                                    Start
                                                    <ArrowRight className="h-4 w-4 ml-2" />
                                                </Link>
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
                                    <Trophy className="h-5 w-5" />
                                    Recent Results
                                </CardTitle>
                                <CardDescription>Your latest exam results</CardDescription>
                            </div>
                            <Button variant="ghost" asChild>
                                <Link href={history.url()}>
                                    <History className="h-4 w-4 mr-2" />
                                    View All
                                </Link>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {recentResults.length === 0 ? (
                                <p className="text-muted-foreground text-center py-8">
                                    No completed exams yet
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {recentResults.slice(0, 5).map((result) => (
                                        <div
                                            key={result.id}
                                            className="flex items-center justify-between p-3 border rounded-lg"
                                        >
                                            <div>
                                                <p className="font-medium">
                                                    {result.exam_session?.exam?.title}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {result.submitted_at
                                                        ? format(
                                                              new Date(result.submitted_at),
                                                              'MMM d, yyyy',
                                                          )
                                                        : 'In progress'}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p
                                                    className={`text-lg font-bold ${getScoreColor(result.percentage || 0)}`}
                                                >
                                                    {result.percentage?.toFixed(1)}%
                                                </p>
                                                {getScoreBadge(result.percentage || 0)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
