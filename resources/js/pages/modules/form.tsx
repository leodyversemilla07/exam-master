import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { Module } from '@/types/models';

interface Props {
    module?: Module;
}

export default function ModuleForm({ module }: Props) {
    const isEditing = !!module;

    const form = useForm({
        code: module?.code || '',
        name: module?.name || '',
        description: module?.description || '',
        subject_area: module?.subject_area || '',
        grade_level: module?.grade_level || '',
        curriculum_year: module?.curriculum_year || '',
        is_active: module?.is_active ?? true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEditing) {
            form.put(`/modules/${module.id}`, {
                preserveScroll: true,
            });
        } else {
            form.post('/modules', {
                preserveScroll: true,
            });
        }
    };

    return (
        <AppLayout>
            <Head title={isEditing ? `Edit ${module.name}` : 'Create Module'} />

            <div className="p-4 md:p-6 mx-auto max-w-2xl space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        {isEditing ? 'Edit Module' : 'Create Module'}
                    </h1>
                    <p className="mt-2 text-muted-foreground">
                        {isEditing ? 'Update module information' : 'Add a new course module to your system'}
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Module Information</CardTitle>
                            <CardDescription>
                                Enter the details for this course module
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="code">Module Code *</Label>
                                    <Input
                                        id="code"
                                        value={form.data.code}
                                        onChange={(e) => form.setData('code', e.target.value)}
                                        placeholder="e.g., MATH101"
                                        required
                                    />
                                    {form.errors.code && (
                                        <p className="text-sm text-destructive">{form.errors.code}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="curriculum_year">Curriculum Year *</Label>
                                    <Input
                                        id="curriculum_year"
                                        value={form.data.curriculum_year}
                                        onChange={(e) => form.setData('curriculum_year', e.target.value)}
                                        placeholder="e.g., 2023-2024"
                                        required
                                    />
                                    {form.errors.curriculum_year && (
                                        <p className="text-sm text-destructive">{form.errors.curriculum_year}</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="name">Module Name *</Label>
                                <Input
                                    id="name"
                                    value={form.data.name}
                                    onChange={(e) => form.setData('name', e.target.value)}
                                    placeholder="e.g., Introduction to Algebra"
                                    required
                                />
                                {form.errors.name && (
                                    <p className="text-sm text-destructive">{form.errors.name}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={form.data.description}
                                    onChange={(e) => form.setData('description', e.target.value)}
                                    placeholder="Brief description of this module..."
                                    rows={3}
                                />
                                {form.errors.description && (
                                    <p className="text-sm text-destructive">{form.errors.description}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="subject_area">Subject Area *</Label>
                                    <Input
                                        id="subject_area"
                                        value={form.data.subject_area}
                                        onChange={(e) => form.setData('subject_area', e.target.value)}
                                        placeholder="e.g., Mathematics"
                                        required
                                    />
                                    {form.errors.subject_area && (
                                        <p className="text-sm text-destructive">{form.errors.subject_area}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="grade_level">Grade Level *</Label>
                                    <Input
                                        id="grade_level"
                                        value={form.data.grade_level}
                                        onChange={(e) => form.setData('grade_level', e.target.value)}
                                        placeholder="e.g., Grade 10"
                                        required
                                    />
                                    {form.errors.grade_level && (
                                        <p className="text-sm text-destructive">{form.errors.grade_level}</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <Label htmlFor="is_active">Active Status</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Enable this module for use in the system
                                    </p>
                                </div>
                                <Switch
                                    id="is_active"
                                    checked={form.data.is_active}
                                    onCheckedChange={(checked) => form.setData('is_active', checked)}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="mt-6 flex items-center justify-end gap-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => window.history.back()}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={form.processing}>
                            {form.processing ? 'Saving...' : isEditing ? 'Update Module' : 'Create Module'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
