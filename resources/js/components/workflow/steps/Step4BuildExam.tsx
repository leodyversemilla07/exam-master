import { useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import { Plus, Trash2, Save, Send, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { Exam, ExamQuestion, Module, TosGenerate } from '@/types/models';
import {
    store,
    addQuestions,
    removeQuestion,
    publish,
} from '@/actions/App/Http/Controllers/ExamBuilderController';

interface Props {
    module: Module;
    tos: TosGenerate;
    exam: (Exam & { questions: ExamQuestion[] }) | null;
    availableQuestions: ExamQuestion[];
    onAdvance: () => void;
}

export default function Step4BuildExam({
    module,
    tos,
    exam,
    availableQuestions,
    onAdvance,
}: Props) {
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [selectedQuestionIds, setSelectedQuestionIds] = useState<number[]>(
        [],
    );
    const [isAdding, setIsAdding] = useState(false);
    const [isRemoving, setIsRemoving] = useState<number | null>(null);
    const [isPublishing, setIsPublishing] = useState(false);

    const createForm = useForm<{
        module_id: string;
        tos_generate_id: string;
        title: string;
        description: string;
        exam_type: 'formative' | 'summative' | 'diagnostic';
        time_limit: string;
        passing_score: string;
        instructions: string;
        shuffle_questions: boolean;
        show_answers: boolean;
    }>({
        module_id: module.id.toString(),
        tos_generate_id: tos.id.toString(),
        title: `${tos.subject} — ${tos.quarter ?? 'Exam'}`,
        description: '',
        exam_type: 'summative',
        time_limit: '',
        passing_score: '75',
        instructions: '',
        shuffle_questions: false,
        show_answers: false,
    });

    const handleCreateExam = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post(store.url(), {
            onSuccess: () => {
                router.reload({ only: ['latestExam', 'availableQuestions'] });
            },
        });
    };

    const handleAddQuestions = () => {
        if (selectedQuestionIds.length === 0 || !exam) {
            return;
        }

        setIsAdding(true);
        router.post(
            addQuestions.url(exam.id),
            { question_ids: selectedQuestionIds },
            {
                preserveScroll: true,
                only: ['latestExam', 'availableQuestions'],
                onSuccess: () => {
                    setSelectedQuestionIds([]);
                    setShowAddDialog(false);
                },
                onFinish: () => setIsAdding(false),
            },
        );
    };

    const handleRemoveQuestion = (questionId: number) => {
        if (!exam) {
            return;
        }

        setIsRemoving(questionId);
        router.delete(
            removeQuestion.url({ exam: exam.id, question: questionId }),
            {
                preserveScroll: true,
                only: ['latestExam', 'availableQuestions'],
                onFinish: () => setIsRemoving(null),
            },
        );
    };

    const handlePublish = () => {
        if (!exam) {
            return;
        }

        setIsPublishing(true);
        router.post(
            publish.url(exam.id),
            {},
            {
                preserveScroll: true,
                only: ['latestExam'],
                onSuccess: () => onAdvance(),
                onFinish: () => setIsPublishing(false),
            },
        );
    };

    // Already has a draft exam — show assembly view
    if (exam) {
        const alreadyAddedIds = new Set(exam.questions.map((q) => q.id));
        const notYetAdded = availableQuestions.filter(
            (q) => !alreadyAddedIds.has(q.id),
        );
        const totalPoints = exam.questions.reduce(
            (sum, q) => sum + (q.points ?? 0),
            0,
        );

        return (
            <div className="space-y-5">
                {/* Exam summary header */}
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h3 className="font-semibold">{exam.title}</h3>
                        <div className="mt-1 flex items-center gap-2">
                            <Badge
                                variant="outline"
                                className="text-xs capitalize"
                            >
                                {exam.exam_type}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                                {exam.questions.length} questions ·{' '}
                                {totalPoints} pts · passing {exam.passing_score}
                                %
                            </span>
                        </div>
                    </div>
                    <div className="flex shrink-0 gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowAddDialog(true)}
                            disabled={notYetAdded.length === 0}
                        >
                            <Plus className="mr-1.5 size-4" />
                            Add Questions
                        </Button>
                        <Button
                            size="sm"
                            onClick={handlePublish}
                            disabled={
                                isPublishing || exam.questions.length === 0
                            }
                        >
                            <Send className="mr-1.5 size-4" />
                            {isPublishing ? 'Publishing…' : 'Publish Exam'}
                        </Button>
                    </div>
                </div>

                {/* Questions in exam */}
                {exam.questions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
                        <FileText className="mb-3 size-10 text-muted-foreground" />
                        <p className="text-sm font-medium">
                            No questions added yet
                        </p>
                        <p className="mt-1 mb-3 text-xs text-muted-foreground">
                            Add approved questions from the bank below.
                        </p>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowAddDialog(true)}
                            disabled={notYetAdded.length === 0}
                        >
                            <Plus className="mr-1.5 size-4" />
                            Add Questions
                        </Button>
                    </div>
                ) : (
                    <div className="divide-y rounded-lg border">
                        {exam.questions.map((q, idx) => (
                            <div
                                key={q.id}
                                className="flex items-start gap-3 px-4 py-3"
                            >
                                <span className="w-5 shrink-0 pt-0.5 font-mono text-xs text-muted-foreground">
                                    {idx + 1}.
                                </span>
                                <div className="min-w-0 flex-1">
                                    <p className="line-clamp-2 text-sm">
                                        {q.question}
                                    </p>
                                    <div className="mt-1 flex items-center gap-2">
                                        <Badge
                                            variant="outline"
                                            className="text-xs capitalize"
                                        >
                                            {q.question_type.replace(/_/g, ' ')}
                                        </Badge>
                                        <span className="text-xs text-muted-foreground">
                                            {q.points ?? 0} pts
                                        </span>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-7 shrink-0 text-destructive hover:text-destructive/80"
                                    onClick={() => handleRemoveQuestion(q.id)}
                                    disabled={isRemoving === q.id}
                                >
                                    <Trash2 className="size-3.5" />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Add questions inline panel */}
                {showAddDialog && (
                    <div className="space-y-3 rounded-lg border bg-muted/20 p-4">
                        <div className="flex items-center justify-between">
                            <h4 className="text-sm font-semibold">
                                Available Questions ({notYetAdded.length})
                            </h4>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setShowAddDialog(false);
                                    setSelectedQuestionIds([]);
                                }}
                            >
                                Cancel
                            </Button>
                        </div>

                        {notYetAdded.length === 0 ? (
                            <p className="py-4 text-center text-sm text-muted-foreground">
                                All available questions have been added.
                            </p>
                        ) : (
                            <>
                                <div className="max-h-64 space-y-2 overflow-y-auto">
                                    {notYetAdded.map((q) => (
                                        <label
                                            key={q.id}
                                            className="flex cursor-pointer items-start gap-3 rounded-md border bg-card p-3 transition-colors hover:bg-accent/50"
                                        >
                                            <Checkbox
                                                checked={selectedQuestionIds.includes(
                                                    q.id,
                                                )}
                                                onCheckedChange={(checked) => {
                                                    setSelectedQuestionIds(
                                                        (prev) =>
                                                            checked
                                                                ? [
                                                                      ...prev,
                                                                      q.id,
                                                                  ]
                                                                : prev.filter(
                                                                      (id) =>
                                                                          id !==
                                                                          q.id,
                                                                  ),
                                                    );
                                                }}
                                                className="mt-0.5 shrink-0"
                                            />
                                            <div className="min-w-0 flex-1">
                                                <p className="line-clamp-2 text-sm">
                                                    {q.question}
                                                </p>
                                                <div className="mt-1 flex items-center gap-1.5">
                                                    <Badge
                                                        variant="outline"
                                                        className="text-xs capitalize"
                                                    >
                                                        {q.question_type.replace(
                                                            /_/g,
                                                            ' ',
                                                        )}
                                                    </Badge>
                                                    <span className="text-xs text-muted-foreground capitalize">
                                                        {q.cognitive_level}
                                                    </span>
                                                </div>
                                            </div>
                                        </label>
                                    ))}
                                </div>

                                <div className="flex justify-end">
                                    <Button
                                        size="sm"
                                        onClick={handleAddQuestions}
                                        disabled={
                                            selectedQuestionIds.length === 0 ||
                                            isAdding
                                        }
                                    >
                                        {isAdding
                                            ? 'Adding…'
                                            : `Add ${selectedQuestionIds.length > 0 ? selectedQuestionIds.length : ''} Question${selectedQuestionIds.length !== 1 ? 's' : ''}`}
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        );
    }

    // No exam yet — show creation form
    return (
        <form onSubmit={handleCreateExam} className="space-y-5">
            <div>
                <h3 className="mb-1 font-semibold">Create Exam</h3>
                <p className="text-sm text-muted-foreground">
                    Set up the exam metadata. You'll add questions in the next
                    step.
                </p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="wf4-title">Exam Title *</Label>
                <Input
                    id="wf4-title"
                    value={createForm.data.title}
                    onChange={(e) =>
                        createForm.setData('title', e.target.value)
                    }
                    placeholder="e.g., Midterm Exam"
                />
                {createForm.errors.title && (
                    <p className="text-sm text-destructive">
                        {createForm.errors.title}
                    </p>
                )}
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                    <Label htmlFor="wf4-type">Exam Type *</Label>
                    <Select
                        value={createForm.data.exam_type}
                        onValueChange={(v) =>
                            createForm.setData(
                                'exam_type',
                                v as 'formative' | 'summative' | 'diagnostic',
                            )
                        }
                    >
                        <SelectTrigger id="wf4-type">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="formative">Formative</SelectItem>
                            <SelectItem value="summative">Summative</SelectItem>
                            <SelectItem value="diagnostic">
                                Diagnostic
                            </SelectItem>
                        </SelectContent>
                    </Select>
                    {createForm.errors.exam_type && (
                        <p className="text-sm text-destructive">
                            {createForm.errors.exam_type}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="wf4-time">Time Limit (min)</Label>
                    <Input
                        id="wf4-time"
                        type="number"
                        min="1"
                        max="600"
                        value={createForm.data.time_limit}
                        onChange={(e) =>
                            createForm.setData('time_limit', e.target.value)
                        }
                        placeholder="60"
                    />
                    {createForm.errors.time_limit && (
                        <p className="text-sm text-destructive">
                            {createForm.errors.time_limit}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="wf4-passing">Passing Score (%) *</Label>
                    <Input
                        id="wf4-passing"
                        type="number"
                        min="0"
                        max="100"
                        value={createForm.data.passing_score}
                        onChange={(e) =>
                            createForm.setData('passing_score', e.target.value)
                        }
                        placeholder="75"
                    />
                    {createForm.errors.passing_score && (
                        <p className="text-sm text-destructive">
                            {createForm.errors.passing_score}
                        </p>
                    )}
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="wf4-desc">Description</Label>
                <Textarea
                    id="wf4-desc"
                    value={createForm.data.description}
                    onChange={(e) =>
                        createForm.setData('description', e.target.value)
                    }
                    placeholder="Optional description for this exam"
                    rows={2}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="wf4-instr">Instructions</Label>
                <Textarea
                    id="wf4-instr"
                    value={createForm.data.instructions}
                    onChange={(e) =>
                        createForm.setData('instructions', e.target.value)
                    }
                    placeholder="Instructions shown to students before the exam"
                    rows={3}
                />
            </div>

            <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-2">
                    <Checkbox
                        id="wf4-shuffle"
                        checked={createForm.data.shuffle_questions}
                        onCheckedChange={(checked) =>
                            createForm.setData(
                                'shuffle_questions',
                                checked as boolean,
                            )
                        }
                    />
                    <Label htmlFor="wf4-shuffle" className="cursor-pointer">
                        Shuffle Questions
                    </Label>
                </div>
                <div className="flex items-center gap-2">
                    <Checkbox
                        id="wf4-show"
                        checked={createForm.data.show_answers}
                        onCheckedChange={(checked) =>
                            createForm.setData(
                                'show_answers',
                                checked as boolean,
                            )
                        }
                    />
                    <Label htmlFor="wf4-show" className="cursor-pointer">
                        Show Answers After Submission
                    </Label>
                </div>
            </div>

            <div className="flex justify-end">
                <Button type="submit" disabled={createForm.processing}>
                    <Save className="mr-2 size-4" />
                    {createForm.processing ? 'Creating…' : 'Create Exam'}
                </Button>
            </div>
        </form>
    );
}
