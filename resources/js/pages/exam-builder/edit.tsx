import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { Save } from 'lucide-react';
import { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Exam Builder', href: '/exam-builder' },
    { title: 'Edit Exam', href: '#' },
];

interface Exam {
    id: number;
    module_id: number;
    tos_generate_id?: number;
    exam_template_id?: number;
    title: string;
    description?: string;
    exam_type: string;
    time_limit?: number;
    passing_score: number;
    instructions?: string;
    shuffle_questions: boolean;
    show_answers: boolean;
    module: {
        id: number;
        code: string;
        name: string;
    };
}

interface PageProps {
    exam: Exam;
    modules: {
        id: number;
        code: string;
        name: string;
    }[];
    tosTemplates: {
        id: number;
        module_id: number;
        subject: string;
        module: {
            code: string;
            name: string;
        };
    }[];
    examTemplates: {
        id: number;
        name: string;
    }[];
}

export default function EditExam({ exam, modules, tosTemplates, examTemplates }: PageProps) {
    const form = useForm({
        module_id: exam.module_id.toString(),
        tos_generate_id: exam.tos_generate_id?.toString() || '',
        exam_template_id: exam.exam_template_id?.toString() || '',
        title: exam.title,
        description: exam.description || '',
        exam_type: exam.exam_type,
        time_limit: exam.time_limit?.toString() || '',
        passing_score: exam.passing_score.toString(),
        instructions: exam.instructions || '',
        shuffle_questions: exam.shuffle_questions,
        show_answers: exam.show_answers,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.put(`/exam-builder/${exam.id}`, {
            onSuccess: () => {
                // Redirect will be handled by the controller
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Exam" />

            <div className="p-4 md:p-6">
                <div className="mx-auto max-w-4xl">
                    <div className="mb-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Edit Exam</CardTitle>
                                <CardDescription>Update the exam information.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="module_id">Module *</Label>
                                            <Select
                                                value={form.data.module_id}
                                                onValueChange={(value) =>
                                                    form.setData('module_id', value)
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a module" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {modules.map((module) => (
                                                        <SelectItem
                                                            key={module.id}
                                                            value={module.id.toString()}
                                                        >
                                                            {module.code} - {module.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {form.errors.module_id && (
                                                <p className="text-sm text-destructive">
                                                    {form.errors.module_id}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="tos_generate_id">
                                                TOS Template (Optional)
                                            </Label>
                                            <Select
                                                value={form.data.tos_generate_id}
                                                onValueChange={(value) =>
                                                    form.setData('tos_generate_id', value)
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a TOS template" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {tosTemplates
                                                        .filter(
                                                            (template) =>
                                                                template.module_id ===
                                                                parseInt(form.data.module_id),
                                                        )
                                                        .map((template) => (
                                                            <SelectItem
                                                                key={template.id}
                                                                value={template.id.toString()}
                                                            >
                                                                {template.subject} (
                                                                {template.module.code})
                                                            </SelectItem>
                                                        ))}
                                                </SelectContent>
                                            </Select>
                                            {form.errors.tos_generate_id && (
                                                <p className="text-sm text-destructive">
                                                    {form.errors.tos_generate_id}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="exam_template_id">
                                            Exam Template (Optional)
                                        </Label>
                                        <Select
                                            value={form.data.exam_template_id}
                                            onValueChange={(value) =>
                                                form.setData('exam_template_id', value)
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Default Template" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="null">
                                                    Default Template
                                                </SelectItem>
                                                {examTemplates.map((template) => (
                                                    <SelectItem
                                                        key={template.id}
                                                        value={template.id.toString()}
                                                    >
                                                        {template.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {/* @ts-ignore */}
                                        {form.errors.exam_template_id && (
                                            /* @ts-ignore */
                                            <p className="text-sm text-destructive">
                                                {form.errors.exam_template_id}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="title">Exam Title *</Label>
                                        <Input
                                            id="title"
                                            value={form.data.title}
                                            onChange={(e) => form.setData('title', e.target.value)}
                                            placeholder="Enter exam title"
                                        />
                                        {form.errors.title && (
                                            <p className="text-sm text-destructive">
                                                {form.errors.title}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="description">Description</Label>
                                        <Textarea
                                            id="description"
                                            value={form.data.description}
                                            onChange={(e) =>
                                                form.setData('description', e.target.value)
                                            }
                                            placeholder="Enter exam description"
                                            rows={3}
                                        />
                                        {form.errors.description && (
                                            <p className="text-sm text-destructive">
                                                {form.errors.description}
                                            </p>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="exam_type">Exam Type *</Label>
                                            <Select
                                                value={form.data.exam_type}
                                                onValueChange={(value) =>
                                                    form.setData('exam_type', value)
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select exam type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="formative">
                                                        Formative
                                                    </SelectItem>
                                                    <SelectItem value="summative">
                                                        Summative
                                                    </SelectItem>
                                                    <SelectItem value="diagnostic">
                                                        Diagnostic
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {form.errors.exam_type && (
                                                <p className="text-sm text-destructive">
                                                    {form.errors.exam_type}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="time_limit">Time Limit (minutes)</Label>
                                            <Input
                                                id="time_limit"
                                                type="number"
                                                value={form.data.time_limit}
                                                onChange={(e) =>
                                                    form.setData('time_limit', e.target.value)
                                                }
                                                placeholder="60"
                                                min="1"
                                                max="600"
                                            />
                                            {form.errors.time_limit && (
                                                <p className="text-sm text-destructive">
                                                    {form.errors.time_limit}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="passing_score">
                                                Passing Score (%) *
                                            </Label>
                                            <Input
                                                id="passing_score"
                                                type="number"
                                                value={form.data.passing_score}
                                                onChange={(e) =>
                                                    form.setData('passing_score', e.target.value)
                                                }
                                                placeholder="75"
                                                min="0"
                                                max="100"
                                                step="0.01"
                                            />
                                            {form.errors.passing_score && (
                                                <p className="text-sm text-destructive">
                                                    {form.errors.passing_score}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="instructions">Instructions</Label>
                                        <Textarea
                                            id="instructions"
                                            value={form.data.instructions}
                                            onChange={(e) =>
                                                form.setData('instructions', e.target.value)
                                            }
                                            placeholder="Enter exam instructions"
                                            rows={4}
                                        />
                                        {form.errors.instructions && (
                                            <p className="text-sm text-destructive">
                                                {form.errors.instructions}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex flex-wrap gap-6">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="shuffle_questions"
                                                checked={form.data.shuffle_questions}
                                                onCheckedChange={(checked) =>
                                                    form.setData(
                                                        'shuffle_questions',
                                                        checked as boolean,
                                                    )
                                                }
                                            />
                                            <Label htmlFor="shuffle_questions">
                                                Shuffle Questions
                                            </Label>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="show_answers"
                                                checked={form.data.show_answers}
                                                onCheckedChange={(checked) =>
                                                    form.setData('show_answers', checked as boolean)
                                                }
                                            />
                                            <Label htmlFor="show_answers">
                                                Show Answers After Submission
                                            </Label>
                                        </div>
                                    </div>

                                    <div className="flex justify-end">
                                        <Button
                                            type="submit"
                                            disabled={form.processing}
                                            className="min-w-32"
                                        >
                                            <Save className="mr-2 h-4 w-4" />
                                            {form.processing ? 'Updating...' : 'Update Exam'}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
