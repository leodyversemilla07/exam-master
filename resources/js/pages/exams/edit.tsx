import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, router } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';

interface Module {
    id: number;
    code: string;
    name: string;
}

interface Question {
    id: number;
    question: string;
    question_type: string;
    options: Array<{ key: string; text: string }> | null;
    correct_answer: string;
    explanation: string | null;
    cognitive_level: string;
    difficulty: string;
    learning_objective_code: string | null;
    points: number;
    module_id: number;
}

interface PageProps {
    question: Question;
    modules: Module[];
}

export default function ExamEdit({ question, modules }: PageProps) {
    const breadcrumbs = [
        { title: 'Questions', href: '/exams' },
        { title: 'View Question', href: `/exams/${question.id}` },
        { title: 'Edit', href: `/exams/${question.id}/edit` },
    ];
    const { data, setData, put, processing, errors } = useForm({
        module_id: question.module_id,
        question_type: question.question_type,
        question: question.question,
        options: question.options || [
            { key: 'A', text: '' },
            { key: 'B', text: '' },
            { key: 'C', text: '' },
            { key: 'D', text: '' },
        ],
        correct_answer: question.correct_answer,
        explanation: question.explanation || '',
        cognitive_level: question.cognitive_level,
        difficulty: question.difficulty,
        learning_objective_code: question.learning_objective_code || '',
        points: question.points,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/exams/${question.id}`);
    };

    const handleOptionChange = (index: number, text: string) => {
        const newOptions = [...data.options];
        newOptions[index] = { ...newOptions[index], text };
        setData('options', newOptions);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Question" />

            <div className="p-4 md:p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.visit(`/exams/${question.id}`)}
                        >
                            <ArrowLeft className="mr-2 size-4" />
                            Back
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">Edit Question</h1>
                            <p className="text-muted-foreground">
                                Update question details
                            </p>
                        </div>
                    </div>
                </div>

                {/* Edit Form */}
                <form onSubmit={handleSubmit}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Question Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Module Selection */}
                            <div className="space-y-2">
                                <Label htmlFor="module_id">Module</Label>
                                <Select
                                    value={data.module_id.toString()}
                                    onValueChange={(value) => setData('module_id', parseInt(value))}
                                >
                                    <SelectTrigger>
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
                                {errors.module_id && (
                                    <p className="text-sm text-destructive">{errors.module_id}</p>
                                )}
                            </div>

                            {/* Question Text */}
                            <div className="space-y-2">
                                <Label htmlFor="question">Question</Label>
                                <Textarea
                                    id="question"
                                    value={data.question}
                                    onChange={(e) => setData('question', e.target.value)}
                                    rows={4}
                                    placeholder="Enter the question text"
                                />
                                {errors.question && (
                                    <p className="text-sm text-destructive">{errors.question}</p>
                                )}
                            </div>

                            {/* Question Type */}
                            <div className="space-y-2">
                                <Label htmlFor="question_type">Question Type</Label>
                                <Select
                                    value={data.question_type}
                                    onValueChange={(value) => setData('question_type', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                                        <SelectItem value="true_false">True/False</SelectItem>
                                        <SelectItem value="essay">Essay</SelectItem>
                                        <SelectItem value="identification">Identification</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Options (for multiple choice) */}
                            {data.question_type === 'multiple_choice' && (
                                <div className="space-y-4">
                                    <Label>Options</Label>
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
                            )}

                            {/* Correct Answer */}
                            <div className="space-y-2">
                                <Label htmlFor="correct_answer">Correct Answer</Label>
                                {data.question_type === 'multiple_choice' ? (
                                    <Select
                                        value={data.correct_answer}
                                        onValueChange={(value) => setData('correct_answer', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {data.options.map((option) => (
                                                <SelectItem key={option.key} value={option.key}>
                                                    {option.key}
                                                </SelectItem>
                                            ))}
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
                                {errors.correct_answer && (
                                    <p className="text-sm text-destructive">{errors.correct_answer}</p>
                                )}
                            </div>

                            {/* Explanation */}
                            <div className="space-y-2">
                                <Label htmlFor="explanation">Explanation (Optional)</Label>
                                <Textarea
                                    id="explanation"
                                    value={data.explanation}
                                    onChange={(e) => setData('explanation', e.target.value)}
                                    rows={3}
                                    placeholder="Explain why this is the correct answer"
                                />
                            </div>

                            {/* Cognitive Level */}
                            <div className="space-y-2">
                                <Label htmlFor="cognitive_level">Cognitive Level</Label>
                                <Select
                                    value={data.cognitive_level}
                                    onValueChange={(value) => setData('cognitive_level', value)}
                                >
                                    <SelectTrigger>
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
                            </div>

                            {/* Difficulty */}
                            <div className="space-y-2">
                                <Label htmlFor="difficulty">Difficulty</Label>
                                <Select
                                    value={data.difficulty}
                                    onValueChange={(value) => setData('difficulty', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="easy">Easy</SelectItem>
                                        <SelectItem value="moderate">Moderate</SelectItem>
                                        <SelectItem value="difficult">Difficult</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                {/* Learning Objective Code */}
                                <div className="space-y-2">
                                    <Label htmlFor="learning_objective_code">Learning Objective Code</Label>
                                    <Input
                                        id="learning_objective_code"
                                        value={data.learning_objective_code}
                                        onChange={(e) => setData('learning_objective_code', e.target.value)}
                                        placeholder="e.g., LO-001"
                                    />
                                </div>

                                {/* Points */}
                                <div className="space-y-2">
                                    <Label htmlFor="points">Points</Label>
                                    <Input
                                        id="points"
                                        type="number"
                                        min="1"
                                        value={data.points}
                                        onChange={(e) => setData('points', parseInt(e.target.value))}
                                    />
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-end gap-2 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.visit(`/exams/${question.id}`)}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    <Save className="mr-2 size-4" />
                                    {processing ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </AppLayout>
    );
}
