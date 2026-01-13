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
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import { Module } from '@/types/models';
import { Plus, Trash2, AlertCircle, Sparkles, Loader2 } from 'lucide-react';
import PageHeader from '@/components/page-header';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { store } from '@/actions/App/Http/Controllers/TosGenerateController';
import { extractTosFromModule } from '@/actions/App/Http/Controllers/ModuleController';

interface PageProps {
    modules: Module[];
    flash?: {
        tosExtraction?: {
            success: boolean;
            data?: {
                learning_objectives?: Array<{ code: string; description: string }>;
                cognitive_levels?: {
                    remembering?: number;
                    understanding?: number;
                    applying?: number;
                    analyzing?: number;
                    evaluating?: number;
                    creating?: number;
                };
                question_types?: {
                    multiple_choice?: number;
                    true_false?: number;
                    essay?: number;
                    identification?: number;
                };
                recommended_total_items?: number;
                difficulty_level?: string;
                suggested_quarter?: string;
            };
            error?: string;
        };
    };
    [key: string]: unknown;
}

interface LearningObjective {
    code: string;
    description: string;
}

const breadcrumbs = [
    { title: 'Table of Specifications', href: '/tos-generates' },
    { title: 'Create', href: '/tos-generates/create' },
];

export default function TosGenerateCreate({ modules }: PageProps) {
    const { props } = usePage<PageProps>();
    const [objectives, setObjectives] = useState<LearningObjective[]>([
        { code: '', description: '' },
    ]);
    const [isExtracting, setIsExtracting] = useState(false);
    const [selectedModule, setSelectedModule] = useState<Module | null>(null);

    const form = useForm({
        module_id: '',
        grade_level: '',
        subject: '',
        quarter: '',
        total_items: 50,
        learning_objectives: objectives,
        cognitive_levels: {
            remember: 0,
            understand: 0,
            apply: 0,
            analyze: 0,
            evaluate: 0,
            create: 0,
        },
        question_types: {
            multiple_choice: 0,
            true_false: 0,
            essay: 0,
            identification: 0,
        },
        difficulty_level: 'mixed',
        language: 'english',
        additional_instructions: '',
    });

    // Handle flash data from TOS extraction using Inertia
    useEffect(() => {
        const tosExtraction = props.flash?.tosExtraction;
        if (!tosExtraction) return;

        setIsExtracting(false);

        if (tosExtraction.success && tosExtraction.data) {
            const data = tosExtraction.data;

            // Auto-populate learning objectives
            if (data.learning_objectives && data.learning_objectives.length > 0) {
                setObjectives(data.learning_objectives);
            }

            // Auto-populate all fields
            form.setData({
                ...form.data,
                learning_objectives: data.learning_objectives || objectives,
                total_items: data.recommended_total_items || 50,
                cognitive_levels: {
                    remember: data.cognitive_levels?.remembering || 0,
                    understand: data.cognitive_levels?.understanding || 0,
                    apply: data.cognitive_levels?.applying || 0,
                    analyze: data.cognitive_levels?.analyzing || 0,
                    evaluate: data.cognitive_levels?.evaluating || 0,
                    create: data.cognitive_levels?.creating || 0,
                },
                question_types: {
                    multiple_choice: data.question_types?.multiple_choice || 0,
                    true_false: data.question_types?.true_false || 0,
                    essay: data.question_types?.essay || 0,
                    identification: data.question_types?.identification || 0,
                },
                difficulty_level: data.difficulty_level || 'mixed',
                quarter: data.suggested_quarter || form.data.quarter,
            });

            toast.success('Successfully extracted TOS data from PDF!', {
                description: `Auto-populated ${data.learning_objectives?.length || 0} learning objectives.`,
            });
        } else if (tosExtraction.error) {
            toast.error('Failed to extract TOS data', {
                description: tosExtraction.error || 'Could not analyze the PDF file.',
            });
        }
    }, [props.flash?.tosExtraction]);

    const handleModuleChange = (moduleId: string) => {
        const module = modules.find((m) => m.id === Number(moduleId));
        setSelectedModule(module || null);

        if (module) {
            form.setData({
                ...form.data,
                module_id: moduleId,
                grade_level: module.grade_level || '',
                subject: module.subject_area || '',
            });
        } else {
            form.setData('module_id', moduleId);
        }
    };

    const handleAutoFillFromPDF = () => {
        if (!selectedModule || !selectedModule.pdf_file) return;

        setIsExtracting(true);

        // Use Inertia router - the response comes via flash data in useEffect
        router.post(
            extractTosFromModule.url(selectedModule.id),
            {},
            {
                preserveState: true,
                preserveScroll: true,
                onError: () => {
                    setIsExtracting(false);
                    toast.error('Extraction failed', {
                        description: 'An error occurred while analyzing the PDF.',
                    });
                },
            },
        );
    };

    const addObjective = () => {
        const newObjectives = [...objectives, { code: '', description: '' }];
        setObjectives(newObjectives);
        form.setData('learning_objectives', newObjectives);
    };

    const removeObjective = (index: number) => {
        const newObjectives = objectives.filter((_, i) => i !== index);
        setObjectives(newObjectives);
        form.setData('learning_objectives', newObjectives);
    };

    const updateObjective = (index: number, field: keyof LearningObjective, value: string) => {
        const newObjectives = [...objectives];
        newObjectives[index][field] = value;
        setObjectives(newObjectives);
        form.setData('learning_objectives', newObjectives);
    };

    const updateCognitiveLevel = (level: string, value: number) => {
        form.setData('cognitive_levels', {
            ...form.data.cognitive_levels,
            [level]: value,
        });
    };

    const updateQuestionType = (type: string, value: number) => {
        form.setData('question_types', {
            ...form.data.question_types,
            [type]: value,
        });
    };

    const totalCognitiveLevels = Object.values(form.data.cognitive_levels).reduce(
        (sum, val) => sum + val,
        0,
    );

    const totalQuestionTypes = Object.values(form.data.question_types).reduce(
        (sum, val) => sum + val,
        0,
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(store.url());
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Generate Table of Specifications" />

            <div className="p-4 md:p-6 space-y-6">
                <PageHeader
                    title="Generate TOS"
                    description="Create a new table of specifications for exam question generation"
                />

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

                                    {/* Auto-Fill Button - Shows when module with PDF is selected */}
                                    {selectedModule && selectedModule.pdf_file && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={handleAutoFillFromPDF}
                                            disabled={isExtracting}
                                            className="w-full mt-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                                        >
                                            {isExtracting ? (
                                                <>
                                                    <Loader2 className="mr-2 size-4 animate-spin" />
                                                    Analyzing PDF...
                                                </>
                                            ) : (
                                                <>
                                                    <Sparkles className="mr-2 size-4" />
                                                    Auto-Fill from PDF
                                                </>
                                            )}
                                        </Button>
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
                                        <p className="text-sm text-destructive">
                                            {form.errors.quarter}
                                        </p>
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
                                        <p className="text-sm text-destructive">
                                            {form.errors.subject}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="grade_level">Grade Level *</Label>
                                    <Input
                                        id="grade_level"
                                        value={form.data.grade_level}
                                        onChange={(e) =>
                                            form.setData('grade_level', e.target.value)
                                        }
                                        placeholder="e.g., Grade 10"
                                    />
                                    {form.errors.grade_level && (
                                        <p className="text-sm text-destructive">
                                            {form.errors.grade_level}
                                        </p>
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
                                    onChange={(e) =>
                                        form.setData('total_items', parseInt(e.target.value) || 0)
                                    }
                                />
                                {form.errors.total_items && (
                                    <p className="text-sm text-destructive">
                                        {form.errors.total_items}
                                    </p>
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
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={addObjective}
                                >
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
                                            onChange={(e) =>
                                                updateObjective(index, 'code', e.target.value)
                                            }
                                            placeholder="e.g., M10-A1"
                                        />
                                    </div>
                                    <div className="flex-2 space-y-2">
                                        <Label>Description</Label>
                                        <Input
                                            value={objective.description}
                                            onChange={(e) =>
                                                updateObjective(
                                                    index,
                                                    'description',
                                                    e.target.value,
                                                )
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
                                <p className="text-sm text-destructive">
                                    {form.errors.learning_objectives}
                                </p>
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
                                                updateCognitiveLevel(
                                                    level,
                                                    parseInt(e.target.value) || 0,
                                                )
                                            }
                                        />
                                    </div>
                                ))}
                            </div>
                            {totalCognitiveLevels !== form.data.total_items && (
                                <div className="flex items-start gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3">
                                    <AlertCircle className="size-4 text-destructive mt-0.5" />
                                    <p className="text-sm text-destructive">
                                        The sum of cognitive levels ({totalCognitiveLevels}) must
                                        equal the total items ({form.data.total_items})
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Question Configuration */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Question Type Distribution</CardTitle>
                            <CardDescription>
                                Specify the number of questions for each type (must equal total
                                items)
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="multiple_choice">Multiple Choice</Label>
                                    <Input
                                        id="multiple_choice"
                                        type="number"
                                        min="0"
                                        value={form.data.question_types.multiple_choice}
                                        onChange={(e) =>
                                            updateQuestionType(
                                                'multiple_choice',
                                                parseInt(e.target.value) || 0,
                                            )
                                        }
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="true_false">True/False</Label>
                                    <Input
                                        id="true_false"
                                        type="number"
                                        min="0"
                                        value={form.data.question_types.true_false}
                                        onChange={(e) =>
                                            updateQuestionType(
                                                'true_false',
                                                parseInt(e.target.value) || 0,
                                            )
                                        }
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="essay">Essay</Label>
                                    <Input
                                        id="essay"
                                        type="number"
                                        min="0"
                                        value={form.data.question_types.essay}
                                        onChange={(e) =>
                                            updateQuestionType(
                                                'essay',
                                                parseInt(e.target.value) || 0,
                                            )
                                        }
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="identification">Identification</Label>
                                    <Input
                                        id="identification"
                                        type="number"
                                        min="0"
                                        value={form.data.question_types.identification}
                                        onChange={(e) =>
                                            updateQuestionType(
                                                'identification',
                                                parseInt(e.target.value) || 0,
                                            )
                                        }
                                    />
                                </div>
                            </div>

                            <div className="rounded-lg border bg-muted/50 p-3">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-medium">Total Question Types:</span>
                                    <span
                                        className={
                                            totalQuestionTypes !== form.data.total_items
                                                ? 'text-destructive font-semibold'
                                                : 'font-semibold'
                                        }
                                    >
                                        {totalQuestionTypes} / {form.data.total_items}
                                    </span>
                                </div>
                            </div>

                            {totalQuestionTypes !== form.data.total_items && (
                                <div className="flex items-start gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3">
                                    <AlertCircle className="size-4 text-destructive mt-0.5" />
                                    <p className="text-sm text-destructive">
                                        The sum of question types ({totalQuestionTypes}) must equal
                                        the total items ({form.data.total_items})
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Difficulty & Language Configuration */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Additional Configuration</CardTitle>
                            <CardDescription>
                                Configure difficulty level and language
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="difficulty_level">Difficulty Level *</Label>
                                    <Select
                                        value={form.data.difficulty_level}
                                        onValueChange={(value) =>
                                            form.setData('difficulty_level', value)
                                        }
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

                                <div className="space-y-2">
                                    <Label htmlFor="language">Language *</Label>
                                    <Select
                                        value={form.data.language}
                                        onValueChange={(value) => form.setData('language', value)}
                                    >
                                        <SelectTrigger id="language">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="english">English</SelectItem>
                                            <SelectItem value="filipino">Filipino</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {form.errors.language && (
                                        <p className="text-sm text-destructive">
                                            {form.errors.language}
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
                            {form.processing ? 'Creating...' : 'Create TOS'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
