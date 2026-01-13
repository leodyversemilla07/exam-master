import AppLayout from '@/layouts/app-layout';
import { Head, useForm, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Save, Clock, Calendar, Settings, AlertCircle } from 'lucide-react';
import { BreadcrumbItem } from '@/types';
import PageHeader from '@/components/page-header';
import { ExamSession } from '@/types/models';
import * as examSessions from '@/routes/exam-sessions';
import { FormEventHandler } from 'react';

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

const breadcrumbs = (session: ExamSession): BreadcrumbItem[] => [
    { title: 'Exam Sessions', href: examSessions.index.url() },
    { title: session.title, href: examSessions.show.url(session.id) },
    { title: 'Edit', href: examSessions.edit.url(session.id) },
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
        time_limit_minutes: session.time_limit_minutes?.toString() || '',
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

    const hasAttempts =
        session.exam && 'attempts_count' in session && (session as any).attempts_count > 0;

    return (
        <AppLayout breadcrumbs={breadcrumbs(session)}>
            <Head title={`Edit ${session.title}`} />

            <div className="p-4 md:p-6 space-y-6 max-w-4xl">
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
                            <div className="p-4 rounded-lg bg-muted">
                                <div className="font-medium">{session.exam.title}</div>
                                {session.exam.module && (
                                    <div className="text-sm text-muted-foreground">
                                        {session.exam.module.name}
                                    </div>
                                )}
                                <div className="flex gap-4 mt-2 text-sm">
                                    <span>{session.exam.total_items} questions</span>
                                    <span>{session.exam.total_points} points</span>
                                    {session.exam.time_limit && (
                                        <span>{session.exam.time_limit} min</span>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Session Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Settings className="h-5 w-5" />
                                Session Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Session Title *</Label>
                                <Input
                                    id="title"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    placeholder="e.g., Midterm Exam - Section A"
                                />
                                {errors.title && (
                                    <p className="text-sm text-destructive">{errors.title}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description (Optional)</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Additional instructions or notes for students..."
                                    rows={3}
                                />
                                {errors.description && (
                                    <p className="text-sm text-destructive">{errors.description}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <Select
                                    value={data.status}
                                    onValueChange={(v) =>
                                        setData('status', v as 'draft' | 'active' | 'ended')
                                    }
                                >
                                    <SelectTrigger id="status">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="draft">Draft</SelectItem>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="ended">Ended</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.status && (
                                    <p className="text-sm text-destructive">{errors.status}</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Schedule */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                Schedule
                            </CardTitle>
                            <CardDescription>
                                When should this session be available to students?
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="start_time">Start Time *</Label>
                                    <Input
                                        id="start_time"
                                        type="datetime-local"
                                        value={data.start_time}
                                        onChange={(e) => setData('start_time', e.target.value)}
                                    />
                                    {errors.start_time && (
                                        <p className="text-sm text-destructive">
                                            {errors.start_time}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="end_time">End Time *</Label>
                                    <Input
                                        id="end_time"
                                        type="datetime-local"
                                        value={data.end_time}
                                        onChange={(e) => setData('end_time', e.target.value)}
                                    />
                                    {errors.end_time && (
                                        <p className="text-sm text-destructive">
                                            {errors.end_time}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Time & Attempts */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-5 w-5" />
                                Time & Attempts
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="time_limit_minutes">Time Limit (minutes)</Label>
                                    <Input
                                        id="time_limit_minutes"
                                        type="number"
                                        min="1"
                                        max="480"
                                        value={data.time_limit_minutes}
                                        onChange={(e) =>
                                            setData('time_limit_minutes', e.target.value)
                                        }
                                        placeholder={
                                            session.exam?.time_limit
                                                ? `Default: ${session.exam.time_limit}`
                                                : 'No limit'
                                        }
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Leave empty to use exam's default time limit
                                    </p>
                                    {errors.time_limit_minutes && (
                                        <p className="text-sm text-destructive">
                                            {errors.time_limit_minutes}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="max_attempts">Maximum Attempts *</Label>
                                    <Select
                                        value={data.max_attempts}
                                        onValueChange={(v) => setData('max_attempts', v)}
                                    >
                                        <SelectTrigger id="max_attempts">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {[1, 2, 3, 4, 5].map((n) => (
                                                <SelectItem key={n} value={n.toString()}>
                                                    {n} attempt{n > 1 ? 's' : ''}
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
                            </div>
                        </CardContent>
                    </Card>

                    {/* Options */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Options</CardTitle>
                            {hasAttempts && (
                                <div className="flex items-center gap-2 text-sm text-amber-600">
                                    <AlertCircle className="h-4 w-4" />
                                    Some options may affect in-progress attempts
                                </div>
                            )}
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label htmlFor="shuffle_questions" className="text-base">
                                        Shuffle Questions
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                        Randomize the order of questions for each student
                                    </p>
                                </div>
                                <Switch
                                    id="shuffle_questions"
                                    checked={data.shuffle_questions}
                                    onCheckedChange={(checked) =>
                                        setData('shuffle_questions', checked)
                                    }
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <Label htmlFor="shuffle_options" className="text-base">
                                        Shuffle Answer Options
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                        Randomize the order of answer options for each question
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
                                    <Label htmlFor="show_results_immediately" className="text-base">
                                        Show Results Immediately
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                        Display score and percentage right after submission
                                    </p>
                                </div>
                                <Switch
                                    id="show_results_immediately"
                                    checked={data.show_results_immediately}
                                    onCheckedChange={(checked) =>
                                        setData('show_results_immediately', checked)
                                    }
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <Label htmlFor="show_correct_answers" className="text-base">
                                        Show Correct Answers
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                        Show correct answers after exam submission
                                    </p>
                                </div>
                                <Switch
                                    id="show_correct_answers"
                                    checked={data.show_correct_answers}
                                    onCheckedChange={(checked) =>
                                        setData('show_correct_answers', checked)
                                    }
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <Label htmlFor="allow_review" className="text-base">
                                        Allow Review
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                        Allow students to review their answers after submission
                                    </p>
                                </div>
                                <Switch
                                    id="allow_review"
                                    checked={data.allow_review}
                                    onCheckedChange={(checked) => setData('allow_review', checked)}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Submit */}
                    <div className="flex justify-end gap-4">
                        <Button variant="outline" asChild>
                            <Link href={examSessions.show.url(session.id)}>Cancel</Link>
                        </Button>
                        <Button type="submit" disabled={processing || !isDirty}>
                            <Save className="mr-2 h-4 w-4" />
                            {processing ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
