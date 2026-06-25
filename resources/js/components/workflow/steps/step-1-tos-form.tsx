import { AlertCircle, Plus, Trash2, Sparkles, Loader2 } from 'lucide-react';
import { useForm, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
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
import type { Module, TosGenerate, ExamQuestion } from '@/types/models';
import { store } from '@/actions/App/Http/Controllers/TosGenerateController';
import { extractTosFromModule } from '@/actions/App/Http/Controllers/ModuleController';

interface LearningObjective {
    code: string;
    description: string;
}

interface FlashProps {
    flash?: {
        tosExtraction?: {
            success: boolean;
            data?: {
                learning_objectives?: Array<{
                    code: string;
                    description: string;
                }>;
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

interface Props {
    module: Module;
    existingTos?: (TosGenerate & { questions: ExamQuestion[] }) | null;
    onCreated: (tos: TosGenerate) => void;
}

export default function Step1TosForm({ module, onCreated }: Props) {
    const { props } = usePage<FlashProps>();
    const [objectives, setObjectives] = useState<LearningObjective[]>([
        { code: '', description: '' },
    ]);
    const [isExtracting, setIsExtracting] = useState(false);

    const form = useForm({
        module_id: module.id.toString(),
        grade_level: module.grade_level || '',
        subject: module.subject_area || '',
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

    // Handle TOS extraction flash data
     
    useEffect(() => {
        const tosExtraction = props.flash?.tosExtraction;

        if (!tosExtraction) {
            return;
        }

        // Resetting after flash data arrives is intentional — it synchronizes
        // server-side extraction completion with local loading state.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsExtracting(false);

        if (tosExtraction.success && tosExtraction.data) {
            const data = tosExtraction.data;

            if (
                data.learning_objectives &&
                data.learning_objectives.length > 0
            ) {
                setObjectives(data.learning_objectives);
            }

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
                description:
                    tosExtraction.error || 'Could not analyze the PDF file.',
            });
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.flash?.tosExtraction, objectives]);

    const handleAutoFillFromPDF = () => {
        if (!module.pdf_file) {
            return;
        }

        setIsExtracting(true);

        router.post(
            extractTosFromModule.url(module.id),
            {},
            {
                preserveState: true,
                preserveScroll: true,
                onError: () => {
                    setIsExtracting(false);
                    toast.error('Extraction failed', {
                        description:
                            'An error occurred while analyzing the PDF.',
                    });
                },
            },
        );
    };

    const addObjective = () => {
        const updated = [...objectives, { code: '', description: '' }];
        setObjectives(updated);
        form.setData('learning_objectives', updated);
    };

    const removeObjective = (index: number) => {
        const updated = objectives.filter((_, i) => i !== index);
        setObjectives(updated);
        form.setData('learning_objectives', updated);
    };

    const updateObjective = (
        index: number,
        field: keyof LearningObjective,
        value: string,
    ) => {
        const updated = [...objectives];
        updated[index][field] = value;
        setObjectives(updated);
        form.setData('learning_objectives', updated);
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

    const totalCognitiveLevels = Object.values(
        form.data.cognitive_levels,
    ).reduce((s, v) => s + v, 0);
    const totalQuestionTypes = Object.values(form.data.question_types).reduce(
        (s, v) => s + v,
        0,
    );
    const isValid =
        totalCognitiveLevels === form.data.total_items &&
        totalQuestionTypes === form.data.total_items;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(store.url(), {
            preserveScroll: true,
            onSuccess: (page) => {
                // The controller redirects to the TOS show page on success.
                // We extract the created TOS from the flash or page props.
                const tos = (page.props as Record<string, unknown>)
                    .tosGenerate as TosGenerate | undefined;

                if (tos) {
                    onCreated(tos);
                }
            },
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* PDF Auto-fill banner */}
            {module.pdf_file && (
                <div className="flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
                    <div>
                        <p className="text-sm font-medium">PDF available</p>
                        <p className="text-xs text-muted-foreground">
                            Auto-fill the TOS fields from your uploaded module
                            PDF using AI.
                        </p>
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAutoFillFromPDF}
                        disabled={isExtracting}
                        className="shrink-0 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                    >
                        {isExtracting ? (
                            <>
                                <Loader2 className="mr-2 size-4 animate-spin" />
                                Analyzing...
                            </>
                        ) : (
                            <>
                                <Sparkles className="mr-2 size-4" />
                                Auto-Fill from PDF
                            </>
                        )}
                    </Button>
                </div>
            )}

            {/* Basic Info */}
            <div className="space-y-4">
                <h3 className="text-sm font-semibold">Basic Information</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="wf-subject">Subject *</Label>
                        <Input
                            id="wf-subject"
                            value={form.data.subject}
                            onChange={(e) =>
                                form.setData('subject', e.target.value)
                            }
                            placeholder="e.g., Mathematics"
                        />
                        {form.errors.subject && (
                            <p className="text-sm text-destructive">
                                {form.errors.subject}
                            </p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="wf-grade_level">Grade Level *</Label>
                        <Input
                            id="wf-grade_level"
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
                    <div className="space-y-2">
                        <Label htmlFor="wf-quarter">Quarter</Label>
                        <Input
                            id="wf-quarter"
                            value={form.data.quarter}
                            onChange={(e) =>
                                form.setData('quarter', e.target.value)
                            }
                            placeholder="e.g., 1st Quarter"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="wf-total_items">Total Items *</Label>
                        <Input
                            id="wf-total_items"
                            type="number"
                            min="1"
                            max="200"
                            value={form.data.total_items}
                            onChange={(e) =>
                                form.setData(
                                    'total_items',
                                    parseInt(e.target.value) || 0,
                                )
                            }
                        />
                        {form.errors.total_items && (
                            <p className="text-sm text-destructive">
                                {form.errors.total_items}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Learning Objectives */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold">
                        Learning Objectives
                    </h3>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addObjective}
                    >
                        <Plus className="mr-1.5 size-3.5" />
                        Add
                    </Button>
                </div>
                {objectives.map((objective, index) => (
                    <div key={index} className="flex items-start gap-3">
                        <div className="w-28 shrink-0 space-y-1">
                            <Label className="text-xs">Code</Label>
                            <Input
                                value={objective.code}
                                onChange={(e) =>
                                    updateObjective(
                                        index,
                                        'code',
                                        e.target.value,
                                    )
                                }
                                placeholder="M10-A1"
                                className="h-8 text-sm"
                            />
                        </div>
                        <div className="flex-1 space-y-1">
                            <Label className="text-xs">Description</Label>
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
                                className="h-8 text-sm"
                            />
                        </div>
                        {objectives.length > 1 && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeObjective(index)}
                                className="mt-5 size-8 shrink-0"
                            >
                                <Trash2 className="size-3.5 text-destructive" />
                            </Button>
                        )}
                    </div>
                ))}
            </div>

            {/* Cognitive Levels */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold">
                        Cognitive Levels (Bloom's Taxonomy)
                    </h3>
                    <span
                        className={`text-xs font-medium ${totalCognitiveLevels !== form.data.total_items ? 'text-destructive' : 'text-success'}`}
                    >
                        {totalCognitiveLevels} / {form.data.total_items}
                    </span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                    {Object.keys(form.data.cognitive_levels).map((level) => (
                        <div key={level} className="space-y-1">
                            <Label
                                htmlFor={`wf-cog-${level}`}
                                className="text-xs capitalize"
                            >
                                {level}
                            </Label>
                            <Input
                                id={`wf-cog-${level}`}
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
                                className="h-8 text-sm"
                            />
                        </div>
                    ))}
                </div>
                {totalCognitiveLevels !== form.data.total_items && (
                    <div className="flex items-start gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3">
                        <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
                        <p className="text-sm text-destructive">
                            Sum ({totalCognitiveLevels}) must equal total items
                            ({form.data.total_items})
                        </p>
                    </div>
                )}
            </div>

            {/* Question Types */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold">
                        Question Type Distribution
                    </h3>
                    <span
                        className={`text-xs font-medium ${totalQuestionTypes !== form.data.total_items ? 'text-destructive' : 'text-success'}`}
                    >
                        {totalQuestionTypes} / {form.data.total_items}
                    </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    {Object.keys(form.data.question_types).map((type) => (
                        <div key={type} className="space-y-1">
                            <Label
                                htmlFor={`wf-qt-${type}`}
                                className="text-xs capitalize"
                            >
                                {type.replace('_', ' ')}
                            </Label>
                            <Input
                                id={`wf-qt-${type}`}
                                type="number"
                                min="0"
                                value={
                                    form.data.question_types[
                                        type as keyof typeof form.data.question_types
                                    ]
                                }
                                onChange={(e) =>
                                    updateQuestionType(
                                        type,
                                        parseInt(e.target.value) || 0,
                                    )
                                }
                                className="h-8 text-sm"
                            />
                        </div>
                    ))}
                </div>
                {totalQuestionTypes !== form.data.total_items && (
                    <div className="flex items-start gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3">
                        <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
                        <p className="text-sm text-destructive">
                            Sum ({totalQuestionTypes}) must equal total items (
                            {form.data.total_items})
                        </p>
                    </div>
                )}
            </div>

            {/* Difficulty & Language */}
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label>Difficulty Level *</Label>
                    <Select
                        value={form.data.difficulty_level}
                        onValueChange={(value) =>
                            form.setData('difficulty_level', value ?? '')
                        }
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="easy">Easy</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="hard">Hard</SelectItem>
                            <SelectItem value="mixed">Mixed</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Language *</Label>
                    <Select
                        value={form.data.language}
                        onValueChange={(value) =>
                            form.setData('language', value ?? '')
                        }
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="english">English</SelectItem>
                            <SelectItem value="filipino">Filipino</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Additional Instructions */}
            <div className="space-y-2">
                <Label htmlFor="wf-instructions">
                    Additional Instructions (Optional)
                </Label>
                <Textarea
                    id="wf-instructions"
                    value={form.data.additional_instructions}
                    onChange={(e) =>
                        form.setData('additional_instructions', e.target.value)
                    }
                    placeholder="Provide specific instructions for question generation..."
                    rows={3}
                />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
                <Button type="submit" disabled={form.processing || !isValid}>
                    {form.processing ? (
                        <>
                            <Loader2 className="mr-2 size-4 animate-spin" />
                            Creating TOS...
                        </>
                    ) : (
                        <>
                            <Sparkles className="mr-2 size-4" />
                            Create TOS & Generate Questions
                        </>
                    )}
                </Button>
            </div>
        </form>
    );
}
