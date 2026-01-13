import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { PageProps } from '@/types';
import { Module, Topic, LearningObjective, CognitiveLevel } from '@/types/models';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Plus, Edit2, Trash2, GripVertical } from 'lucide-react';
import { store, update, destroy } from '@/actions/App/Http/Controllers/LearningObjectiveController';
import { useState } from 'react';
import PageHeader from '@/components/page-header';

interface Props extends PageProps {
    module: Module;
    topic: Topic;
    objectives: LearningObjective[];
}

const cognitiveLevels: {
    value: CognitiveLevel;
    label: string;
    description: string;
    color: string;
}[] = [
    {
        value: 'remembering',
        label: 'Remembering',
        description: 'Recall facts and basic concepts',
        color: 'bg-primary/10 text-primary border border-primary/20',
    },
    {
        value: 'understanding',
        label: 'Understanding',
        description: 'Explain ideas or concepts',
        color: 'bg-success/10 text-success border border-success/20',
    },
    {
        value: 'applying',
        label: 'Applying',
        description: 'Use information in new situations',
        color: 'bg-warning/10 text-warning border border-warning/20',
    },
    {
        value: 'analyzing',
        label: 'Analyzing',
        description: 'Draw connections among ideas',
        color: 'bg-info/10 text-info border border-info/20',
    },
    {
        value: 'evaluating',
        label: 'Evaluating',
        description: 'Justify decisions or course of action',
        color: 'bg-secondary/10 text-secondary border border-secondary/20',
    },
    {
        value: 'creating',
        label: 'Creating',
        description: 'Produce new or original work',
        color: 'bg-destructive/10 text-destructive border border-destructive/20',
    },
];

export default function LearningObjectivesIndex({ module, topic, objectives }: Props) {
    const [editingId, setEditingId] = useState<number | null>(null);
    const [showForm, setShowForm] = useState(false);

    const form = useForm({
        code: '',
        objective: '',
        cognitive_level: 'remembering' as CognitiveLevel,
        assessment_criteria: '',
        is_active: true,
    });

    const breadcrumbs = [
        { title: 'Modules', href: '/modules' },
        { title: module.name, href: `/modules/${module.id}` },
        { title: 'Topics', href: `/modules/${module.id}/topics` },
        { title: topic.title, href: `/modules/${module.id}/topics/${topic.id}` },
        { title: 'Learning Objectives', href: '#' },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingId) {
            form.put(update.url({ module: module.id, topic: topic.id, objective: editingId }), {
                preserveScroll: true,
                onSuccess: () => {
                    form.reset();
                    setEditingId(null);
                    setShowForm(false);
                },
            });
        } else {
            form.post(store.url({ module: module.id, topic: topic.id }), {
                preserveScroll: true,
                onSuccess: () => {
                    form.reset();
                    setShowForm(false);
                },
            });
        }
    };

    const handleEdit = (objective: LearningObjective) => {
        form.setData({
            code: objective.code,
            objective: objective.objective,
            cognitive_level: objective.cognitive_level,
            assessment_criteria: objective.assessment_criteria || '',
            is_active: objective.is_active,
        });
        setEditingId(objective.id);
        setShowForm(true);
    };

    const handleDelete = (objectiveId: number) => {
        if (confirm('Are you sure you want to delete this learning objective?')) {
            form.delete(
                destroy.url({ module: module.id, topic: topic.id, objective: objectiveId }),
                {
                    preserveScroll: true,
                },
            );
        }
    };

    const handleCancel = () => {
        form.reset();
        setEditingId(null);
        setShowForm(false);
    };

    const getLevelColor = (level: CognitiveLevel) => {
        return cognitiveLevels.find((l) => l.value === level)?.color || '';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Learning Objectives - ${topic.title}`} />

            <div className="p-4 md:p-6 space-y-6">
                <PageHeader
                    title="Learning Objectives"
                    description={`Manage learning outcomes for ${topic.title} using Bloom's Taxonomy`}
                    actions={
                        !showForm ? (
                            <Button onClick={() => setShowForm(true)}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Objective
                            </Button>
                        ) : undefined
                    }
                />

                {showForm && (
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                {editingId ? 'Edit' : 'Create'} Learning Objective
                            </CardTitle>
                            <CardDescription>
                                Define what students should know or be able to do after learning
                                this topic
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="code">Code *</Label>
                                        <Input
                                            id="code"
                                            value={form.data.code}
                                            onChange={(e) => form.setData('code', e.target.value)}
                                            placeholder="e.g., LO1, LO2.1"
                                            required
                                        />
                                        {form.errors.code && (
                                            <p className="text-sm text-destructive">
                                                {form.errors.code}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="cognitive_level">Cognitive Level *</Label>
                                        <Select
                                            value={form.data.cognitive_level}
                                            onValueChange={(value) =>
                                                form.setData(
                                                    'cognitive_level',
                                                    value as CognitiveLevel,
                                                )
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {cognitiveLevels.map((level) => (
                                                    <SelectItem
                                                        key={level.value}
                                                        value={level.value}
                                                    >
                                                        <div className="flex flex-col">
                                                            <span className="font-medium">
                                                                {level.label}
                                                            </span>
                                                            <span className="text-xs text-muted-foreground">
                                                                {level.description}
                                                            </span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="objective">Learning Objective *</Label>
                                    <Textarea
                                        id="objective"
                                        value={form.data.objective}
                                        onChange={(e) => form.setData('objective', e.target.value)}
                                        placeholder="Students will be able to..."
                                        rows={3}
                                        required
                                    />
                                    {form.errors.objective && (
                                        <p className="text-sm text-destructive">
                                            {form.errors.objective}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="assessment_criteria">Assessment Criteria</Label>
                                    <Textarea
                                        id="assessment_criteria"
                                        value={form.data.assessment_criteria}
                                        onChange={(e) =>
                                            form.setData('assessment_criteria', e.target.value)
                                        }
                                        placeholder="How will this objective be assessed?"
                                        rows={2}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Define how students will demonstrate mastery of this
                                        objective
                                    </p>
                                </div>

                                <div className="flex items-center justify-end gap-2">
                                    <Button type="button" variant="outline" onClick={handleCancel}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={form.processing}>
                                        {form.processing
                                            ? 'Saving...'
                                            : editingId
                                              ? 'Update'
                                              : 'Create'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}

                {objectives.length === 0 ? (
                    <Card>
                        <CardHeader>
                            <CardTitle>No Learning Objectives Yet</CardTitle>
                            <CardDescription>
                                Get started by creating your first learning objective for this
                                topic.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button onClick={() => setShowForm(true)}>
                                <Plus className="mr-2 h-4 w-4" />
                                Create Learning Objective
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        {objectives.map((objective) => (
                            <Card key={objective.id} className="group">
                                <CardContent className="p-4">
                                    <div className="flex items-start gap-4">
                                        <div className="flex items-center gap-2 text-muted-foreground cursor-move">
                                            <GripVertical className="h-4 w-4" />
                                        </div>

                                        <div className="flex-1 space-y-2">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <Badge variant="outline" className="font-mono">
                                                        {objective.code}
                                                    </Badge>
                                                    <Badge
                                                        className={getLevelColor(
                                                            objective.cognitive_level,
                                                        )}
                                                    >
                                                        {cognitiveLevels.find(
                                                            (l) =>
                                                                l.value ===
                                                                objective.cognitive_level,
                                                        )?.label || objective.cognitive_level}
                                                    </Badge>
                                                    {!objective.is_active && (
                                                        <Badge variant="secondary">Inactive</Badge>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleEdit(objective)}
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDelete(objective.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </div>
                                            </div>

                                            <p className="text-sm font-medium">
                                                {objective.objective}
                                            </p>

                                            {objective.assessment_criteria && (
                                                <div className="pt-2 border-t">
                                                    <p className="text-xs text-muted-foreground font-semibold mb-1">
                                                        Assessment Criteria:
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {objective.assessment_criteria}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                <Card className="bg-muted/50">
                    <CardHeader>
                        <CardTitle className="text-sm">Bloom's Taxonomy Reference</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                            {cognitiveLevels.map((level) => (
                                <div key={level.value} className="flex items-start gap-2">
                                    <Badge className={level.color}>{level.label}</Badge>
                                    <p className="text-xs text-muted-foreground">
                                        {level.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
