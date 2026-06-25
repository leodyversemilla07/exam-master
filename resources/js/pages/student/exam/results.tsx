import { Head, Link } from '@inertiajs/react';
import {
    Trophy,
    Clock,
    CheckCircle2,
    XCircle,
    ArrowLeft,
    FileText,
    AlertCircle,
    Sparkles,
} from 'lucide-react';
import { format } from 'date-fns';
import AppLayout from '@/layouts/app-layout';
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
import { cn } from '@/lib/utils';
import DashboardController from '@/actions/App/Http/Controllers/DashboardController';

interface Answer {
    id: number;
    question: string;
    question_type: string;
    options: Array<{ key: string; text: string }> | null;
    student_answer: string | null;
    student_answer_data: Record<string, unknown> | null;
    correct_answer: string | null;
    is_correct: boolean | null;
    points_earned: number;
    max_points: number;
    feedback: string | null;
    explanation: string | null;
}

interface ExamResultsProps extends PageProps {
    attempt: ExamAttempt;
    answers: Answer[];
    showCorrectAnswers: boolean;
    canReview: boolean;
    aiFeedback?: string;
}

export default function ExamResults({
    attempt,
    answers,
    showCorrectAnswers,
    canReview,
    aiFeedback,
}: ExamResultsProps) {
    const percentage = attempt.percentage || 0;
    const isPassed = percentage >= 60;

    const getScoreColor = () => {
        if (percentage >= 80) {
            return 'text-green-600';
        }

        if (percentage >= 60) {
            return 'text-yellow-600';
        }

        return 'text-red-600';
    };

    const getScoreLabel = () => {
        if (percentage >= 90) {
            return {
                label: 'Excellent!',
                color: 'bg-green-100 text-green-800',
            };
        }

        if (percentage >= 80) {
            return {
                label: 'Very Good!',
                color: 'bg-green-100 text-green-800',
            };
        }

        if (percentage >= 70) {
            return { label: 'Good', color: 'bg-blue-100 text-blue-800' };
        }

        if (percentage >= 60) {
            return { label: 'Passed', color: 'bg-yellow-100 text-yellow-800' };
        }

        return { label: 'Needs Improvement', color: 'bg-red-100 text-red-800' };
    };

    const formatDuration = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
            return `${hours}h ${minutes}m ${secs}s`;
        }

        if (minutes > 0) {
            return `${minutes}m ${secs}s`;
        }

        return `${secs}s`;
    };

    const scoreInfo = getScoreLabel();

    return (
        <AppLayout>
            <Head title={`Results: ${attempt.exam_session?.exam?.title}`} />

            <div className="mx-auto max-w-4xl">
                <div className="mb-6">
                    <Button variant="ghost" asChild>
                        <Link href={DashboardController.url()}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Dashboard
                        </Link>
                    </Button>
                </div>

                <PageHeader
                    title="Exam Results"
                    description={attempt.exam_session?.exam?.title || ''}
                />

                <div className="space-y-6">
                    {/* Score Card */}
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex flex-col items-center text-center">
                                <div className="relative">
                                    <div
                                        className={cn(
                                            'flex h-32 w-32 items-center justify-center rounded-full border-8',
                                            isPassed
                                                ? 'border-green-200 bg-green-50'
                                                : 'border-red-200 bg-red-50',
                                        )}
                                    >
                                        <div>
                                            <p
                                                className={cn(
                                                    'text-3xl font-bold',
                                                    getScoreColor(),
                                                )}
                                            >
                                                {percentage.toFixed(1)}%
                                            </p>
                                        </div>
                                    </div>
                                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                                        <Badge className={scoreInfo.color}>
                                            {scoreInfo.label}
                                        </Badge>
                                    </div>
                                </div>

                                <div className="mt-8 grid w-full max-w-md grid-cols-3 gap-8">
                                    <div className="text-center">
                                        <Trophy className="mx-auto mb-2 h-6 w-6 text-muted-foreground" />
                                        <p className="text-2xl font-bold">
                                            {attempt.score?.toFixed(1)}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Points Earned
                                        </p>
                                    </div>
                                    <div className="text-center">
                                        <CheckCircle2 className="mx-auto mb-2 h-6 w-6 text-green-600" />
                                        <p className="text-2xl font-bold">
                                            {attempt.correct_answers}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Correct
                                        </p>
                                    </div>
                                    <div className="text-center">
                                        <Clock className="mx-auto mb-2 h-6 w-6 text-muted-foreground" />
                                        <p className="text-2xl font-bold">
                                            {formatDuration(
                                                attempt.time_spent_seconds,
                                            )}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Time Spent
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* AI Feedback Card */}
                    {aiFeedback && (
                        <Card className="overflow-hidden border-blue-200 bg-blue-50/30">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-blue-800">
                                    <Sparkles className="h-5 w-5 fill-blue-500 text-blue-500" />
                                    AI-Powered Feedback
                                </CardTitle>
                                <CardDescription className="text-blue-700/80">
                                    Generated personalized insights for your
                                    performance
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="prose prose-sm max-w-none leading-relaxed text-blue-900 italic">
                                    &quot;{aiFeedback}&quot;
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Summary Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            Subject
                                        </span>
                                        <span className="font-medium">
                                            {
                                                attempt.exam_session?.exam
                                                    ?.module?.name
                                            }
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            Attempt #
                                        </span>
                                        <span className="font-medium">
                                            {attempt.attempt_number}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            Started
                                        </span>
                                        <span className="font-medium">
                                            {format(
                                                new Date(attempt.started_at),
                                                'MMM d, yyyy h:mm a',
                                            )}
                                        </span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            Submitted
                                        </span>
                                        <span className="font-medium">
                                            {attempt.submitted_at
                                                ? format(
                                                      new Date(
                                                          attempt.submitted_at,
                                                      ),
                                                      'MMM d, yyyy h:mm a',
                                                  )
                                                : '-'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            Total Questions
                                        </span>
                                        <span className="font-medium">
                                            {attempt.total_questions}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            Status
                                        </span>
                                        <Badge
                                            variant={
                                                attempt.status === 'graded'
                                                    ? 'default'
                                                    : 'secondary'
                                            }
                                        >
                                            {attempt.status === 'graded'
                                                ? 'Graded'
                                                : 'Submitted'}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Answers Review */}
                    {canReview && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Question Review</CardTitle>
                                <CardDescription>
                                    {showCorrectAnswers
                                        ? 'Review your answers and see the correct solutions'
                                        : 'Review your submitted answers'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    {answers.map((answer, index) => (
                                        <div
                                            key={answer.id}
                                            className={cn(
                                                'rounded-lg border p-4',
                                                answer.is_correct === true &&
                                                    'border-green-200 bg-green-50/50',
                                                answer.is_correct === false &&
                                                    'border-red-200 bg-red-50/50',
                                                answer.is_correct === null &&
                                                    'border-yellow-200 bg-yellow-50/50',
                                            )}
                                        >
                                            <div className="mb-3 flex items-start justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline">
                                                        Q{index + 1}
                                                    </Badge>
                                                    <Badge variant="secondary">
                                                        {answer.question_type.replace(
                                                            '_',
                                                            ' ',
                                                        )}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {answer.is_correct ===
                                                        true && (
                                                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                                                    )}
                                                    {answer.is_correct ===
                                                        false && (
                                                        <XCircle className="h-5 w-5 text-red-600" />
                                                    )}
                                                    {answer.is_correct ===
                                                        null && (
                                                        <AlertCircle className="h-5 w-5 text-yellow-600" />
                                                    )}
                                                    <span className="font-medium">
                                                        {answer.points_earned} /{' '}
                                                        {answer.max_points} pts
                                                    </span>
                                                </div>
                                            </div>

                                            <p className="mb-3 font-medium">
                                                {answer.question}
                                            </p>

                                            <div className="space-y-2">
                                                <div className="flex items-start gap-2">
                                                    <span className="min-w-25 text-sm text-muted-foreground">
                                                        Your answer:
                                                    </span>
                                                    <span
                                                        className={cn(
                                                            'text-sm',
                                                            answer.is_correct ===
                                                                false &&
                                                                'text-red-600',
                                                        )}
                                                    >
                                                        {answer.student_answer ||
                                                            '(No answer provided)'}
                                                    </span>
                                                </div>

                                                {showCorrectAnswers &&
                                                    answer.correct_answer && (
                                                        <div className="flex items-start gap-2">
                                                            <span className="min-w-25 text-sm text-muted-foreground">
                                                                Correct answer:
                                                            </span>
                                                            <span className="text-sm font-medium text-green-600">
                                                                {
                                                                    answer.correct_answer
                                                                }
                                                            </span>
                                                        </div>
                                                    )}

                                                {answer.feedback && (
                                                    <div className="mt-2 rounded bg-blue-50 p-2 text-sm">
                                                        <span className="font-medium">
                                                            Feedback:{' '}
                                                        </span>
                                                        {answer.feedback}
                                                    </div>
                                                )}

                                                {showCorrectAnswers &&
                                                    answer.explanation && (
                                                        <div className="mt-2 rounded bg-muted p-2 text-sm">
                                                            <span className="font-medium">
                                                                Explanation:{' '}
                                                            </span>
                                                            {answer.explanation}
                                                        </div>
                                                    )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {!canReview && (
                        <Card>
                            <CardContent className="py-12 text-center">
                                <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                                <p className="text-muted-foreground">
                                    Answer review is not available for this
                                    exam.
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
