import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Field, FieldLabel, FieldError } from '@/components/ui/field';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, router } from '@inertiajs/react';
import { Plus } from 'lucide-react';

interface Module {
    id: number;
    code: string;
    name: string;
}

interface TosInfo {
    id: number;
    title: string;
    module: {
        id: number;
        code: string;
        name: string;
    };
}

interface PageProps {
    modules: Module[];
    from_group?: string;
    from_group_id?: number;
    from_group_name?: string;
    from_tos?: TosInfo;
}

export default function ExamCreate({ modules, from_group, from_group_id, from_group_name, from_tos }: PageProps) {
    const breadcrumbs = from_group && from_group_id && from_group_name
        ? [
            { title: 'Question Bank', href: '/question-bank' },
            { 
                title: from_group_name, 
                href: from_group === 'tos' 
                    ? `/question-bank/tos/${from_group_id}` 
                    : `/question-bank/module/${from_group_id}` 
            },
            { title: 'Create', href: '/question-bank/create' },
        ]
        : [
            { title: 'Question Bank', href: '/question-bank' },
            { title: 'Create', href: '/question-bank/create' },
        ];

    const { data, setData, post, processing, errors } = useForm({
        module_id: modules.length > 0 ? modules[0].id : 0,
        question_type: 'multiple_choice',
        question: '',
        options: [
            { key: 'A', text: '' },
            { key: 'B', text: '' },
            { key: 'C', text: '' },
            { key: 'D', text: '' },
        ],
        correct_answer: '',
        explanation: '',
        cognitive_level: 'remembering',
        difficulty: 'moderate',
        learning_objective_code: '',
        points: 1,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/question-bank');
    };

    const handleOptionChange = (index: number, text: string) => {
        const newOptions = [...data.options];
        newOptions[index] = { ...newOptions[index], text };
        setData('options', newOptions);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Question" />

            <div className="p-4 md:p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-bold">Add New Question</h1>
                            <p className="text-muted-foreground">
                                Create an individual question to add to your question bank. This question can later be used in multiple exams.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Create Form */}
                <form onSubmit={handleSubmit}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Question Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Module Selection */}
                            <Field>
                                <FieldLabel htmlFor="module_id">Module *</FieldLabel>
                                <Select
                                    value={data.module_id.toString()}
                                    onValueChange={(value) => setData('module_id', parseInt(value))}
                                >
                                    <SelectTrigger id="module_id">
                                        <SelectValue placeholder="Select module" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {modules.map((module) => (
                                            <SelectItem key={module.id} value={module.id.toString()}>
                                                {module.code} - {module.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.module_id && <FieldError>{errors.module_id}</FieldError>}
                            </Field>

                            {/* Question Text */}
                            <Field>
                                <FieldLabel htmlFor="question">Question *</FieldLabel>
                                <Textarea
                                    id="question"
                                    value={data.question}
                                    onChange={(e) => setData('question', e.target.value)}
                                    rows={4}
                                    placeholder="Enter the question text"
                                />
                                {errors.question && <FieldError>{errors.question}</FieldError>}
                            </Field>

                            {/* Question Type */}
                            <Field>
                                <FieldLabel htmlFor="question_type">Question Type *</FieldLabel>
                                <Select
                                    value={data.question_type}
                                    onValueChange={(value) => setData('question_type', value)}
                                >
                                    <SelectTrigger id="question_type">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                                        <SelectItem value="true_false">True/False</SelectItem>
                                        <SelectItem value="essay">Essay</SelectItem>
                                        <SelectItem value="identification">Identification</SelectItem>
                                    </SelectContent>
                                </Select>
                            </Field>

                            {/* Options (for multiple choice) */}
                            {data.question_type === 'multiple_choice' && (
                                <Field>
                                    <FieldLabel>Options *</FieldLabel>
                                    <div className="space-y-3">
                                        {data.options.map((option, index) => (
                                            <div key={option.key} className="flex gap-2">
                                                <Badge variant="outline" className="h-10 w-10 items-center justify-center">
                                                    {option.key}
                                                </Badge>
                                                <Input
                                                    value={option.text}
                                                    onChange={(e) => handleOptionChange(index, e.target.value)}
                                                    placeholder={`Option ${option.key}`}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </Field>
                            )}

                            {/* Correct Answer */}
                            <Field>
                                <FieldLabel htmlFor="correct_answer">Correct Answer *</FieldLabel>
                                {data.question_type === 'multiple_choice' ? (
                                    <Select
                                        value={data.correct_answer}
                                        onValueChange={(value) => setData('correct_answer', value)}
                                    >
                                        <SelectTrigger id="correct_answer">
                                            <SelectValue placeholder="Select correct answer" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {data.options.map((option) => (
                                                <SelectItem key={option.key} value={option.key}>
                                                    {option.key}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                ) : data.question_type === 'true_false' ? (
                                    <Select
                                        value={data.correct_answer}
                                        onValueChange={(value) => setData('correct_answer', value)}
                                    >
                                        <SelectTrigger id="correct_answer">
                                            <SelectValue placeholder="Select correct answer" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="True">True</SelectItem>
                                            <SelectItem value="False">False</SelectItem>
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <Input
                                        id="correct_answer"
                                        value={data.correct_answer}
                                        onChange={(e) => setData('correct_answer', e.target.value)}
                                        placeholder="Enter correct answer"
                                    />
                                )}
                                {errors.correct_answer && <FieldError>{errors.correct_answer}</FieldError>}
                            </Field>

                            {/* Explanation */}
                            <Field>
                                <FieldLabel htmlFor="explanation">Explanation (Optional)</FieldLabel>
                                <Textarea
                                    id="explanation"
                                    value={data.explanation}
                                    onChange={(e) => setData('explanation', e.target.value)}
                                    rows={3}
                                    placeholder="Explain why this is the correct answer"
                                />
                            </Field>

                            {/* Cognitive Level */}
                            <Field>
                                <FieldLabel htmlFor="cognitive_level">Cognitive Level *</FieldLabel>
                                <Select
                                    value={data.cognitive_level}
                                    onValueChange={(value) => setData('cognitive_level', value)}
                                >
                                    <SelectTrigger id="cognitive_level">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="remembering">Remembering</SelectItem>
                                        <SelectItem value="understanding">Understanding</SelectItem>
                                        <SelectItem value="applying">Applying</SelectItem>
                                        <SelectItem value="analyzing">Analyzing</SelectItem>
                                        <SelectItem value="evaluating">Evaluating</SelectItem>
                                        <SelectItem value="creating">Creating</SelectItem>
                                    </SelectContent>
                                </Select>
                            </Field>

                            {/* Difficulty */}
                            <Field>
                                <FieldLabel htmlFor="difficulty">Difficulty *</FieldLabel>
                                <Select
                                    value={data.difficulty}
                                    onValueChange={(value) => setData('difficulty', value)}
                                >
                                    <SelectTrigger id="difficulty">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="easy">Easy</SelectItem>
                                        <SelectItem value="moderate">Moderate</SelectItem>
                                        <SelectItem value="difficult">Difficult</SelectItem>
                                    </SelectContent>
                                </Select>
                            </Field>

                            <div className="grid gap-4 sm:grid-cols-2">
                                {/* Learning Objective Code */}
                                <Field>
                                    <FieldLabel htmlFor="learning_objective_code">Learning Objective Code</FieldLabel>
                                    <Input
                                        id="learning_objective_code"
                                        value={data.learning_objective_code}
                                        onChange={(e) => setData('learning_objective_code', e.target.value)}
                                        placeholder="e.g., LO-001"
                                    />
                                </Field>

                                {/* Points */}
                                <Field>
                                    <FieldLabel htmlFor="points">Points *</FieldLabel>
                                    <Input
                                        id="points"
                                        type="number"
                                        min="1"
                                        value={data.points}
                                        onChange={(e) => setData('points', parseInt(e.target.value) || 1)}
                                    />
                                </Field>
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-end gap-2 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.visit('/question-bank')}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    <Plus className="mr-2 size-4" />
                                    {processing ? 'Creating...' : 'Create Question'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </AppLayout>
    );
}
