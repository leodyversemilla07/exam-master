import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/page-header';
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
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { TosGenerate, Module, ExamQuestion } from '@/types/models';
import { User } from '@/types/index';
import { useEffect, useRef, useState } from 'react';
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

export default function TosGenerateShow({ tosGenerate }: PageProps) {
    const breadcrumbs = [
        { title: 'Table of Specifications', href: '/tos-generates' },
        { title: tosGenerate.subject || 'View TOS', href: `/tos-generates/${tosGenerate.id}` },
    ];

    const statusConfig = {
        draft: {
            icon: Clock,
            color: 'bg-muted text-muted-foreground',
            label: 'Draft',
            animate: false,
        },
        generating: {
            icon: Loader2,
            color: 'bg-info/10 text-info border border-info/20',
            label: 'Generating',
            animate: true,
        },
        completed: {
            icon: CheckCircle2,
            color: 'bg-success/10 text-success border border-success/20',
            label: 'Completed',
            animate: false,
        },
        failed: {
            icon: AlertCircle,
            color: 'bg-destructive/10 text-destructive border border-destructive/20',
            label: 'Failed',
            animate: false,
        },
    };

    const status = statusConfig[tosGenerate.status];
    const StatusIcon = status.icon;
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

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
        setIsGenerateDialogOpen(false);
        router.post(
            `/tos-generates/${tosGenerate.id}/generate`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    // Refresh will start automatically due to status change
                },
            },
        );
    };

    const handleDelete = () => {
        setIsDeleteDialogOpen(false);
        router.delete(`/tos-generates/${tosGenerate.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`TOS: ${tosGenerate.subject} - ${tosGenerate.grade_level}`} />

            <div className="p-4 md:p-6 space-y-6">
                {/* Header */}
                <PageHeader
                    title={
                        <div className="flex items-center gap-3 flex-wrap">
                            <span>
                                {tosGenerate.subject} - {tosGenerate.grade_level}
                            </span>
                            <Badge className={status.color}>
                                <StatusIcon
                                    className={`mr-1 size-3 ${status.animate ? 'animate-spin' : ''}`}
                                />
                                {status.label}
                            </Badge>
                            <Badge variant="outline">
                                {tosGenerate.language === 'filipino' ? 'Filipino' : 'English'}
                            </Badge>
                        </div>
                    }
                    description={`${tosGenerate.module?.code} - ${tosGenerate.module?.name}`}
                    actions={
                        <>
                            {tosGenerate.status === 'draft' && (
                                <>
                                    <Button asChild variant="outline">
                                        <Link href={`/tos-generates/${tosGenerate.id}/edit`}>
                                            <Edit className="mr-2 size-4" />
                                            Edit
                                        </Link>
                                    </Button>
                                    <AlertDialog
                                        open={isGenerateDialogOpen}
                                        onOpenChange={setIsGenerateDialogOpen}
                                    >
                                        <AlertDialogTrigger asChild>
                                            <Button>
                                                <Sparkles className="mr-2 size-4" />
                                                Generate Questions
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>
                                                    Generate Questions?
                                                </AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This will start generating{' '}
                                                    {tosGenerate.total_items} questions based on
                                                    this Table of Specifications. The process may
                                                    take 2-5 minutes depending on the number of
                                                    questions. You can navigate away from this page
                                                    while generation is in progress.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={handleGenerateQuestions}
                                                >
                                                    Continue
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </>
                            )}
                            {tosGenerate.status === 'completed' &&
                                tosGenerate.questions &&
                                tosGenerate.questions.length > 0 && (
                                    <Button variant="outline">
                                        <Download className="mr-2 size-4" />
                                        Export
                                    </Button>
                                )}
                            <AlertDialog
                                open={isDeleteDialogOpen}
                                onOpenChange={setIsDeleteDialogOpen}
                            >
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <Trash2 className="size-4 text-destructive" />
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Delete TOS?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Are you sure you want to delete this Table of
                                            Specifications? This action cannot be undone and will
                                            permanently remove all associated data.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={handleDelete}
                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                        >
                                            Delete
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </>
                    }
                />

                {/* Generating Status Alert */}
                {tosGenerate.status === 'generating' && (
                    <Card className="border-info/20 bg-info/10">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <Loader2 className="size-5 animate-spin text-info" />
                                <div>
                                    <p className="font-medium text-foreground">
                                        Questions are being generated...
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        This may take 2-5 minutes depending on the number of
                                        questions. This page will refresh automatically when
                                        complete.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Failed Status Alert */}
                {tosGenerate.status === 'failed' && (
                    <Card className="border-destructive/20 bg-destructive/10">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <AlertCircle className="size-5 text-destructive" />
                                <div className="flex-1">
                                    <p className="font-medium text-foreground">Generation failed</p>
                                    <p className="text-sm text-muted-foreground">
                                        {tosGenerate.error_message ||
                                            'An error occurred during generation.'}
                                    </p>
                                    {tosGenerate.questions && tosGenerate.questions.length > 0 && (
                                        <p className="mt-2 text-sm text-muted-foreground">
                                            Note: Questions shown below are from a previous
                                            successful generation.
                                        </p>
                                    )}
                                </div>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="border-destructive/30 text-destructive hover:bg-destructive/10"
                                        >
                                            <Sparkles className="mr-2 size-4" />
                                            Retry
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>
                                                Retry Question Generation?
                                            </AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This will attempt to generate{' '}
                                                {tosGenerate.total_items} questions again based on
                                                this Table of Specifications. The process may take
                                                2-5 minutes.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={handleGenerateQuestions}>
                                                Retry
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
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
                                        <p className="font-medium">
                                            {tosGenerate.quarter || 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Total Items</p>
                                        <p className="font-medium">{tosGenerate.total_items}</p>
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
                                    {tosGenerate.learning_objectives.map(
                                        (objective: any, index: number) => (
                                            <div
                                                key={index}
                                                className="flex gap-3 rounded-lg border p-3"
                                            >
                                                <Badge variant="outline" className="font-mono">
                                                    {objective.code}
                                                </Badge>
                                                <p className="flex-1 text-sm">
                                                    {objective.description}
                                                </p>
                                            </div>
                                        ),
                                    )}
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
                                        <Link
                                            href={`/question-bank?tos_generate_id=${tosGenerate.id}`}
                                        >
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
                                                    {question.question ? (
                                                        <>
                                                            {question.question.substring(0, 150)}
                                                            {question.question.length > 150 &&
                                                                '...'}
                                                        </>
                                                    ) : (
                                                        <span className="text-muted-foreground italic">
                                                            No question text
                                                        </span>
                                                    )}
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
                        {/* Question Types Distribution */}
                        {tosGenerate.question_types && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Question Types</CardTitle>
                                    <CardDescription>Distribution by question type</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {Object.entries(tosGenerate.question_types)
                                            .filter(([_, count]) => count > 0)
                                            .map(([type, count]) => (
                                                <div key={type} className="space-y-1">
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="capitalize">
                                                            {type.replace('_', ' ')}
                                                        </span>
                                                        <span className="font-medium">
                                                            {count} (
                                                            {Math.round(
                                                                (count / tosGenerate.total_items) *
                                                                    100,
                                                            )}
                                                            %)
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
                        )}

                        {/* Cognitive Levels Distribution */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Cognitive Levels</CardTitle>
                                <CardDescription>Bloom's Taxonomy distribution</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {Object.entries(tosGenerate.cognitive_levels).map(
                                        ([level, count]) => (
                                            <div key={level} className="space-y-1">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="capitalize">{level}</span>
                                                    <span className="font-medium">
                                                        {count} (
                                                        {Math.round(
                                                            (count / tosGenerate.total_items) * 100,
                                                        )}
                                                        %)
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
                                        ),
                                    )}
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
