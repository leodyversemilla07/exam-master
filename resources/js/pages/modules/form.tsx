import { Head, useForm, router } from '@inertiajs/react';
import {
    FileText,
    X,
    Sparkles,
    Loader2,
    CheckCircle2,
    AlertCircle,
    Upload,
} from 'lucide-react';
import { useState, useRef } from 'react';
import axios from 'axios';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import type { Module } from '@/types/models';
import PageHeader from '@/components/page-header';
import {
    store,
    update,
    edit,
    extractFromPdf,
} from '@/actions/App/Http/Controllers/ModuleController';
import {
    Empty,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
    EmptyDescription,
    EmptyContent,
} from '@/components/ui/empty';

interface ExtractedTopic {
    title: string;
    description?: string;
    learning_objectives?: string[];
}

interface ExtractedData {
    name: string;
    code: string;
    description: string;
    subject_area: string;
    grade_level: string;
    curriculum_year: string;
    topics?: ExtractedTopic[];
}

interface Props {
    module?: Module;
}

export default function ModuleForm({ module }: Props) {
    const isEditing = !!module;

    const [fileName, setFileName] = useState<string | null>(null);
    const [isExtracting, setIsExtracting] = useState(false);
    const [extractionResult, setExtractionResult] = useState<{
        success: boolean;
        message: string;
        topics?: ExtractedTopic[];
    } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const form = useForm({
        code: module?.code || '',
        name: module?.name || '',
        description: module?.description || '',
        pdf_file: null as File | null,
        subject_area: module?.subject_area || '',
        grade_level: module?.grade_level || '',
        curriculum_year: module?.curriculum_year || '',
        is_active: module?.is_active ?? true,
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (file) {
            form.setData('pdf_file', file);
            setFileName(file.name);
            setExtractionResult(null); // Clear previous extraction result
        }
    };

    const removeFile = () => {
        form.setData('pdf_file', null);
        setFileName(null);
        setExtractionResult(null);
    };

    const handleExtractFromPdf = async () => {
        if (!form.data.pdf_file) {
            return;
        }

        setIsExtracting(true);
        setExtractionResult(null);

        try {
            const formData = new FormData();
            formData.append('pdf', form.data.pdf_file);

            const response = await axios.post(extractFromPdf.url(), formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.success && response.data.data) {
                const extracted: ExtractedData = response.data.data;

                // Auto-populate form fields
                if (extracted.name) {
                    form.setData('name', extracted.name);
                }

                if (extracted.code) {
                    form.setData('code', extracted.code);
                }

                if (extracted.description) {
                    form.setData('description', extracted.description);
                }

                if (extracted.subject_area) {
                    form.setData('subject_area', extracted.subject_area);
                }

                if (extracted.grade_level) {
                    form.setData('grade_level', extracted.grade_level);
                }

                if (extracted.curriculum_year) {
                    form.setData('curriculum_year', extracted.curriculum_year);
                }

                // Count what was populated
                const populated = [
                    extracted.name && 'Module Name',
                    extracted.code && 'Code',
                    extracted.description && 'Description',
                    extracted.subject_area && 'Subject Area',
                    extracted.grade_level && 'Grade Level',
                    extracted.curriculum_year && 'Curriculum Year',
                ].filter(Boolean);

                setExtractionResult({
                    success: true,
                    message: `Successfully extracted ${populated.length} fields: ${populated.join(', ')}`,
                    topics: extracted.topics,
                });
            } else {
                setExtractionResult({
                    success: false,
                    message:
                        response.data.error ||
                        'Failed to extract information from PDF',
                });
            }
        } catch (error: unknown) {
            const errorMessage = axios.isAxiosError(error)
                ? error.response?.data?.message || error.message
                : 'An error occurred while analyzing the PDF';
            setExtractionResult({
                success: false,
                message: errorMessage,
            });
        } finally {
            setIsExtracting(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEditing) {
            // Use POST with _method spoofing for file uploads (Laravel convention)
            router.post(
                update.url(module.id),
                {
                    ...form.data,
                    _method: 'put',
                },
                {
                    forceFormData: true,
                    preserveScroll: true,
                },
            );
        } else {
            form.post(store.url(), {
                forceFormData: true,
                preserveScroll: true,
            });
        }
    };

    return (
        <>
            <Head title={isEditing ? `Edit ${module.name}` : 'Create Module'} />

            <div className="mx-auto max-w-2xl space-y-6 p-4 md:p-6">
                <PageHeader
                    title={isEditing ? 'Edit Module' : 'Create Module'}
                    description={
                        isEditing
                            ? 'Update module information'
                            : 'Add a new course module to your system'
                    }
                />

                <form onSubmit={handleSubmit}>
                    {/* PDF Upload with AI Extraction - Show first for new modules */}
                    {!isEditing && (
                        <div className="mb-6">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".pdf"
                                onChange={handleFileChange}
                                className="hidden"
                            />

                            {!fileName ? (
                                <Empty
                                    className="cursor-pointer border-2 border-dashed border-primary/20 bg-primary/5 transition-colors hover:border-primary/40"
                                    onClick={() =>
                                        fileInputRef.current?.click()
                                    }
                                >
                                    <EmptyHeader>
                                        <EmptyMedia variant="icon">
                                            <Upload className="size-5" />
                                        </EmptyMedia>
                                        <EmptyTitle className="flex items-center gap-2">
                                            <Sparkles className="size-4 text-primary" />
                                            AI-Powered Auto-Fill
                                        </EmptyTitle>
                                        <EmptyDescription>
                                            Upload a curriculum PDF and let AI
                                            extract module information
                                            automatically
                                        </EmptyDescription>
                                    </EmptyHeader>
                                    <EmptyContent>
                                        <Button type="button" variant="outline">
                                            <Upload className="mr-2 size-4" />
                                            Choose PDF File
                                        </Button>
                                        <p className="text-xs text-muted-foreground">
                                            PDF files up to 10MB
                                        </p>
                                    </EmptyContent>
                                </Empty>
                            ) : (
                                <Card className="border-2 border-primary/20 bg-primary/5">
                                    <CardContent className="space-y-4 pt-6">
                                        <div className="flex items-center gap-3 rounded-lg border bg-background p-4">
                                            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                                                <FileText className="size-5 text-muted-foreground" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium">
                                                    {fileName}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    PDF Document
                                                </p>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={removeFile}
                                                className="size-8 p-0"
                                            >
                                                <X className="size-4" />
                                            </Button>
                                        </div>

                                        <Button
                                            type="button"
                                            onClick={handleExtractFromPdf}
                                            disabled={isExtracting}
                                            className="w-full"
                                        >
                                            {isExtracting ? (
                                                <>
                                                    <Loader2 className="mr-2 size-4 animate-spin" />
                                                    Analyzing PDF...
                                                </>
                                            ) : (
                                                <>
                                                    <Sparkles className="mr-2 size-4" />
                                                    Analyze & Auto-Fill
                                                </>
                                            )}
                                        </Button>

                                        {extractionResult && (
                                            <div
                                                className={`rounded-lg p-3 ${
                                                    extractionResult.success
                                                        ? 'border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950'
                                                        : 'border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950'
                                                }`}
                                            >
                                                <div className="flex items-start gap-2">
                                                    {extractionResult.success ? (
                                                        <CheckCircle2 className="mt-0.5 size-5 text-green-600 dark:text-green-400" />
                                                    ) : (
                                                        <AlertCircle className="mt-0.5 size-5 text-red-600 dark:text-red-400" />
                                                    )}
                                                    <div className="flex-1">
                                                        <p
                                                            className={`text-sm font-medium ${
                                                                extractionResult.success
                                                                    ? 'text-green-800 dark:text-green-200'
                                                                    : 'text-red-800 dark:text-red-200'
                                                            }`}
                                                        >
                                                            {
                                                                extractionResult.message
                                                            }
                                                        </p>
                                                        {extractionResult.topics &&
                                                            extractionResult
                                                                .topics.length >
                                                                0 && (
                                                                <p className="mt-1 text-xs text-green-700 dark:text-green-300">
                                                                    {
                                                                        extractionResult
                                                                            .topics
                                                                            .length
                                                                    }{' '}
                                                                    topics
                                                                    detected
                                                                    (can be
                                                                    added after
                                                                    module
                                                                    creation)
                                                                </p>
                                                            )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    )}

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
                                        onChange={(e) =>
                                            form.setData('code', e.target.value)
                                        }
                                        placeholder="e.g., MATH101"
                                        required
                                    />
                                    {form.errors.code && (
                                        <p className="text-sm text-destructive">
                                            {form.errors.code}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="curriculum_year">
                                        Curriculum Year *
                                    </Label>
                                    <Input
                                        id="curriculum_year"
                                        value={form.data.curriculum_year}
                                        onChange={(e) =>
                                            form.setData(
                                                'curriculum_year',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="e.g., 2023-2024"
                                        required
                                    />
                                    {form.errors.curriculum_year && (
                                        <p className="text-sm text-destructive">
                                            {form.errors.curriculum_year}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="name">Module Name *</Label>
                                <Input
                                    id="name"
                                    value={form.data.name}
                                    onChange={(e) =>
                                        form.setData('name', e.target.value)
                                    }
                                    placeholder="e.g., Introduction to Algebra"
                                    required
                                />
                                {form.errors.name && (
                                    <p className="text-sm text-destructive">
                                        {form.errors.name}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={form.data.description}
                                    onChange={(e) =>
                                        form.setData(
                                            'description',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Brief description of this module..."
                                    rows={3}
                                />
                                {form.errors.description && (
                                    <p className="text-sm text-destructive">
                                        {form.errors.description}
                                    </p>
                                )}
                            </div>

                            {/* PDF upload for editing mode */}
                            {isEditing && (
                                <div className="space-y-2">
                                    <Label htmlFor="pdf_file">
                                        Module PDF (Optional)
                                    </Label>
                                    <div className="space-y-2">
                                        {(fileName || module?.pdf_file) && (
                                            <div className="flex items-center gap-2 rounded-lg border bg-muted/50 p-3">
                                                <FileText className="size-5 text-muted-foreground" />
                                                <span className="flex-1 truncate text-sm font-medium">
                                                    {fileName ||
                                                        (module?.pdf_file
                                                            ? module.pdf_file
                                                                  .split('/')
                                                                  .pop()
                                                            : '')}
                                                </span>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={removeFile}
                                                    className="size-8 p-0"
                                                >
                                                    <X className="size-4" />
                                                </Button>
                                            </div>
                                        )}
                                        <Input
                                            id="pdf_file"
                                            type="file"
                                            accept=".pdf"
                                            onChange={handleFileChange}
                                            className="cursor-pointer"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Upload a PDF file of the module
                                            content (max 10MB)
                                        </p>
                                        {form.errors.pdf_file && (
                                            <p className="text-sm text-destructive">
                                                {form.errors.pdf_file}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="subject_area">
                                        Subject Area *
                                    </Label>
                                    <Input
                                        id="subject_area"
                                        value={form.data.subject_area}
                                        onChange={(e) =>
                                            form.setData(
                                                'subject_area',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="e.g., Mathematics"
                                        required
                                    />
                                    {form.errors.subject_area && (
                                        <p className="text-sm text-destructive">
                                            {form.errors.subject_area}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="grade_level">
                                        Grade Level *
                                    </Label>
                                    <Input
                                        id="grade_level"
                                        value={form.data.grade_level}
                                        onChange={(e) =>
                                            form.setData(
                                                'grade_level',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="e.g., Grade 10"
                                        required
                                    />
                                    {form.errors.grade_level && (
                                        <p className="text-sm text-destructive">
                                            {form.errors.grade_level}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <Label htmlFor="is_active">
                                        Active Status
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                        Enable this module for use in the system
                                    </p>
                                </div>
                                <Switch
                                    id="is_active"
                                    checked={form.data.is_active}
                                    onCheckedChange={(checked) =>
                                        form.setData('is_active', checked)
                                    }
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
                            {form.processing
                                ? 'Saving...'
                                : isEditing
                                  ? 'Update Module'
                                  : 'Create Module'}
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}

ModuleForm.layout = (page: Props) => ({
    breadcrumbs: [
        { title: 'Modules', href: '/modules' },
        {
            title: page.module ? 'Edit Module' : 'Create Module',
            href: page.module ? edit.url(page.module.id) : '/modules/create',
        },
    ],
});
