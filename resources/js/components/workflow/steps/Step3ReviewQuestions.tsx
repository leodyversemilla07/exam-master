import { router } from '@inertiajs/react';
import { useState } from 'react';
import { CheckCircle2, XCircle, CheckCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import type { ExamQuestion, TosGenerate } from '@/types/models';

interface Props {
    tos: TosGenerate & { questions: ExamQuestion[] };
    onAdvance: () => void;
}

const COGNITIVE_COLORS: Record<string, string> = {
    remembering: 'bg-blue-100 text-blue-700',
    understanding: 'bg-sky-100 text-sky-700',
    applying: 'bg-green-100 text-green-700',
    analyzing: 'bg-yellow-100 text-yellow-700',
    evaluating: 'bg-orange-100 text-orange-700',
    creating: 'bg-purple-100 text-purple-700',
};

const DIFFICULTY_COLORS: Record<string, string> = {
    easy: 'bg-success/10 text-success',
    medium: 'bg-warning/10 text-warning',
    hard: 'bg-destructive/10 text-destructive',
};

export default function Step3ReviewQuestions({ tos, onAdvance }: Props) {
    const questions = tos.questions ?? [];
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [approvingId, setApprovingId] = useState<number | null>(null);
    const [bulkApproving, setBulkApproving] = useState(false);

    const approvedCount = questions.filter(
        (q) => q.status === 'approved',
    ).length;
    const pendingQuestions = questions.filter(
        (q) => q.status !== 'approved' && q.status !== 'rejected',
    );
    const allSelected =
        pendingQuestions.length > 0 &&
        selectedIds.length === pendingQuestions.length;
    const canAdvance = approvedCount > 0;

    const toggleSelectAll = () => {
        if (allSelected) {
            setSelectedIds([]);
        } else {
            setSelectedIds(pendingQuestions.map((q) => q.id));
        }
    };

    const toggleSelect = (id: number) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
        );
    };

    const approveQuestion = (questionId: number) => {
        setApprovingId(questionId);
        router.post(
            `/question-bank/${questionId}/approve`,
            {},
            {
                preserveScroll: true,
                only: ['latestTos'],
                onFinish: () => setApprovingId(null),
            },
        );
    };

    const bulkApprove = () => {
        if (selectedIds.length === 0) {
            return;
        }

        setBulkApproving(true);

        const approveNext = (ids: number[]) => {
            if (ids.length === 0) {
                setBulkApproving(false);
                setSelectedIds([]);

                return;
            }

            router.post(
                `/question-bank/${ids[0]}/approve`,
                {},
                {
                    preserveScroll: true,
                    only: ['latestTos'],
                    onFinish: () => approveNext(ids.slice(1)),
                },
            );
        };

        approveNext(selectedIds);
    };

    return (
        <div className="space-y-4">
            {/* Header + progress */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="font-semibold">
                        Review Generated Questions
                    </h3>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                        Approve questions to include them in your exam bank.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">
                        <span className="text-success">{approvedCount}</span>
                        <span className="text-muted-foreground">
                            {' '}
                            / {questions.length} approved
                        </span>
                    </span>
                    <Button
                        onClick={onAdvance}
                        disabled={!canAdvance}
                        size="sm"
                    >
                        Continue to Build Exam
                    </Button>
                </div>
            </div>

            {/* Bulk actions toolbar */}
            {pendingQuestions.length > 0 && (
                <div className="flex items-center gap-3 rounded-lg border bg-muted/30 px-4 py-2">
                    <Checkbox
                        checked={allSelected}
                        onCheckedChange={toggleSelectAll}
                        id="select-all"
                    />
                    <label
                        htmlFor="select-all"
                        className="cursor-pointer text-sm select-none"
                    >
                        Select all pending ({pendingQuestions.length})
                    </label>
                    {selectedIds.length > 0 && (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={bulkApprove}
                            disabled={bulkApproving}
                            className="ml-auto"
                        >
                            <CheckCheck className="mr-1.5 size-4" />
                            {bulkApproving
                                ? 'Approving…'
                                : `Approve Selected (${selectedIds.length})`}
                        </Button>
                    )}
                </div>
            )}

            {/* Question list */}
            <div className="space-y-3">
                {questions.map((question) => {
                    const isPending =
                        question.status !== 'approved' &&
                        question.status !== 'rejected';
                    const isApproved = question.status === 'approved';
                    const isSelected = selectedIds.includes(question.id);
                    const isApproving = approvingId === question.id;

                    return (
                        <div
                            key={question.id}
                            className={`rounded-lg border p-4 transition-colors ${isApproved ? 'border-success/30 bg-success/5' : isSelected ? 'border-primary/40 bg-primary/5' : 'bg-card'}`}
                        >
                            <div className="flex items-start gap-3">
                                {/* Checkbox for pending questions */}
                                {isPending && (
                                    <Checkbox
                                        checked={isSelected}
                                        onCheckedChange={() =>
                                            toggleSelect(question.id)
                                        }
                                        className="mt-0.5 shrink-0"
                                    />
                                )}
                                {isApproved && (
                                    <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-success" />
                                )}
                                {question.status === 'rejected' && (
                                    <XCircle className="mt-0.5 size-5 shrink-0 text-destructive" />
                                )}

                                <div className="min-w-0 flex-1">
                                    {/* Question text */}
                                    <p className="text-sm leading-snug font-medium">
                                        {question.question}
                                    </p>

                                    {/* Options (multiple choice) */}
                                    {question.options &&
                                        question.options.length > 0 && (
                                            <ul className="mt-2 space-y-1">
                                                {question.options.map((opt) => (
                                                    <li
                                                        key={opt.key}
                                                        className={`flex gap-2 text-xs ${opt.key === question.correct_answer ? 'font-medium text-success' : 'text-muted-foreground'}`}
                                                    >
                                                        <span className="shrink-0 font-semibold uppercase">
                                                            {opt.key}.
                                                        </span>
                                                        <span>{opt.text}</span>
                                                        {opt.key ===
                                                            question.correct_answer && (
                                                            <CheckCircle2 className="mt-0.5 size-3 shrink-0" />
                                                        )}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}

                                    {/* Badges */}
                                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                                        <Badge
                                            variant="outline"
                                            className={`text-xs ${COGNITIVE_COLORS[question.cognitive_level] ?? ''}`}
                                        >
                                            {question.cognitive_level}
                                        </Badge>
                                        <Badge
                                            variant="outline"
                                            className={`text-xs ${DIFFICULTY_COLORS[question.difficulty] ?? ''}`}
                                        >
                                            {question.difficulty}
                                        </Badge>
                                        <Badge
                                            variant="outline"
                                            className="text-xs capitalize"
                                        >
                                            {question.question_type.replace(
                                                /_/g,
                                                ' ',
                                            )}
                                        </Badge>
                                        {question.learning_objective_code && (
                                            <span className="text-xs text-muted-foreground">
                                                {
                                                    question.learning_objective_code
                                                }
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Approve button */}
                                {isPending && (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="shrink-0 border-success/40 text-success hover:bg-success/10"
                                        onClick={() =>
                                            approveQuestion(question.id)
                                        }
                                        disabled={isApproving || bulkApproving}
                                    >
                                        {isApproving ? (
                                            'Approving…'
                                        ) : (
                                            <>
                                                <CheckCircle2 className="mr-1.5 size-4" />
                                                Approve
                                            </>
                                        )}
                                    </Button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {questions.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <p className="text-muted-foreground">
                        No questions found for this TOS.
                    </p>
                </div>
            )}

            {canAdvance && (
                <div className="flex justify-end pt-2">
                    <Button onClick={onAdvance}>Continue to Build Exam</Button>
                </div>
            )}
        </div>
    );
}
