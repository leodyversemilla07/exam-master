import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { Edit, Trash2, CheckCircle2, XCircle, BarChart3, TrendingUp, AlertTriangle } from 'lucide-react';
import PageHeader from '@/components/page-header';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Performance {
    total_attempts: number;
    correct_answers: number;
    success_rate: number | null;
    suggested_difficulty: string | null;
    current_difficulty: string;
    needs_calibration: boolean;
}

interface Question {
    id: number;
    question: string;
    question_type: string;
    options: Array<{ key: string; text: string }> | null;
    correct_answer: string;
    explanation: string | null;
    cognitive_level: string;
    difficulty: string;
    learning_objective_code: string | null;
    points: number;
    is_approved: boolean;
    is_ai_generated: boolean;
    module?: {
        id: number;
        code: string;
        name: string;
    } | null;
    creator?: {
        name: string;
    } | null;
    tos_generate?: {
        subject: string;
        grade_level: string;
    };
}

interface PageProps {
    question: Question;
    performance: Performance;
}

export default function ExamShow({ question, performance }: PageProps) {
    if (!question) {
        return (
            <AppLayout>
                <Head title="Question Not Found" />
                <div className="p-4 md:p-6">
                    <p>Question not found.</p>
                </div>
            </AppLayout>
        );
    }

    const breadcrumbs = [
        { title: 'Question Bank', href: '/question-bank' },
        { title: 'View Question', href: `/question-bank/${question.id}` },
    ];

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this question?')) {
            router.delete(`/question-bank/${question.id}`);
        }
    };

    const handleApprove = () => {
        router.post(`/question-bank/${question.id}/approve`);
    };

    const handleCalibrate = () => {
        router.post(`/question-bank/${question.id}/calibrate`, {}, {
            onSuccess: () => toast.success('Difficulty calibrated!'),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Question Details" />

            <div className="p-4 md:p-6 space-y-6">
                {/* Header */}
                <PageHeader
                    title="Question Details"
                    description={
                        <div className="flex items-center gap-2">
                            <span>View and manage question</span>
                            <Badge variant="secondary">Draft</Badge>
                            <Badge variant="outline">English</Badge>
                        </div>
                    }
                    actions={
                        <>
                            <Button
                                onClick={() => router.visit(`/question-bank/${question.id}/edit`)}
                            >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </Button>
                            {!question.is_approved && (
                                <Button onClick={handleApprove} variant="outline">
                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                    Approve
                                </Button>
                            )}
                            <Button onClick={handleDelete} variant="destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                            </Button>
                        </>
                    }
                />

                {/* Performance & Calibration */}
                <div className="grid gap-6 md:grid-cols-3">
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <BarChart3 className="h-5 w-5 text-muted-foreground" />
                                    <CardTitle>Student Performance</CardTitle>
                                </div>
                                {performance.needs_calibration && (
                                    <Badge variant="destructive" className="animate-pulse">
                                        <AlertTriangle className="mr-1 h-3 w-3" />
                                        Calibration Suggested
                                    </Badge>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">Total Attempts</p>
                                    <p className="text-2xl font-bold">{performance.total_attempts}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">Success Rate</p>
                                    <p className={cn(
                                        "text-2xl font-bold",
                                        performance.success_rate && performance.success_rate >= 70 ? "text-green-600" :
                                        performance.success_rate && performance.success_rate >= 40 ? "text-yellow-600" : "text-red-600"
                                    )}>
                                        {performance.success_rate ? `${performance.success_rate}%` : 'N/A'}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">Suggested Difficulty</p>
                                    <p className="text-2xl font-bold capitalize">
                                        {performance.suggested_difficulty || 'N/A'}
                                    </p>
                                </div>
                            </div>

                            {performance.needs_calibration && (
                                <div className="mt-6 p-4 border border-blue-200 bg-blue-50 rounded-lg flex items-start gap-3">
                                    <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-blue-900">
                                            Recalibration Recommended
                                        </p>
                                        <p className="text-sm text-blue-800">
                                            Based on student data, this question is currently marked as{' '}
                                            <span className="font-bold uppercase">{performance.current_difficulty}</span>,
                                            but students are performing at a level consistent with{' '}
                                            <span className="font-bold uppercase">{performance.suggested_difficulty}</span> difficulty.
                                        </p>
                                        <Button
                                            size="sm"
                                            className="mt-3 bg-blue-600 hover:bg-blue-700"
                                            onClick={handleCalibrate}
                                        >
                                            Update Difficulty to {performance.suggested_difficulty?.toUpperCase()}
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {performance.total_attempts < 5 && (
                                <p className="mt-4 text-xs text-muted-foreground italic">
                                    * At least 5 student attempts are required for difficulty calibration suggestions.
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Question Info</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-xs font-medium text-muted-foreground uppercase mb-1">Created By</p>
                                <p className="text-sm">{question.creator?.name || 'Unknown'}</p>
                            </div>
                            <div>
                                <p className="text-xs font-medium text-muted-foreground uppercase mb-1">Module</p>
                                <p className="text-sm">{question.module?.name} ({question.module?.code})</p>
                            </div>
                            {question.tos_generate && (
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground uppercase mb-1">Source TOS</p>
                                    <p className="text-sm">{question.tos_generate.subject} - {question.tos_generate.grade_level}</p>
                                </div>
                            )}
                            <div>
                                <p className="text-xs font-medium text-muted-foreground uppercase mb-1">Metadata</p>
                                <div className="flex flex-wrap gap-2">
                                    {question.is_ai_generated && <Badge variant="outline">AI Generated</Badge>}
                                    <Badge variant="outline">{question.learning_objective_code || 'No Objective'}</Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Question Details */}
                <Card>
                    <CardHeader>
                        <div className="flex items-start justify-between">
                            <div className="space-y-2">
                                <CardTitle>Question</CardTitle>
                                <div className="flex items-center gap-2">
                                    {question.cognitive_level && (
                                        <Badge variant="secondary" className="capitalize">
                                            {question.cognitive_level}
                                        </Badge>
                                    )}
                                    {question.difficulty && (
                                        <Badge variant="outline" className="capitalize">
                                            {question.difficulty}
                                        </Badge>
                                    )}
                                    {question.question_type && (
                                        <Badge
                                            variant={
                                                question.question_type === 'multiple_choice'
                                                    ? 'default'
                                                    : 'secondary'
                                            }
                                            className="capitalize"
                                        >
                                            {question.question_type.replace(/_/g, ' ')}
                                        </Badge>
                                    )}
                                    {question.is_approved ? (
                                        <Badge variant="default">
                                            <CheckCircle2 className="mr-1 size-3" />
                                            Approved
                                        </Badge>
                                    ) : (
                                        <Badge variant="secondary">
                                            <XCircle className="mr-1 size-3" />
                                            Pending
                                        </Badge>
                                    )}
                                    {question.is_ai_generated && (
                                        <Badge variant="outline">AI Generated</Badge>
                                    )}
                                </div>
                            </div>
                            <div className="text-right text-sm text-muted-foreground">
                                <p>Points: {question.points}</p>
                                {question.learning_objective_code && (
                                    <p>LO: {question.learning_objective_code}</p>
                                )}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <h3 className="mb-2 font-semibold">Question Text</h3>
                            <p className="text-lg">{question.question}</p>
                        </div>

                        {question.options && question.options.length > 0 && (
                            <div>
                                <h3 className="mb-2 font-semibold">Options</h3>
                                <div className="space-y-2">
                                    {question.options.map((option) => (
                                        <div
                                            key={option.key}
                                            className={`rounded-lg border p-3 ${
                                                option.key === question.correct_answer
                                                    ? 'border-success bg-success/10'
                                                    : ''
                                            }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <span className="font-semibold">{option.key}.</span>
                                                <span>{option.text}</span>
                                                {option.key === question.correct_answer && (
                                                    <CheckCircle2 className="ml-auto size-5 text-success" />
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {!question.options && (
                            <div>
                                <h3 className="mb-2 font-semibold">Correct Answer</h3>
                                <p className="rounded-lg border border-success bg-success/10 p-3">
                                    {question.correct_answer}
                                </p>
                            </div>
                        )}

                        {question.explanation && (
                            <div>
                                <h3 className="mb-2 font-semibold">Explanation</h3>
                                <p className="text-muted-foreground">{question.explanation}</p>
                            </div>
                        )}

                        {/* Metadata */}
                        <div className="border-t pt-4">
                            <h3 className="mb-3 font-semibold">Additional Information</h3>
                            <div className="grid gap-3 sm:grid-cols-2">
                                {question.module && (
                                    <div>
                                        <p className="text-sm text-muted-foreground">Module</p>
                                        <p className="font-medium">
                                            {question.module.code} - {question.module.name}
                                        </p>
                                    </div>
                                )}
                                {question.tos_generate && (
                                    <div>
                                        <p className="text-sm text-muted-foreground">TOS</p>
                                        <p className="font-medium">
                                            {question.tos_generate.subject} -{' '}
                                            {question.tos_generate.grade_level}
                                        </p>
                                    </div>
                                )}
                                {question.creator && (
                                    <div>
                                        <p className="text-sm text-muted-foreground">Created By</p>
                                        <p className="font-medium">{question.creator.name}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
