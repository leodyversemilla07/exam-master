import { Head, useForm, Link } from '@inertiajs/react';
import { Save, Clock, Calendar, Settings, AlertCircle } from 'lucide-react';
import type { FormEventHandler } from 'react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { BreadcrumbItem } from '@/types';
import PageHeader from '@/components/page-header';
import type { ExamSession } from '@/types/models';
import * as examSessions from '@/routes/exam-sessions';

interface Exam {
    id: number;
    title: string;
    module_id: number | null;
    module: { id: number; name: string } | null;
    total_items: number;
    total_points: number;
    time_limit: number | null;
}

interface PageProps {
    session: ExamSession & {
        exam: Exam;
    };
    exams: Exam[];
}

const breadcrumbs = (props: PageProps): BreadcrumbItem[] => [
    { title: 'Exam Sessions', href: examSessions.index.url() },
    {
        title: props.session.title,
        href: examSessions.show.url(props.session.id),
    },
    { title: 'Edit', href: examSessions.edit.url(props.session.id) },
];

function formatDateTimeLocal(dateString: string): string {
    const date = new Date(dateString);

    return date.toISOString().slice(0, 16);
}

export default function Edit({ session }: PageProps) {
    const { data, setData, put, processing, errors, isDirty } = useForm({
        title: session.title,
        description: session.description || '',
        start_time: formatDateTimeLocal(session.start_time),
        end_time: formatDateTimeLocal(session.end_time),
        max_attempts: session.max_attempts.toString(),
        shuffle_questions: session.shuffle_questions,
        shuffle_options: session.shuffle_options,
        show_results_immediately: session.show_results_immediately,
        show_correct_answers: session.show_correct_answers,
        allow_review: session.allow_review,
        status: session.status,
    });

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        put(examSessions.update.url(session.id));
    };

    // Calculate session duration in minutes
    const sessionDurationMinutes = (() => {
        if (!data.start_time || !data.end_time) {
            return null;
        }

        const start = new Date(data.start_time);
        const end = new Date(data.end_time);
        const diffMs = end.getTime() - start.getTime();

        if (diffMs <= 0) {
            return null;
        }

        return Math.floor(diffMs / (1000 * 60));
    })();

    const formatDuration = (minutes: number) => {
        if (minutes < 60) {
            return `${minutes} minutes`;
        }

        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;

        return mins > 0
            ? `${hours}h ${mins}m`
            : `${hours} hour${hours > 1 ? 's' : ''}`;
    };

    const hasAttempts =
        session.exam &&
        'attempts_count' in session &&
        (session as any).attempts_count > 0;

    return (
        <>
            <Head title={`Edit ${session.title}`} />

            <div className="p-6 md:p-8">
                <div className="mx-auto max-w-4xl space-y-6">
                    <PageHeader
                        title="Edit Exam Session"
                        description={`Update session settings for ${session.title}`}
                    />

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Exam Info (Read-only) */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Exam</CardTitle>
                                <CardDescription>
                                    The exam for this session cannot be changed
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="rounded-lg bg-muted p-4">
                                    <div className="font-medium">
                                        {session.exam.title}
                                    </div>
                                    {session.exam.module && (
                                        <div className="text-sm text-muted-foreground">
                                            {session.exam.module.name}
                                        </div>
                                    )}
                                    <div className="mt-2 flex gap-4 text-sm">
                                        <span>
                                            {session.exam.total_items} questions
                                        </span>
                                        <span>
                                            {session.exam.total_points} points
                                        </span>
                                        {session.exam.time_limit && (
                                            <span>
                                                {session.exam.time_limit} min
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Session Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Settings className="size-5" />
                                    Session Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">
                                        Session Title *
                                    </Label>
                                    <Input
                                        id="title"
                                        value={data.title}
                                        onChange={(e) =>
                                            setData('title', e.target.value)
                                        }
                                        placeholder="e.g., Midterm Exam - Section A"
                                    />
                                    {errors.title && (
                                        <p className="text-sm text-destructive">
                                            {errors.title}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">
                                        Description (Optional)
                                    </Label>
                                    <Textarea
                                        id="description"
                                        value={data.description}
                                        onChange={(e) =>
                                            setData(
                                                'description',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Additional instructions or notes for students..."
                                        rows={3}
                                    />
                                    {errors.description && (
                                        <p className="text-sm text-destructive">
                                            {errors.description}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="status">Status</Label>
                                    <Select
                                        value={data.status}
                                        onValueChange={(v) =>
                                            setData(
                                                'status',
                                                v as
                                                    | 'draft'
                                                    | 'active'
                                                    | 'ended',
                                            )
                                        }
                                    >
                                        <SelectTrigger id="status">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="draft">
                                                Draft
                                            </SelectItem>
                                            <SelectItem value="active">
                                                Active
                                            </SelectItem>
                                            <SelectItem value="ended">
                                                Ended
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.status && (
                                        <p className="text-sm text-destructive">
                                            {errors.status}
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Schedule */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="size-5" />
                                    Schedule
                                </CardTitle>
                                <CardDescription>
                                    When should this session be available to
                                    students?
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="start_time">
                                            Start Time *
                                        </Label>
                                        <Input
                                            id="start_time"
                                            type="datetime-local"
                                            value={data.start_time}
                                            onChange={(e) =>
                                                setData(
                                                    'start_time',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                        {errors.start_time && (
                                            <p className="text-sm text-destructive">
                                                {errors.start_time}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="end_time">
                                            End Time *
                                        </Label>
                                        <Input
                                            id="end_time"
                                            type="datetime-local"
                                            value={data.end_time}
                                            onChange={(e) =>
                                                setData(
                                                    'end_time',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                        {errors.end_time && (
                                            <p className="text-sm text-destructive">
                                                {errors.end_time}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {sessionDurationMinutes &&
                                    sessionDurationMinutes > 0 && (
                                        <div className="rounded-lg bg-muted p-3">
                                            <p className="text-sm">
                                                <span className="text-muted-foreground">
                                                    Exam duration:{' '}
                                                </span>
                                                <span className="font-medium">
                                                    {formatDuration(
                                                        sessionDurationMinutes,
                                                    )}
                                                </span>
                                            </p>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                Students will have this amount
                                                of time to complete the exam
                                            </p>
                                        </div>
                                    )}
                            </CardContent>
                        </Card>

                        {/* Attempts */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Clock className="size-5" />
                                    Attempts
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <Label htmlFor="max_attempts">
                                        Maximum Attempts *
                                    </Label>
                                    <Select
                                        value={data.max_attempts}
                                        onValueChange={(v) =>
                                            setData('max_attempts', v ?? '')
                                        }
                                    >
                                        <SelectTrigger
                                            id="max_attempts"
                                            className="w-full md:w-48"
                                        >
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {[1, 2, 3, 4, 5].map((n) => (
                                                <SelectItem
                                                    key={n}
                                                    value={n.toString()}
                                                >
                                                    {n} attempt
                                                    {n > 1 ? 's' : ''}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.max_attempts && (
                                        <p className="text-sm text-destructive">
                                            {errors.max_attempts}
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Options */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Options</CardTitle>
                                {hasAttempts && (
                                    <div className="flex items-center gap-2 text-sm text-amber-600">
                                        <AlertCircle className="size-4" />
                                        Some options may affect in-progress
                                        attempts
                                    </div>
                                )}
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label
                                            htmlFor="shuffle_questions"
                                            className="text-base"
                                        >
                                            Shuffle Questions
                                        </Label>
                                        <p className="text-sm text-muted-foreground">
                                            Randomize the order of questions for
                                            each student
                                        </p>
                                    </div>
                                    <Switch
                                        id="shuffle_questions"
                                        checked={data.shuffle_questions}
                                        onCheckedChange={(checked) =>
                                            setData(
                                                'shuffle_questions',
                                                checked,
                                            )
                                        }
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label
                                            htmlFor="shuffle_options"
                                            className="text-base"
                                        >
                                            Shuffle Answer Options
                                        </Label>
                                        <p className="text-sm text-muted-foreground">
                                            Randomize the order of answer
                                            options for each question
                                        </p>
                                    </div>
                                    <Switch
                                        id="shuffle_options"
                                        checked={data.shuffle_options}
                                        onCheckedChange={(checked) =>
                                            setData('shuffle_options', checked)
                                        }
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label
                                            htmlFor="show_results_immediately"
                                            className="text-base"
                                        >
                                            Show Results Immediately
                                        </Label>
                                        <p className="text-sm text-muted-foreground">
                                            Display score and percentage right
                                            after submission
                                        </p>
                                    </div>
                                    <Switch
                                        id="show_results_immediately"
                                        checked={data.show_results_immediately}
                                        onCheckedChange={(checked) =>
                                            setData(
                                                'show_results_immediately',
                                                checked,
                                            )
                                        }
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label
                                            htmlFor="show_correct_answers"
                                            className="text-base"
                                        >
                                            Show Correct Answers
                                        </Label>
                                        <p className="text-sm text-muted-foreground">
                                            Show correct answers after exam
                                            submission
                                        </p>
                                    </div>
                                    <Switch
                                        id="show_correct_answers"
                                        checked={data.show_correct_answers}
                                        onCheckedChange={(checked) =>
                                            setData(
                                                'show_correct_answers',
                                                checked,
                                            )
                                        }
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label
                                            htmlFor="allow_review"
                                            className="text-base"
                                        >
                                            Allow Review
                                        </Label>
                                        <p className="text-sm text-muted-foreground">
                                            Allow students to review their
                                            answers after submission
                                        </p>
                                    </div>
                                    <Switch
                                        id="allow_review"
                                        checked={data.allow_review}
                                        onCheckedChange={(checked) =>
                                            setData('allow_review', checked)
                                        }
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Submit */}
                        <div className="flex justify-end gap-4">
                            <Button variant="outline" render={<Link href={examSessions.show.url(session.id)} />} nativeButton={false}>
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={processing || !isDirty}
                            >
                                <Save className="mr-2 size-4" />
                                {processing ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

Edit.layout = { breadcrumbs };
