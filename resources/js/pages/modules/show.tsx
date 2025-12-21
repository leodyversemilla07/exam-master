import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Module, TosGenerate } from '@/types/models';
import {
    BookOpen,
    Edit,
    Trash2,
    FolderTree,
    Calculator,
    Search,
    FileText,
    Calendar,
    User,
    Download,
} from 'lucide-react';
import { BreadcrumbItem } from '@/types';

interface PageProps {
    module: Module & {
        creator?: { name: string };
        tos_generates?: TosGenerate[];
        questions_count?: number;
    };
}

export default function ModuleShow({ module }: PageProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Modules', href: '/modules' },
        { title: module.name, href: `/modules/${module.id}` },
    ];
    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this module? This will also delete all associated topics, questions, and exams.')) {
            router.delete(`/modules/${module.id}`, {
                onSuccess: () => router.visit('/modules'),
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={module.name} />

            <div className="p-4 md:p-6 space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline" className="font-mono text-base px-3 py-1">
                                    {module.code}
                                </Badge>
                                {!module.is_active && (
                                    <Badge variant="secondary">Inactive</Badge>
                                )}
                            </div>
                            <h1 className="text-3xl font-bold tracking-tight">{module.name}</h1>
                            {module.description && (
                                <p className="mt-2 text-muted-foreground">{module.description}</p>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link href={`/modules/${module.id}/edit`}>
                            <Button>
                                <Edit className="mr-2 size-4" />
                                Edit Module
                            </Button>
                        </Link>
                        <Button variant="outline" onClick={handleDelete}>
                            <Trash2 className="mr-2 size-4" />
                            Delete
                        </Button>
                    </div>
                </div>

                {/* Module Info Cards */}
                <div className="grid gap-6 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Subject Area</CardTitle>
                            <BookOpen className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">{module.subject_area}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Grade Level</CardTitle>
                            <BookOpen className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">{module.grade_level}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Curriculum Year</CardTitle>
                            <Calendar className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">{module.curriculum_year}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Created By</CardTitle>
                            <User className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-lg font-bold">{module.creator?.name || 'Unknown'}</p>
                        </CardContent>
                    </Card>
                </div>

                {/* PDF File Section */}
                {module.pdf_file && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Module Materials</CardTitle>
                            <CardDescription>
                                Download PDF materials for this module
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <a
                                href={`/storage/${module.pdf_file}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 rounded-lg border p-4 hover:bg-muted/50 transition-colors"
                            >
                                <FileText className="size-8 text-primary" />
                                <div className="flex-1">
                                    <p className="font-medium">{module.pdf_file.split('/').pop()}</p>
                                    <p className="text-sm text-muted-foreground">Module PDF Document</p>
                                </div>
                                <Download className="size-5 text-muted-foreground" />
                            </a>
                        </CardContent>
                    </Card>
                )}

                {/* Quick Access Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Module Tools</CardTitle>
                        <CardDescription>
                            Quick access to module management features
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <Link href={`/modules/${module.id}/topics`}>
                                <Button variant="outline" className="h-auto w-full flex-col items-start gap-2 p-4">
                                    <FolderTree className="size-5" />
                                    <div className="text-left">
                                        <div className="font-semibold">Topics</div>
                                        <div className="text-xs text-muted-foreground">
                                            Manage topics and learning objectives
                                        </div>
                                    </div>
                                </Button>
                            </Link>

                            <Link href={`/modules/${module.id}/tos-calculator`}>
                                <Button variant="outline" className="h-auto w-full flex-col items-start gap-2 p-4">
                                    <Calculator className="size-5" />
                                    <div className="text-left">
                                        <div className="font-semibold">TOS Calculator</div>
                                        <div className="text-xs text-muted-foreground">
                                            View table of specifications matrix
                                        </div>
                                    </div>
                                </Button>
                            </Link>

                            <Link href={`/modules/${module.id}/duplicate-detection`}>
                                <Button variant="outline" className="h-auto w-full flex-col items-start gap-2 p-4">
                                    <Search className="size-5" />
                                    <div className="text-left">
                                        <div className="font-semibold">Duplicate Detection</div>
                                        <div className="text-xs text-muted-foreground">
                                            Find similar questions
                                        </div>
                                    </div>
                                </Button>
                            </Link>

                            <Link href={`/tos-generates?module=${module.id}`}>
                                <Button variant="outline" className="h-auto w-full flex-col items-start gap-2 p-4">
                                    <FileText className="size-5" />
                                    <div className="text-left">
                                        <div className="font-semibold">TOS Generation</div>
                                        <div className="text-xs text-muted-foreground">
                                            Generate test questions
                                        </div>
                                    </div>
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                {/* TOS Generates List */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>TOS Generations</CardTitle>
                                <CardDescription>
                                    Recent table of specifications generated for this module
                                </CardDescription>
                            </div>
                            <Link href={`/tos-generates/create?module=${module.id}`}>
                                <Button size="sm">Generate TOS</Button>
                            </Link>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {module.tos_generates && module.tos_generates.length > 0 ? (
                            <div className="space-y-2">
                                {module.tos_generates.slice(0, 5).map((tos) => (
                                    <Link
                                        key={tos.id}
                                        href={`/tos-generates/${tos.id}`}
                                        className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <FileText className="size-5 text-muted-foreground" />
                                            <div>
                                                <div className="font-medium">
                                                    {tos.subject} - {tos.grade_level}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {tos.total_items} items • {tos.difficulty_level}
                                                </div>
                                            </div>
                                        </div>
                                        <Badge variant={tos.status === 'completed' ? 'default' : 'secondary'}>
                                            {tos.status}
                                        </Badge>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                <p>No TOS generations yet.</p>
                                <Link href={`/tos-generates/create?module=${module.id}`}>
                                    <Button variant="outline" size="sm" className="mt-4">
                                        Generate Your First TOS
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
