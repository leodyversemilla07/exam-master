import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { TosGenerate, Module, ExamQuestion } from '@/types/models';
import { User } from '@/types/index';
import { useEffect, useRef } from 'react';
import {
    Clock,
    Loader2,
    CheckCircle2,
    AlertCircle,
    FileText,
    Sparkles,
    Edit,
    Trash2,
    Download,
} from 'lucide-react';

interface PageProps {
    tosGenerate: TosGenerate & {
        module?: Module;
        creator?: User;
        questions?: ExamQuestion[];
    };
}

const statusConfig = {
    draft: {
        icon: Clock,
        color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
        label: 'Draft',
        animate: false,
    },
    generating: {
        icon: Loader2,
        color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
        label: 'Generating',
        animate: true,
    },
    completed: {
        icon: CheckCircle2,
        color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        label: 'Completed',
        animate: false,
    },
    failed: {
        icon: AlertCircle,
        color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
        label: 'Failed',
        animate: false,
    },
};

export default function TosGenerateShow({ tosGenerate }: PageProps) {
    const status = statusConfig[tosGenerate.status];
    const StatusIcon = status.icon;
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Auto-refresh when status is "generating"
    useEffect(() => {
        if (tosGenerate.status === 'generating') {
            // Refresh every 5 seconds while generating
            intervalRef.current = setInterval(() => {
                router.reload({ only: ['tosGenerate'] });
            }, 5000);
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [tosGenerate.status]);

    const handleGenerateQuestions = () => {
        if (confirm('Start generating questions based on this TOS? This may take a few minutes.')) {
            router.post(`/tos-generates/${tosGenerate.id}/generate`, {}, {
                preserveScroll: true,
                onSuccess: () => {
                    // Refresh will start automatically due to status change
                },
            });
        }
    };

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this TOS?')) {
            router.delete(`/tos-generates/${tosGenerate.id}`);
        }
    };

    return (
        <AppLayout>
            <Head title={`TOS: ${tosGenerate.subject} - ${tosGenerate.grade_level}`} />

            <div className="p-4 md:p-6 space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold tracking-tight">
                                {tosGenerate.subject} - {tosGenerate.grade_level}
                            </h1>
                            <Badge className={status.color}>
                                <StatusIcon
                                    className={`mr-1 size-3 ${status.animate ? 'animate-spin' : ''}`}
                                />
                                {status.label}
                            </Badge>
                        </div>
                        <p className="mt-2 text-muted-foreground">
                            {tosGenerate.module?.code} - {tosGenerate.module?.name}
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        {tosGenerate.status === 'draft' && (
                            <>
                                <Link href={`/tos-generates/${tosGenerate.id}/edit`}>
                                    <Button variant="outline">
                                        <Edit className="mr-2 size-4" />
                                        Edit
                                    </Button>
                                </Link>
                                <Button onClick={handleGenerateQuestions}>
                                    <Sparkles className="mr-2 size-4" />
                                    Generate Questions
                                </Button>
                            </>
                        )}
                        {tosGenerate.status === 'completed' && tosGenerate.questions && tosGenerate.questions.length > 0 && (
                            <Button variant="outline">
                                <Download className="mr-2 size-4" />
                                Export
                            </Button>
                        )}
                        <Button variant="ghost" size="icon" onClick={handleDelete}>
                            <Trash2 className="size-4 text-destructive" />
                        </Button>
                    </div>
                </div>

                {/* Generating Status Alert */}
                {tosGenerate.status === 'generating' && (
                    <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <Loader2 className="size-5 animate-spin text-blue-600 dark:text-blue-400" />
                                <div>
                                    <p className="font-medium text-blue-900 dark:text-blue-100">
                                        Questions are being generated...
                                    </p>
                                    <p className="text-sm text-blue-700 dark:text-blue-300">
                                        This may take 2-5 minutes depending on the number of questions.
                                        This page will refresh automatically when complete.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Failed Status Alert */}
                {tosGenerate.status === 'failed' && (
                    <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <AlertCircle className="size-5 text-red-600 dark:text-red-400" />
                                <div className="flex-1">
                                    <p className="font-medium text-red-900 dark:text-red-100">
                                        Generation failed
                                    </p>
                                    <p className="text-sm text-red-700 dark:text-red-300">
                                        {tosGenerate.error_message || 'An error occurred during generation.'}
                                    </p>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleGenerateQuestions}
                                    className="border-red-300 text-red-700 hover:bg-red-100 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-900"
                                >
                                    <Sparkles className="mr-2 size-4" />
                                    Retry
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Left Column - Details */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* Basic Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Basic Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Subject</p>
                                        <p className="font-medium">{tosGenerate.subject}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Grade Level</p>
                                        <p className="font-medium">{tosGenerate.grade_level}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Quarter</p>
                                        <p className="font-medium">{tosGenerate.quarter || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Total Items</p>
                                        <p className="font-medium">{tosGenerate.total_items}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Question Type</p>
                                        <p className="font-medium capitalize">
                                            {tosGenerate.question_type.replace('_', ' ')}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Difficulty</p>
                                        <p className="font-medium capitalize">
                                            {tosGenerate.difficulty_level}
                                        </p>
                                    </div>
                                </div>
                                {tosGenerate.created_by && (
                                    <div>
                                        <p className="text-sm text-muted-foreground">Created By</p>
                                        <p className="font-medium">{tosGenerate.creator?.name}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Learning Objectives */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Learning Objectives</CardTitle>
                                <CardDescription>
                                    Objectives covered in this specification
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {tosGenerate.learning_objectives.map((objective: any, index: number) => (
                                        <div
                                            key={index}
                                            className="flex gap-3 rounded-lg border p-3"
                                        >
                                            <Badge variant="outline" className="font-mono">
                                                {objective.code}
                                            </Badge>
                                            <p className="flex-1 text-sm">{objective.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Additional Instructions */}
                        {tosGenerate.additional_instructions && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Additional Instructions</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm leading-relaxed">
                                        {tosGenerate.additional_instructions}
                                    </p>
                                </CardContent>
                            </Card>
                        )}

                        {/* Generated Questions */}
                        {tosGenerate.questions && tosGenerate.questions.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle>Generated Questions</CardTitle>
                                            <CardDescription>
                                                {tosGenerate.questions.length} questions generated
                                            </CardDescription>
                                        </div>
                                        <Link href={`/exams?tos_id=${tosGenerate.id}`}>
                                            <Button variant="outline" size="sm">
                                                View All
                                            </Button>
                                        </Link>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {tosGenerate.questions.slice(0, 5).map((question: any) => (
                                            <div
                                                key={question.id}
                                                className="rounded-lg border p-3"
                                            >
                                                <div className="mb-2 flex items-center gap-2">
                                                    <Badge variant="secondary" className="text-xs">
                                                        {question.cognitive_level}
                                                    </Badge>
                                                    <Badge variant="outline" className="text-xs">
                                                        {question.difficulty}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm">
                                                    {question.question_text.substring(0, 150)}
                                                    {question.question_text.length > 150 && '...'}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Right Column - Stats */}
                    <div className="space-y-6">
                        {/* Cognitive Levels Distribution */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Cognitive Levels</CardTitle>
                                <CardDescription>Bloom's Taxonomy distribution</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {Object.entries(tosGenerate.cognitive_levels).map(([level, count]) => (
                                        <div key={level} className="space-y-1">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="capitalize">{level}</span>
                                                <span className="font-medium">
                                                    {count} ({Math.round((count / tosGenerate.total_items) * 100)}%)
                                                </span>
                                            </div>
                                            <div className="h-2 rounded-full bg-muted">
                                                <div
                                                    className="h-2 rounded-full bg-primary"
                                                    style={{
                                                        width: `${(count / tosGenerate.total_items) * 100}%`,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Statistics */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Statistics</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <FileText className="size-4 text-muted-foreground" />
                                        <span className="text-sm">Questions Generated</span>
                                    </div>
                                    <span className="font-medium">
                                        {tosGenerate.questions?.length || 0}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <FileText className="size-4 text-muted-foreground" />
                                        <span className="text-sm">Learning Objectives</span>
                                    </div>
                                    <span className="font-medium">
                                        {tosGenerate.learning_objectives.length}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="size-4 text-muted-foreground" />
                                        <span className="text-sm">Completion</span>
                                    </div>
                                    <span className="font-medium">
                                        {tosGenerate.status === 'completed' ? '100%' : '0%'}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
