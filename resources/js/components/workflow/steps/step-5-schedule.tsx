import { useForm } from '@inertiajs/react';
import {
    Save,
    Calendar,
    Clock,
    Settings,
    CheckCircle2,
    ExternalLink,
} from 'lucide-react';
import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
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
import type { Exam, ExamSession } from '@/types/models';
import { store } from '@/routes/exam-sessions';

interface Props {
    exam: Exam;
    onAdvance: (session: ExamSession) => void;
}

export default function Step5Schedule({ exam, onAdvance }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        exam_id: exam.id.toString(),
        title: `${exam.title} — Session`,
        description: '',
        start_time: '',
        end_time: '',
        max_attempts: '1',
        shuffle_questions: false,
        shuffle_options: false,
        show_results_immediately: true,
        show_correct_answers: false,
        allow_review: true,
    });

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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(store.url(), {
            onSuccess: (page) => {
                const session = (page.props as Record<string, unknown>)
                    .session as ExamSession | undefined;

                if (session) {
                    onAdvance(session);
                } else {
                    onAdvance({} as ExamSession);
                }
            },
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div>
                <h3 className="mb-1 font-semibold">Schedule Exam Session</h3>
                <p className="text-sm text-muted-foreground">
                    Create a session so students can take{' '}
                    <span className="font-medium">{exam.title}</span>.
                </p>
            </div>

            {/* Session Details */}
            <div className="space-y-4 rounded-lg border p-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                    <Settings className="size-4" />
                    Session Details
                </div>

                <div className="space-y-2">
                    <Label htmlFor="wf5-title">Session Title *</Label>
                    <Input
                        id="wf5-title"
                        value={data.title}
                        onChange={(e) => setData('title', e.target.value)}
                        placeholder="e.g., Midterm Exam — Section A"
                    />
                    {errors.title && (
                        <p className="text-sm text-destructive">
                            {errors.title}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="wf5-desc">Description (Optional)</Label>
                    <Textarea
                        id="wf5-desc"
                        value={data.description}
                        onChange={(e) => setData('description', e.target.value)}
                        placeholder="Additional notes for students..."
                        rows={2}
                    />
                </div>
            </div>

            {/* Schedule */}
            <div className="space-y-4 rounded-lg border p-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                    <Calendar className="size-4" />
                    Schedule
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="wf5-start">Start Date & Time *</Label>
                        <Input
                            id="wf5-start"
                            type="datetime-local"
                            value={data.start_time}
                            onChange={(e) =>
                                setData('start_time', e.target.value)
                            }
                        />
                        {errors.start_time && (
                            <p className="text-sm text-destructive">
                                {errors.start_time}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="wf5-end">End Date & Time *</Label>
                        <Input
                            id="wf5-end"
                            type="datetime-local"
                            value={data.end_time}
                            onChange={(e) =>
                                setData('end_time', e.target.value)
                            }
                        />
                        {errors.end_time && (
                            <p className="text-sm text-destructive">
                                {errors.end_time}
                            </p>
                        )}
                    </div>
                </div>

                {sessionDurationMinutes !== null &&
                    sessionDurationMinutes > 0 && (
                        <p className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
                            Duration:{' '}
                            <span className="font-medium text-foreground">
                                {formatDuration(sessionDurationMinutes)}
                            </span>
                        </p>
                    )}
            </div>

            {/* Attempts */}
            <div className="space-y-3 rounded-lg border p-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                    <Clock className="size-4" />
                    Attempts
                </div>

                <div className="space-y-2">
                    <Label htmlFor="wf5-attempts">Maximum Attempts *</Label>
                    <Select
                        value={data.max_attempts}
                        onValueChange={(v) => setData('max_attempts', v ?? '')}
                    >
                        <SelectTrigger id="wf5-attempts" className="w-40">
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

            {/* Options */}
            <div className="space-y-4 rounded-lg border p-4">
                <p className="text-sm font-medium">Options</p>

                {(
                    [
                        {
                            key: 'shuffle_questions' as const,
                            label: 'Shuffle Questions',
                            description:
                                'Randomize question order for each student',
                        },
                        {
                            key: 'shuffle_options' as const,
                            label: 'Shuffle Answer Options',
                            description: 'Randomize answer option order',
                        },
                        {
                            key: 'show_results_immediately' as const,
                            label: 'Show Results Immediately',
                            description: 'Display score right after submission',
                        },
                        {
                            key: 'show_correct_answers' as const,
                            label: 'Show Correct Answers',
                            description:
                                'Show correct answers after submission',
                        },
                        {
                            key: 'allow_review' as const,
                            label: 'Allow Review',
                            description:
                                'Let students review answers after submission',
                        },
                    ] as const
                ).map(({ key, label, description }) => (
                    <div
                        key={key}
                        className="flex items-center justify-between"
                    >
                        <div>
                            <p className="text-sm font-medium">{label}</p>
                            <p className="text-xs text-muted-foreground">
                                {description}
                            </p>
                        </div>
                        <Switch
                            checked={data[key]}
                            onCheckedChange={(checked) => setData(key, checked)}
                        />
                    </div>
                ))}
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-3">
                <Button type="submit" disabled={processing}>
                    <Save className="mr-2 size-4" />
                    {processing ? 'Creating Session…' : 'Create Session'}
                </Button>
            </div>
        </form>
    );
}

/* ─── Done state shown by WorkflowStepper after session created ─── */
export function Step5Done({
    exam,
    session,
}: {
    exam: Exam;
    session: ExamSession;
}) {
    return (
        <div className="flex flex-col items-center gap-6 py-10 text-center">
            <div className="rounded-2xl bg-success/10 p-5">
                <CheckCircle2 className="size-10 text-success" />
            </div>
            <div>
                <h3 className="mb-1 text-lg font-semibold">
                    Workflow Complete!
                </h3>
                <p className="max-w-sm text-sm text-muted-foreground">
                    Your exam session has been created. Share the access code
                    with students.
                </p>
                {session.access_code && (
                    <p className="mt-3 text-2xl font-bold tracking-widest text-primary">
                        {session.access_code}
                    </p>
                )}
            </div>
            <div className="flex gap-3">
                <Button variant="outline" render={<Link href={`/exam-sessions/${session.id}`} />} nativeButton={false}>
                    <ExternalLink className="mr-2 size-4" />
                    View Session
                </Button>
                <Button render={<Link href={`/exam-builder/${exam.id}`} />} nativeButton={false}>
                    <ExternalLink className="mr-2 size-4" />
                    View Exam
                </Button>
            </div>
        </div>
    );
}
