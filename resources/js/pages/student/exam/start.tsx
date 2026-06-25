import { Head, Link, router } from '@inertiajs/react';
import {
    Clock,
    Play,
    AlertTriangle,
    FileText,
    User,
    Target,
    RotateCcw,
} from 'lucide-react';
import { format } from 'date-fns';
import type { PageProps } from '@/types';
import type { ExamAttempt, ExamSession } from '@/types/models';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import PageHeader from '@/components/page-header';
import {
    startAttempt,
    take,
} from '@/actions/App/Http/Controllers/StudentExamController';
import DashboardController from '@/actions/App/Http/Controllers/DashboardController';

interface ExamStartProps extends PageProps {
    session: ExamSession;
    previousAttempts: ExamAttempt[];
    canAttempt: boolean;
}

export default function ExamStart({
    session,
    previousAttempts,
    canAttempt,
}: ExamStartProps) {
    const handleStartExam = () => {
        router.post(startAttempt.url(session.id));
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

    const remainingAttempts = session.max_attempts - previousAttempts.length;

    return (
        <>
            <Head title={`Start Exam: ${session.title}`} />

            <div className="mx-auto max-w-3xl">
                <PageHeader
                    title={session.title}
                    description={
                        session.description || 'Ready to begin your exam'
                    }
                />

                <div className="space-y-6">
                    {/* Exam Info Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Exam Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Target className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm text-muted-foreground">
                                            Subject:
                                        </span>
                                        <span className="font-medium">
                                            {session.exam?.module?.name}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm text-muted-foreground">
                                            Questions:
                                        </span>
                                        <span className="font-medium">
                                            {session.exam?.total_items}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Target className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm text-muted-foreground">
                                            Total Points:
                                        </span>
                                        <span className="font-medium">
                                            {session.exam?.total_points}
                                        </span>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    {session.time_limit_minutes && (
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm text-muted-foreground">
                                                Time Limit:
                                            </span>
                                            <span className="font-medium">
                                                {session.time_limit_minutes}{' '}
                                                minutes
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2">
                                        <RotateCcw className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm text-muted-foreground">
                                            Attempts Remaining:
                                        </span>
                                        <Badge
                                            variant={
                                                remainingAttempts > 0
                                                    ? 'default'
                                                    : 'destructive'
                                            }
                                        >
                                            {remainingAttempts} /{' '}
                                            {session.max_attempts}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm text-muted-foreground">
                                            Instructor:
                                        </span>
                                        <span className="font-medium">
                                            {session.creator?.name}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Exam Settings */}
                            <div className="mt-6 flex flex-wrap gap-2">
                                {session.shuffle_questions && (
                                    <Badge variant="outline">
                                        Questions shuffled
                                    </Badge>
                                )}
                                {session.shuffle_options && (
                                    <Badge variant="outline">
                                        Options shuffled
                                    </Badge>
                                )}
                                {session.show_results_immediately && (
                                    <Badge variant="outline">
                                        Immediate results
                                    </Badge>
                                )}
                                {session.allow_review && (
                                    <Badge variant="outline">
                                        Review allowed
                                    </Badge>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Instructions */}
                    {session.exam?.instructions && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Instructions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="prose prose-sm max-w-none">
                                    {session.exam.instructions}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Previous Attempts */}
                    {previousAttempts.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Your Previous Attempts</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {previousAttempts.map((attempt) => (
                                        <div
                                            key={attempt.id}
                                            className="flex items-center justify-between rounded-lg border p-3"
                                        >
                                            <div>
                                                <p className="font-medium">
                                                    Attempt #
                                                    {attempt.attempt_number}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {attempt.submitted_at
                                                        ? format(
                                                              new Date(
                                                                  attempt.submitted_at,
                                                              ),
                                                              "MMM d, yyyy 'at' h:mm a",
                                                          )
                                                        : 'In progress'}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                {attempt.status ===
                                                'in_progress' ? (
                                                    <Button size="sm" render={<Link href={take.url(attempt.id)} />} nativeButton={false}>
                                                        Continue
                                                    </Button>
                                                ) : (
                                                    <>
                                                        <p
                                                            className={`text-lg font-bold ${getScoreColor(attempt.percentage || 0)}`}
                                                        >
                                                            {attempt.percentage?.toFixed(
                                                                1,
                                                            )}
                                                            %
                                                        </p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {
                                                                attempt.correct_answers
                                                            }{' '}
                                                            /{' '}
                                                            {
                                                                attempt.total_questions
                                                            }{' '}
                                                            correct
                                                        </p>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Warning Alert */}
                    {session.time_limit_minutes && (
                        <Alert>
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>Timed Exam</AlertTitle>
                            <AlertDescription>
                                This exam has a time limit of{' '}
                                {session.time_limit_minutes} minutes. Once you
                                start, the timer will begin counting down. Make
                                sure you have a stable internet connection
                                before starting.
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Start Button */}
                    <Card>
                        <CardContent className="pt-6">
                            {canAttempt ? (
                                <div className="space-y-4 text-center">
                                    <p className="text-muted-foreground">
                                        When you're ready, click the button
                                        below to start your exam.
                                    </p>
                                    <Button size="lg" onClick={handleStartExam}>
                                        <Play className="mr-2 h-5 w-5" />
                                        Start Exam
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-4 text-center">
                                    <Alert variant="destructive">
                                        <AlertTriangle className="h-4 w-4" />
                                        <AlertTitle>
                                            No Attempts Remaining
                                        </AlertTitle>
                                        <AlertDescription>
                                            You have used all{' '}
                                            {session.max_attempts} attempts for
                                            this exam.
                                        </AlertDescription>
                                    </Alert>
                                    <Button variant="outline" render={<Link href={DashboardController.url()} />} nativeButton={false}>
                                        Return to Dashboard
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

ExamStart.layout = { breadcrumbs: [] };
