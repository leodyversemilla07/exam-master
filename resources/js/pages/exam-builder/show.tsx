import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Head, router, Link } from '@inertiajs/react';
import { Exam, ExamQuestion } from '@/types/models';
import { Edit, Plus, Trash2, GripVertical, Clock, FileText, Users, Settings, Eye, Download, Shield } from 'lucide-react';
import { useState } from 'react';
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
} from '@/components/ui/alert-dialog';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Exam Builder', href: '/exam-builder' },
    { title: 'Exam Details', href: '' },
];

interface PageProps {
    exam: Exam & {
        module: {
            code: string;
            name: string;
        };
        creator: {
            name: string;
        };
        tos_generate?: {
            title: string;
        };
        questions: (ExamQuestion & {
            module: {
                code: string;
                name: string;
            };
        })[];
    };
    availableQuestions: (ExamQuestion & {
        module: {
            code: string;
            name: string;
        };
    })[];
}

export default function ShowExam({ exam, availableQuestions }: PageProps) {
    const [showAddQuestions, setShowAddQuestions] = useState(false);
    const [selectedQuestions, setSelectedQuestions] = useState<number[]>([]);
    const [removingQuestion, setRemovingQuestion] = useState<ExamQuestion | null>(null);

    const getStatusBadge = (status: string) => {
        const variants = {
            draft: 'secondary',
            published: 'default',
            archived: 'outline',
        } as const;

        return (
            <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
        );
    };

    const getTypeBadge = (type: string) => {
        const colors = {
            formative: 'bg-info/10 text-info border-info/20',
            summative: 'bg-success/10 text-success border-success/20',
            diagnostic: 'bg-secondary/10 text-secondary border-secondary/20',
        } as const;

        return (
            <Badge className={colors[type as keyof typeof colors] || 'bg-muted text-muted-foreground'}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
            </Badge>
        );
    };

    const handleAddQuestions = () => {
        if (selectedQuestions.length > 0) {
            router.post(`/exam-builder/${exam.id}/add-questions`, {
                question_ids: selectedQuestions,
            }, {
                onSuccess: () => {
                    setShowAddQuestions(false);
                    setSelectedQuestions([]);
                },
            });
        }
    };

    const handleRemoveQuestion = (question: ExamQuestion) => {
        setRemovingQuestion(question);
    };

    const confirmRemoveQuestion = () => {
        if (removingQuestion) {
            router.delete(`/exam-builder/${exam.id}/questions/${removingQuestion.id}`, {
                onSuccess: () => setRemovingQuestion(null),
            });
        }
    };

    const handlePublish = () => {
        if (confirm('Are you sure you want to publish this exam? Once published, it cannot be unpublished.')) {
            router.post(`/exam-builder/${exam.id}/publish`);
        }
    };

    const totalPoints = exam.questions.reduce((sum, q) => sum + (q.points || 0), 0);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={exam.title} />

            <div className="p-4 md:p-6">
                <div className="mx-auto max-w-7xl">
                    {/* Header */}
                    <div className="mb-6">
                        <PageHeader
                            title={
                                <div className="flex items-center gap-3 flex-wrap">
                                    <span>{exam.title}</span>
                                    {getStatusBadge(exam.status)}
                                    {getTypeBadge(exam.exam_type)}
                                </div>
                            }
                            description={exam.description || undefined}
                            actions={
                                <>
                                    <Button asChild variant="outline">
                                        <Link href={`/exam-builder/${exam.id}/edit`}>
                                            <Edit className="mr-2 h-4 w-4" />
                                            Edit Exam
                                        </Link>
                                    </Button>
                            {exam.status === 'draft' && (
                                        <>
                                            <Button asChild variant="outline" onClick={() => setShowAddQuestions(true)}>
                                                <Plus className="mr-2 h-4 w-4" />
                                                Add Questions
                                            </Button>
                                            <Button onClick={handlePublish}>
                                                Publish Exam
                                            </Button>
                                            <Button asChild variant="outline">
                                                <Link href={`/exam-builder/${exam.id}/collaborators`}>
                                                    <Shield className="mr-2 h-4 w-4" />
                                                    Collaborators
                                                </Link>
                                            </Button>
                                            <Button asChild variant="outline">
                                                <Link href={`/exam-builder/${exam.id}/edit`}>
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Edit Exam
                                                </Link>
                                            </Button>
                                            <Button asChild variant="outline">
                                                <Link href={`/exam-builder/${exam.id}/preview`}>
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    Preview
                                                </Link>
                                            </Button>
                                        </>
                                    )}
                                    {exam.status === 'published' && (
                                        <>
                                            <Button asChild variant="outline">
                                                <Link href={`/exam-builder/${exam.id}/collaborators`}>
                                                    <Shield className="mr-2 h-4 w-4" />
                                                    Collaborators
                                                </Link>
                                            </Button>
                                            <Button asChild variant="outline">
                                                <Link href={`/exam-builder/${exam.id}/edit`}>
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Edit Exam
                                                </Link>
                                            </Button>
                                            <Button asChild variant="outline">
                                                <Link href={`/exam-builder/${exam.id}/preview`}>
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    Preview
                                                </Link>
                                            </Button>
                                        </>
                                    )}
                                    {exam.status === 'published' && (
                                        <Button asChild>
                                            <Link href={`/exam-builder/${exam.id}/preview`}>
                                                <Eye className="mr-2 h-4 w-4" />
                                                Preview
                                            </Link>
                                        </Button>
                                    )}
                                </>
                            }
                        />
                    </div>

                    {/* Exam Info */}
                    <Card className="mb-6">
                        <CardContent className="pt-6">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                    <span>{exam.module.code} - {exam.module.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                    <span>{exam.questions.length} questions</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Settings className="h-4 w-4 text-muted-foreground" />
                                    <span>{totalPoints} points</span>
                                </div>
                                {exam.time_limit && (
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                        <span>{exam.time_limit} minutes</span>
                                    </div>
                                )}
                            </div>

                            <div className="mt-4 text-sm text-muted-foreground">
                                Created by {exam.creator.name}
                                {exam.tos_generate && (
                                    <span> • Based on {exam.tos_generate.title}</span>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Export and Actions moved to header */}
                    {exam.questions.length > 0 && (
                        <Card className="mb-6">
                            <CardContent className="p-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Export exam as PDF</span>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" size="sm">
                                                <Download className="mr-2 h-4 w-4" />
                                                Export PDF
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem asChild>
                                                <a href={`/exam-builder/${exam.id}/export-pdf`} download>
                                                    <FileText className="mr-2 h-4 w-4" />
                                                    Exam Only
                                                </a>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild>
                                                <a href={`/exam-builder/${exam.id}/export-pdf-answers`} download>
                                                    <FileText className="mr-2 h-4 w-4" />
                                                    With Answer Key
                                                </a>
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Exam Details */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Settings</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <Label className="text-sm font-medium">Passing Score</Label>
                                    <p className="text-2xl font-bold text-success">{exam.passing_score}%</p>
                                </div>
                                {exam.time_limit && (
                                    <div>
                                        <Label className="text-sm font-medium">Time Limit</Label>
                                        <p>{exam.time_limit} minutes</p>
                                    </div>
                                )}
                                <div>
                                    <Label className="text-sm font-medium">Shuffle Questions</Label>
                                    <p>{exam.shuffle_questions ? 'Yes' : 'No'}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium">Show Answers</Label>
                                    <p>{exam.show_answers ? 'Yes' : 'No'}</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="lg:col-span-2">
                            <CardHeader>
                                <CardTitle className="text-lg">Instructions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {exam.instructions ? (
                                    <p className="whitespace-pre-wrap">{exam.instructions}</p>
                                ) : (
                                    <p className="text-muted-foreground italic">No instructions provided</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Questions Section */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Questions ({exam.questions.length})</CardTitle>
                                    <CardDescription>
                                        Total points: {totalPoints}
                                    </CardDescription>
                                </div>
                                <Button onClick={() => setShowAddQuestions(true)}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Questions
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {exam.questions.length === 0 ? (
                                <div className="text-center py-8">
                                    <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                                    <h3 className="mt-2 text-sm font-semibold text-foreground">No questions added</h3>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Add questions to build your exam.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {exam.questions.map((question, index) => (
                                        <div key={question.id} className="flex items-start gap-4 p-4 border rounded-lg">
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <GripVertical className="h-4 w-4" />
                                                <span className="text-sm font-medium">{index + 1}.</span>
                                            </div>

                                            <div className="flex-1">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium mb-1">
                                                            {question.question}
                                                        </p>
                                                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                            <span>{question.module?.code}</span>
                                                            <span>{question.points || 0} points</span>
                                                            <Badge variant="outline" className="text-xs">
                                                                {question.question_type}
                                                            </Badge>
                                                        </div>
                                                    </div>

                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleRemoveQuestion(question)}
                                                        className="text-destructive hover:text-destructive/80"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Add Questions Dialog */}
            <Dialog open={showAddQuestions} onOpenChange={setShowAddQuestions}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Add Questions</DialogTitle>
                        <DialogDescription>
                            Select questions to add to this exam. Only approved questions from the same module are shown.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="max-h-96 overflow-y-auto">
                        {availableQuestions.length === 0 ? (
                            <p className="text-center py-8 text-muted-foreground">
                                No available questions found for this module.
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {availableQuestions.map((question) => (
                                    <div key={question.id} className="flex items-start gap-3 p-3 border rounded">
                                        <input
                                            type="checkbox"
                                            checked={selectedQuestions.includes(question.id)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedQuestions([...selectedQuestions, question.id]);
                                                } else {
                                                    setSelectedQuestions(selectedQuestions.filter(id => id !== question.id));
                                                }
                                            }}
                                            className="mt-1"
                                        />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">{question.question}</p>
                                            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                                <span>{question.module?.code}</span>
                                                <span>{question.points || 0} points</span>
                                                <Badge variant="outline" className="text-xs">
                                                    {question.question_type}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAddQuestions(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleAddQuestions}
                            disabled={selectedQuestions.length === 0}
                        >
                            Add {selectedQuestions.length} Question{selectedQuestions.length !== 1 ? 's' : ''}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Remove Question Confirmation */}
            <AlertDialog open={!!removingQuestion} onOpenChange={() => setRemovingQuestion(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remove Question</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to remove this question from the exam?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmRemoveQuestion} className="bg-destructive hover:bg-destructive/90">
                            Remove
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
