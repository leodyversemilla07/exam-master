import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { Module, TosGenerate } from '@/types/models';
import { Plus, Trash2, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

interface PageProps {
    tosGenerate: TosGenerate & {
        module?: Module;
    };
    modules: Module[];
}

interface LearningObjective {
    code: string;
    description: string;
}

export default function TosGenerateEdit({ tosGenerate, modules }: PageProps) {
    const [objectives, setObjectives] = useState<LearningObjective[]>(
        tosGenerate.learning_objectives || [{ code: '', description: '' }]
    );

    const form = useForm({
        module_id: tosGenerate.module_id?.toString() || '',
        grade_level: tosGenerate.grade_level || '',
        subject: tosGenerate.subject || '',
        quarter: tosGenerate.quarter || '',
        total_items: tosGenerate.total_items || 50,
        learning_objectives: objectives,
        cognitive_levels: tosGenerate.cognitive_levels || {
            remember: 0,
            understand: 0,
            apply: 0,
            analyze: 0,
            evaluate: 0,
            create: 0,
        },
        difficulty_level: tosGenerate.difficulty_level || 'mixed',
        question_type: tosGenerate.question_type || 'multiple_choice',
        additional_instructions: tosGenerate.additional_instructions || '',
    });

    useEffect(() => {
        form.setData('learning_objectives', objectives);
    }, [objectives]);

    const handleModuleChange = (moduleId: string) => {
        const module = modules.find((m) => m.id === Number(moduleId));
        if (module) {
            form.setData({
                ...form.data,
                module_id: moduleId,
                grade_level: module.grade_level || form.data.grade_level,
                subject: module.subject_area || form.data.subject,
            });
        } else {
            form.setData('module_id', moduleId);
        }
    };

    const addObjective = () => {
        setObjectives([...objectives, { code: '', description: '' }]);
    };

    const removeObjective = (index: number) => {
        setObjectives(objectives.filter((_, i) => i !== index));
    };

    const updateObjective = (index: number, field: keyof LearningObjective, value: string) => {
        const newObjectives = [...objectives];
        newObjectives[index][field] = value;
        setObjectives(newObjectives);
    };

    const updateCognitiveLevel = (level: string, value: number) => {
        form.setData('cognitive_levels', {
            ...form.data.cognitive_levels,
            [level]: value,
        });
    };

    const totalCognitiveLevels = Object.values(form.data.cognitive_levels).reduce(
        (sum, val) => sum + val,
        0
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.put(`/tos-generates/${tosGenerate.id}`);
    };

    return (
        <AppLayout>
            <Head title={`Edit TOS: ${tosGenerate.subject}`} />

            <div className="p-4 md:p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Edit TOS</h1>
                        <p className="mt-2 text-muted-foreground">
                            Update table of specifications details
                        </p>
                    </div>
                    <Badge variant="outline" className="font-mono">
                        {tosGenerate.module?.code}
                    </Badge>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Basic Information</CardTitle>
                            <CardDescription>
                                Select the module and provide basic details
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="module_id">Module *</Label>
                                    <Select
                                        value={form.data.module_id}
                                        onValueChange={handleModuleChange}
                                    >
                                        <SelectTrigger id="module_id">
                                            <SelectValue placeholder="Select a module" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {modules.map((module) => (
                                                <SelectItem key={module.id} value={module.id.toString()}>
                                                    {module.code} - {module.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {form.errors.module_id && (
                                        <p className="text-sm text-destructive">{form.errors.module_id}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="quarter">Quarter</Label>
                                    <Input
                                        id="quarter"
                                        value={form.data.quarter}
                                        onChange={(e) => form.setData('quarter', e.target.value)}
                                        placeholder="e.g., 1st Quarter"
                                    />
                                    {form.errors.quarter && (
                                        <p className="text-sm text-destructive">{form.errors.quarter}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="subject">Subject *</Label>
                                    <Input
                                        id="subject"
                                        value={form.data.subject}
                                        onChange={(e) => form.setData('subject', e.target.value)}
                                        placeholder="e.g., Mathematics"
                                    />
                                    {form.errors.subject && (
                                        <p className="text-sm text-destructive">{form.errors.subject}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="grade_level">Grade Level *</Label>
                                    <Input
                                        id="grade_level"
                                        value={form.data.grade_level}
                                        onChange={(e) => form.setData('grade_level', e.target.value)}
                                        placeholder="e.g., Grade 10"
                                    />
                                    {form.errors.grade_level && (
                                        <p className="text-sm text-destructive">{form.errors.grade_level}</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="total_items">Total Items *</Label>
                                <Input
                                    id="total_items"
                                    type="number"
                                    min="1"
                                    max="200"
                                    value={form.data.total_items}
                                    onChange={(e) => form.setData('total_items', parseInt(e.target.value) || 0)}
                                />
                                {form.errors.total_items && (
                                    <p className="text-sm text-destructive">{form.errors.total_items}</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Learning Objectives */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Learning Objectives</CardTitle>
                                    <CardDescription>
                                        Define the learning objectives to assess
                                    </CardDescription>
                                </div>
                                <Button type="button" variant="outline" size="sm" onClick={addObjective}>
                                    <Plus className="mr-2 size-4" />
                                    Add Objective
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {objectives.map((objective, index) => (
                                <div key={index} className="flex gap-4">
                                    <div className="flex-1 space-y-2">
                                        <Label>Code</Label>
                                        <Input
                                            value={objective.code}
                                            onChange={(e) => updateObjective(index, 'code', e.target.value)}
                                            placeholder="e.g., M10-A1"
                                        />
                                    </div>
                                    <div className="flex-2 space-y-2">
                                        <Label>Description</Label>
                                        <Input
                                            value={objective.description}
                                            onChange={(e) =>
                                                updateObjective(index, 'description', e.target.value)
                                            }
                                            placeholder="Describe the learning objective"
                                        />
                                    </div>
                                    {objectives.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeObjective(index)}
                                            className="mt-8"
                                        >
                                            <Trash2 className="size-4 text-destructive" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                            {form.errors.learning_objectives && (
                                <p className="text-sm text-destructive">{form.errors.learning_objectives}</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Cognitive Levels (Bloom's Taxonomy) */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Cognitive Levels Distribution</CardTitle>
                            <CardDescription>
                                Specify the number of items for each Bloom's Taxonomy level
                                {totalCognitiveLevels !== form.data.total_items && (
                                    <span className="ml-2 text-destructive">
                                        (Total: {totalCognitiveLevels}/{form.data.total_items})
                                    </span>
                                )}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {Object.keys(form.data.cognitive_levels).map((level) => (
                                    <div key={level} className="space-y-2">
                                        <Label htmlFor={level} className="capitalize">
                                            {level}
                                        </Label>
                                        <Input
                                            id={level}
                                            type="number"
                                            min="0"
                                            value={
                                                form.data.cognitive_levels[
                                                    level as keyof typeof form.data.cognitive_levels
                                                ]
                                            }
                                            onChange={(e) =>
                                                updateCognitiveLevel(level, parseInt(e.target.value) || 0)
                                            }
                                        />
                                    </div>
                                ))}
                            </div>
                            {totalCognitiveLevels !== form.data.total_items && (
                                <div className="flex items-start gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3">
                                    <AlertCircle className="size-4 text-destructive mt-0.5" />
                                    <p className="text-sm text-destructive">
                                        The sum of cognitive levels ({totalCognitiveLevels}) must equal the
                                        total items ({form.data.total_items})
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Question Configuration */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Question Configuration</CardTitle>
                            <CardDescription>Configure question types and difficulty</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="question_type">Question Type *</Label>
                                    <Select
                                        value={form.data.question_type}
                                        onValueChange={(value) => form.setData('question_type', value as 'multiple_choice' | 'true_false' | 'essay' | 'short_answer')}
                                    >
                                        <SelectTrigger id="question_type">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                                            <SelectItem value="true_false">True/False</SelectItem>
                                            <SelectItem value="essay">Essay</SelectItem>
                                            <SelectItem value="short_answer">Short Answer</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {form.errors.question_type && (
                                        <p className="text-sm text-destructive">{form.errors.question_type}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="difficulty_level">Difficulty Level *</Label>
                                    <Select
                                        value={form.data.difficulty_level}
                                        onValueChange={(value) => form.setData('difficulty_level', value as 'easy' | 'medium' | 'hard' | 'mixed')}
                                    >
                                        <SelectTrigger id="difficulty_level">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="easy">Easy</SelectItem>
                                            <SelectItem value="medium">Medium</SelectItem>
                                            <SelectItem value="hard">Hard</SelectItem>
                                            <SelectItem value="mixed">Mixed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {form.errors.difficulty_level && (
                                        <p className="text-sm text-destructive">
                                            {form.errors.difficulty_level}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="additional_instructions">
                                    Additional Instructions (Optional)
                                </Label>
                                <Textarea
                                    id="additional_instructions"
                                    value={form.data.additional_instructions}
                                    onChange={(e) =>
                                        form.setData('additional_instructions', e.target.value)
                                    }
                                    placeholder="Provide any specific instructions for question generation..."
                                    rows={4}
                                />
                                {form.errors.additional_instructions && (
                                    <p className="text-sm text-destructive">
                                        {form.errors.additional_instructions}
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => window.history.back()}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={
                                form.processing || totalCognitiveLevels !== form.data.total_items
                            }
                        >
                            {form.processing ? 'Updating...' : 'Update TOS'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
