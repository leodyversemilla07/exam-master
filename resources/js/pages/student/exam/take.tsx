import { PageProps } from '@/types';
import { ExamAttempt } from '@/types/models';
import { Head, router } from '@inertiajs/react';
import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
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
import { Progress } from '@/components/ui/progress';
import { Clock, ChevronLeft, ChevronRight, Send, AlertTriangle, Flag, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
    submit,
    saveAnswer as saveAnswerRoute,
} from '@/actions/App/Http/Controllers/StudentExamController';

interface Question {
    id: number;
    question: string;
    question_type: string;
    options: Array<{ key: string; text: string; premise?: string; response?: string }> | null;
    points: number;
    answer_id: number;
    current_answer: string | null;
    current_answer_data: Record<string, unknown> | null;
}

interface ExamTakeProps extends PageProps {
    attempt: ExamAttempt;
    questions: Question[];
    timeRemaining: number | null;
}

export default function ExamTake({
    attempt,
    questions,
    timeRemaining: initialTimeRemaining,
}: ExamTakeProps) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<
        Record<number, { answer: string | null; answer_data: Record<string, unknown> | null }>
    >({});
    const [timeRemaining, setTimeRemaining] = useState(initialTimeRemaining);
    const [showSubmitDialog, setShowSubmitDialog] = useState(false);
    const [showTimeWarning, setShowTimeWarning] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set());
    const [lastSaved, setLastSaved] = useState<Date | null>(null);

    const toggleFlag = async (questionId: number) => {
        const isFlagged = !flaggedQuestions.has(questionId);

        setFlaggedQuestions((prev) => {
            const next = new Set(prev);
            if (next.has(questionId)) {
                next.delete(questionId);
            } else {
                next.add(questionId);
            }
            return next;
        });

        // Persist to server
        setIsSaving(true);
        try {
            await fetch(saveAnswerRoute.url(attempt.id), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN':
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    question_id: questionId,
                    is_flagged: isFlagged,
                }),
            });
            setLastSaved(new Date());
        } catch (error) {
            console.error('Failed to save flag status:', error);
        } finally {
            setIsSaving(false);
        }
    };

    // Initialize answers from props
    useEffect(() => {
        const initialAnswers: Record<
            number,
            { answer: string | null; answer_data: Record<string, unknown> | null }
        > = {};
        questions.forEach((q) => {
            initialAnswers[q.answer_id] = {
                answer: q.current_answer,
                answer_data: q.current_answer_data,
            };
        });
        setAnswers(initialAnswers);

        // Initialize flagged questions from metadata
        const metadata = attempt.metadata as Record<string, unknown>;
        if (metadata?.flagged_questions && Array.isArray(metadata.flagged_questions)) {
            setFlaggedQuestions(new Set(metadata.flagged_questions as number[]));
        }
    }, [questions, attempt.metadata]);

    // Timer
    useEffect(() => {
        if (timeRemaining === null) return;

        const interval = setInterval(() => {
            setTimeRemaining((prev) => {
                if (prev === null) return null;
                if (prev <= 0) {
                    handleAutoSubmit();
                    return 0;
                }
                if (prev === 300) {
                    setShowTimeWarning(true);
                    toast.warning('5 minutes remaining!', {
                        description: 'Please review your answers and prepare to submit.',
                    });
                }
                if (prev === 60) {
                    toast.error('Only 1 minute remaining!', {
                        description: 'Exam will be automatically submitted very soon!',
                        duration: 10000,
                    });
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const handleAutoSubmit = useCallback(() => {
        router.post(
            submit.url(attempt.id),
            {},
            {
                preserveScroll: true,
            },
        );
    }, [attempt.id]);

    const formatTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    };

    const currentQuestion = questions[currentQuestionIndex];

    const saveAnswer = async (
        answerId: number,
        answer: string | null,
        answerData: Record<string, unknown> | null,
    ) => {
        setIsSaving(true);
        try {
            await fetch(saveAnswerRoute.url(attempt.id), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN':
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    answer_id: answerId,
                    answer,
                    answer_data: answerData,
                }),
            });
        } catch (error) {
            console.error('Failed to save answer:', error);
        } finally {
            setIsSaving(false);
            setLastSaved(new Date());
        }
    };

    const handleAnswerChange = (
        answerId: number,
        answer: string | null,
        answerData: Record<string, unknown> | null = null,
    ) => {
        setAnswers((prev) => ({
            ...prev,
            [answerId]: { answer, answer_data: answerData },
        }));
        saveAnswer(answerId, answer, answerData);
    };

    const handleSubmit = () => {
        router.post(submit.url(attempt.id));
    };

    const answeredCount = Object.values(answers).filter(
        (a) => a.answer !== null || (a.answer_data && Object.keys(a.answer_data).length > 0),
    ).length;

    const progressPercentage = (answeredCount / questions.length) * 100;

    const renderQuestion = () => {
        const currentAnswer = answers[currentQuestion.answer_id];

        switch (currentQuestion.question_type) {
            case 'multiple_choice':
                return (
                    <RadioGroup
                        value={currentAnswer?.answer || ''}
                        onValueChange={(value) =>
                            handleAnswerChange(currentQuestion.answer_id, value)
                        }
                    >
                        <div className="space-y-3">
                            {currentQuestion.options?.map((option) => (
                                <div
                                    key={option.key}
                                    className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                                >
                                    <RadioGroupItem
                                        value={option.key}
                                        id={`option-${option.key}`}
                                    />
                                    <Label
                                        htmlFor={`option-${option.key}`}
                                        className="flex-1 cursor-pointer"
                                    >
                                        <span className="font-medium mr-2">{option.key}.</span>
                                        {option.text}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </RadioGroup>
                );

            case 'true_false':
                return (
                    <RadioGroup
                        value={currentAnswer?.answer || ''}
                        onValueChange={(value) =>
                            handleAnswerChange(currentQuestion.answer_id, value)
                        }
                    >
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                                <RadioGroupItem value="true" id="option-true" />
                                <Label
                                    htmlFor="option-true"
                                    className="flex-1 cursor-pointer font-medium"
                                >
                                    True
                                </Label>
                            </div>
                            <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                                <RadioGroupItem value="false" id="option-false" />
                                <Label
                                    htmlFor="option-false"
                                    className="flex-1 cursor-pointer font-medium"
                                >
                                    False
                                </Label>
                            </div>
                        </div>
                    </RadioGroup>
                );

            case 'identification':
            case 'short_answer':
                return (
                    <Input
                        value={currentAnswer?.answer || ''}
                        onChange={(e) =>
                            handleAnswerChange(currentQuestion.answer_id, e.target.value)
                        }
                        placeholder="Type your answer here..."
                        className="text-lg"
                    />
                );

            case 'essay':
                return (
                    <Textarea
                        value={currentAnswer?.answer || ''}
                        onChange={(e) =>
                            handleAnswerChange(currentQuestion.answer_id, e.target.value)
                        }
                        placeholder="Write your answer here..."
                        className="min-h-50"
                    />
                );

            case 'fill_in_the_blanks':
                const blanksCount = (currentQuestion.question.match(/\[blank\]/gi) || []).length;
                const blanksAnswers =
                    (currentAnswer?.answer_data as unknown as string[]) ||
                    Array(blanksCount).fill('');

                return (
                    <div className="space-y-4">
                        <p className="text-muted-foreground text-sm">
                            Fill in the blanks in order:
                        </p>
                        {Array.from({ length: blanksCount }).map((_, index) => (
                            <div key={index} className="flex items-center gap-3">
                                <span className="font-medium">Blank {index + 1}:</span>
                                <Input
                                    value={blanksAnswers[index] || ''}
                                    onChange={(e) => {
                                        const newBlanks = [...blanksAnswers];
                                        newBlanks[index] = e.target.value;
                                        handleAnswerChange(
                                            currentQuestion.answer_id,
                                            newBlanks.join(','),
                                            newBlanks as unknown as Record<string, unknown>,
                                        );
                                    }}
                                    placeholder={`Answer for blank ${index + 1}`}
                                    className="max-w-xs"
                                />
                            </div>
                        ))}
                    </div>
                );

            case 'matching':
                const matchingAnswers =
                    (currentAnswer?.answer_data as Record<string, string>) || {};

                return (
                    <div className="space-y-4">
                        <p className="text-muted-foreground text-sm">
                            Match each item on the left with its corresponding item on the right:
                        </p>
                        {currentQuestion.options?.map((option, index) => (
                            <div key={index} className="flex items-center gap-4">
                                <div className="flex-1 p-3 bg-muted rounded-lg">
                                    {option.premise}
                                </div>
                                <span className="text-muted-foreground">→</span>
                                <Input
                                    value={matchingAnswers[option.premise || ''] || ''}
                                    onChange={(e) => {
                                        const newMatching = { ...matchingAnswers };
                                        newMatching[option.premise || ''] = e.target.value;
                                        handleAnswerChange(
                                            currentQuestion.answer_id,
                                            JSON.stringify(newMatching),
                                            newMatching,
                                        );
                                    }}
                                    placeholder="Enter matching answer"
                                    className="flex-1"
                                />
                            </div>
                        ))}
                    </div>
                );

            default:
                return (
                    <Textarea
                        value={currentAnswer?.answer || ''}
                        onChange={(e) =>
                            handleAnswerChange(currentQuestion.answer_id, e.target.value)
                        }
                        placeholder="Type your answer here..."
                        className="min-h-37.5"
                    />
                );
        }
    };

    return (
        <>
            <Head title={`Taking Exam: ${attempt.exam_session?.exam?.title}`} />

            <div className="min-h-screen bg-background">
                {/* Header */}
                <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
                    <div className="container flex h-16 items-center justify-between">
                        <div>
                            <h1 className="font-semibold">{attempt.exam_session?.exam?.title}</h1>
                            <p className="text-sm text-muted-foreground">
                                {attempt.exam_session?.exam?.module?.name}
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            {isSaving ? (
                                <Badge variant="secondary" className="animate-pulse">
                                    Saving...
                                </Badge>
                            ) : (
                                lastSaved && (
                                    <div className="hidden md:flex items-center text-xs text-muted-foreground gap-1">
                                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                                        Saved at{' '}
                                        {lastSaved.toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            second: '2-digit',
                                        })}
                                    </div>
                                )
                            )}
                            {timeRemaining !== null && (
                                <Badge
                                    variant={timeRemaining < 300 ? 'destructive' : 'outline'}
                                    className={cn(
                                        'text-lg font-mono px-3 py-1',
                                        timeRemaining < 60 &&
                                            'animate-pulse ring-2 ring-destructive ring-offset-2',
                                    )}
                                >
                                    <Clock className="h-4 w-4 mr-2" />
                                    {formatTime(timeRemaining)}
                                </Badge>
                            )}
                            <Button onClick={() => setShowSubmitDialog(true)} size="sm">
                                <Send className="h-4 w-4 mr-2" />
                                Submit
                            </Button>
                        </div>
                    </div>
                </header>

                <div className="container py-6">
                    <div className="grid gap-6 lg:grid-cols-4">
                        {/* Question Navigation */}
                        <div className="lg:col-span-1">
                            <Card className="sticky top-24">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm">Questions</CardTitle>
                                    <Progress value={progressPercentage} className="h-2" />
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {answeredCount} of {questions.length} answered
                                    </p>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-5 gap-2">
                                        {questions.map((q, index) => {
                                            const isAnswered =
                                                answers[q.answer_id]?.answer !== null ||
                                                (answers[q.answer_id]?.answer_data &&
                                                    Object.keys(
                                                        answers[q.answer_id]?.answer_data || {},
                                                    ).length > 0);
                                            const isCurrent = index === currentQuestionIndex;
                                            const isFlagged = flaggedQuestions.has(q.id);

                                            return (
                                                <Button
                                                    key={q.id}
                                                    variant={isCurrent ? 'default' : 'outline'}
                                                    size="sm"
                                                    className={cn(
                                                        'w-full h-10 relative',
                                                        isAnswered &&
                                                            !isCurrent &&
                                                            'bg-green-100 border-green-300 hover:bg-green-200',
                                                        isFlagged && !isCurrent && 'border-orange-400',
                                                    )}
                                                    onClick={() => setCurrentQuestionIndex(index)}
                                                >
                                                    {index + 1}
                                                    {isFlagged && (
                                                        <Flag className="absolute -top-1 -right-1 h-3 w-3 fill-orange-500 text-orange-500" />
                                                    )}
                                                </Button>
                                            );
                                        })}
                                    </div>
                                    <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <div className="w-3 h-3 rounded bg-green-100 border border-green-300" />
                                            Answered
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <div className="w-3 h-3 rounded bg-primary" />
                                            Current
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Flag className="h-3 w-3 text-orange-500 fill-orange-500" />
                                            Flagged
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Question Content */}
                        <div className="lg:col-span-3">
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => toggleFlag(currentQuestion.id)}
                                                className={cn(
                                                    'h-8 px-2',
                                                    flaggedQuestions.has(currentQuestion.id)
                                                        ? 'text-orange-600 hover:text-orange-700 hover:bg-orange-50'
                                                        : 'text-muted-foreground',
                                                )}
                                            >
                                                <Flag
                                                    className={cn(
                                                        'h-4 w-4 mr-1',
                                                        flaggedQuestions.has(currentQuestion.id) &&
                                                            'fill-current',
                                                    )}
                                                />
                                                {flaggedQuestions.has(currentQuestion.id)
                                                    ? 'Flagged'
                                                    : 'Flag'}
                                            </Button>
                                            <Badge variant="outline">
                                                Question {currentQuestionIndex + 1} of{' '}
                                                {questions.length}
                                            </Badge>
                                        </div>
                                        <Badge>
                                            {currentQuestion.points} point
                                            {currentQuestion.points !== 1 ? 's' : ''}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="prose prose-sm max-w-none">
                                        <p className="text-lg">{currentQuestion.question}</p>
                                    </div>

                                    <div className="pt-4 border-t">{renderQuestion()}</div>

                                    <div className="flex justify-between pt-4">
                                        <Button
                                            variant="outline"
                                            onClick={() =>
                                                setCurrentQuestionIndex((prev) =>
                                                    Math.max(0, prev - 1),
                                                )
                                            }
                                            disabled={currentQuestionIndex === 0}
                                        >
                                            <ChevronLeft className="h-4 w-4 mr-2" />
                                            Previous
                                        </Button>
                                        <Button
                                            onClick={() =>
                                                setCurrentQuestionIndex((prev) =>
                                                    Math.min(questions.length - 1, prev + 1),
                                                )
                                            }
                                            disabled={currentQuestionIndex === questions.length - 1}
                                        >
                                            Next
                                            <ChevronRight className="h-4 w-4 ml-2" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>

            {/* Submit Confirmation Dialog */}
            <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Submit Exam?</AlertDialogTitle>
                        <AlertDialogDescription className="space-y-2">
                            <p>
                                You have answered {answeredCount} out of {questions.length}{' '}
                                questions.
                            </p>
                            {answeredCount < questions.length && (
                                <p className="text-yellow-600 flex items-center gap-2">
                                    <AlertTriangle className="h-4 w-4" />
                                    You have {questions.length - answeredCount} unanswered
                                    question(s).
                                </p>
                            )}
                            <p>
                                Are you sure you want to submit your exam? This action cannot be
                                undone.
                            </p>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Continue Exam</AlertDialogCancel>
                        <AlertDialogAction onClick={handleSubmit}>Submit Exam</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Time Warning Dialog */}
            <AlertDialog open={showTimeWarning} onOpenChange={setShowTimeWarning}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-yellow-600">
                            <Clock className="h-5 w-5" />5 Minutes Remaining
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            You have 5 minutes left to complete your exam. Please review your
                            answers and submit when ready.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction onClick={() => setShowTimeWarning(false)}>
                            Continue
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
