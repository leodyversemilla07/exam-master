import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { Edit, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import PageHeader from '@/components/page-header';

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
}

export default function ExamShow({ question }: PageProps) {
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
