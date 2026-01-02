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
    SelectValue 
} from '@/components/ui/select';
import { ArrowLeft, Save, Clock, Calendar, Settings } from 'lucide-react';
import { BreadcrumbItem } from '@/types';
import * as examSessions from '@/routes/exam-sessions';
import { FormEventHandler } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Exam Sessions', href: examSessions.index.url() },
    { title: 'Create Session', href: examSessions.create.url() },
];

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
    exams: Exam[];
    selectedExamId: number | null;
}

export default function Create({ exams, selectedExamId }: PageProps) {
    const { data, setData, post, processing, errors } = useForm({
        exam_id: selectedExamId?.toString() || '',
        title: '',
        description: '',
        start_time: '',
        end_time: '',
        time_limit_minutes: '',
        max_attempts: '1',
        shuffle_questions: false,
        shuffle_options: false,
        show_results_immediately: true,
        show_correct_answers: false,
        allow_review: true,
    });

    const selectedExam = exams.find(e => e.id.toString() === data.exam_id);

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        post(examSessions.store.url());
    };

    // Set default title when exam is selected
    const handleExamChange = (value: string) => {
        setData('exam_id', value);
        const exam = exams.find(e => e.id.toString() === value);
        if (exam && !data.title) {
            setData('title', `${exam.title} - Session`);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Exam Session" />

            <div className="p-4 md:p-6">
                <div className="mx-auto max-w-4xl">
                    <div className="flex items-center gap-4 mb-6">
                        <Button variant="outline" size="icon" asChild>
                            <Link href={examSessions.index.url()}>
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Create Exam Session</h1>
                            <p className="text-muted-foreground">
                                Set up an online exam session for students to take.
                            </p>
                        </div>
                    </div>

                    {exams.length === 0 ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                <h3 className="text-lg font-semibold mb-2">No Published Exams</h3>
                                <p className="text-muted-foreground text-center mb-4">
                                    You need to create and publish an exam before creating a session.
                                </p>
                                <Button asChild>
                                    <Link href="/exam-builder">
                                        Go to Exam Builder
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Exam Selection */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Select Exam</CardTitle>
                                    <CardDescription>
                                        Choose which exam this session is for
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="exam_id">Exam *</Label>
                                        <Select 
                                            value={data.exam_id} 
                                            onValueChange={handleExamChange}
                                        >
                                            <SelectTrigger id="exam_id">
                                                <SelectValue placeholder="Select an exam..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {exams.map((exam) => (
                                                    <SelectItem key={exam.id} value={exam.id.toString()}>
                                                        <div className="flex flex-col">
                                                            <span>{exam.title}</span>
                                                            {exam.module && (
                                                                <span className="text-xs text-muted-foreground">
                                                                    {exam.module.name}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.exam_id && <p className="text-sm text-destructive">{errors.exam_id}</p>}
                                    </div>

                                    {selectedExam && (
                                        <div className="grid grid-cols-3 gap-4 p-4 rounded-lg bg-muted">
                                            <div>
                                                <p className="text-sm text-muted-foreground">Questions</p>
                                                <p className="font-medium">{selectedExam.total_items}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Total Points</p>
                                                <p className="font-medium">{selectedExam.total_points}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Time Limit</p>
                                                <p className="font-medium">
                                                    {selectedExam.time_limit ? `${selectedExam.time_limit} min` : 'No limit'}
                                                </p>
                                            </div>
                                        </div>
                                    )}
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
                                        {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
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
                                        {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
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
                                            {errors.start_time && <p className="text-sm text-destructive">{errors.start_time}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="end_time">End Time *</Label>
                                            <Input
                                                id="end_time"
                                                type="datetime-local"
                                                value={data.end_time}
                                                onChange={(e) => setData('end_time', e.target.value)}
                                            />
                                            {errors.end_time && <p className="text-sm text-destructive">{errors.end_time}</p>}
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
                                                onChange={(e) => setData('time_limit_minutes', e.target.value)}
                                                placeholder={selectedExam?.time_limit ? `Default: ${selectedExam.time_limit}` : 'No limit'}
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Leave empty to use exam's default time limit
                                            </p>
                                            {errors.time_limit_minutes && <p className="text-sm text-destructive">{errors.time_limit_minutes}</p>}
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
                                            {errors.max_attempts && <p className="text-sm text-destructive">{errors.max_attempts}</p>}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Options */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Options</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label htmlFor="shuffle_questions" className="text-base">Shuffle Questions</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Randomize the order of questions for each student
                                            </p>
                                        </div>
                                        <Switch
                                            id="shuffle_questions"
                                            checked={data.shuffle_questions}
                                            onCheckedChange={(checked) => setData('shuffle_questions', checked)}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label htmlFor="shuffle_options" className="text-base">Shuffle Answer Options</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Randomize the order of answer options for each question
                                            </p>
                                        </div>
                                        <Switch
                                            id="shuffle_options"
                                            checked={data.shuffle_options}
                                            onCheckedChange={(checked) => setData('shuffle_options', checked)}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label htmlFor="show_results_immediately" className="text-base">Show Results Immediately</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Display score and percentage right after submission
                                            </p>
                                        </div>
                                        <Switch
                                            id="show_results_immediately"
                                            checked={data.show_results_immediately}
                                            onCheckedChange={(checked) => setData('show_results_immediately', checked)}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label htmlFor="show_correct_answers" className="text-base">Show Correct Answers</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Show correct answers after exam submission
                                            </p>
                                        </div>
                                        <Switch
                                            id="show_correct_answers"
                                            checked={data.show_correct_answers}
                                            onCheckedChange={(checked) => setData('show_correct_answers', checked)}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label htmlFor="allow_review" className="text-base">Allow Review</Label>
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
                                    <Link href={examSessions.index.url()}>Cancel</Link>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    <Save className="mr-2 h-4 w-4" />
                                    {processing ? 'Creating...' : 'Create Session'}
                                </Button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
