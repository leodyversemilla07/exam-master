import { Head, Link, router } from '@inertiajs/react';
import {
    BookOpen,
    Plus,
    FileText,
    Calculator,
    FolderTree,
    Edit,
    Trash2,
} from 'lucide-react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/page-header';
import AppLayout from '@/layouts/app-layout';
import {
    index,
    create as modulesCreate,
    edit as modulesEdit,
    show as modulesShow,
    destroy as modulesDestroy,
    tosCalculator as modulesTosCalculator,
} from '@/routes/modules';
import { index as topicsIndex } from '@/routes/modules/topics';
import type { Module } from '@/types/models';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Modules', href: index.url() }];

interface PageProps {
    modules: {
        data: (Module & {
            creator?: { name: string };
            tos_generates_count?: number;
            questions_count?: number;
        })[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

export default function ModuleIndex({ modules }: PageProps) {
    const handleDelete = (moduleId: number) => {
        if (
            confirm(
                'Are you sure you want to delete this module? This will also delete all associated topics, questions, and exams.',
            )
        ) {
            router.delete(modulesDestroy.url(moduleId), {
                preserveScroll: true,
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Module Management" />

            <div className="space-y-6 p-4 md:p-6">
                <PageHeader
                    title="Module Management"
                    description="Manage your course modules, topics, and learning objectives"
                    actions={
                        <Button asChild>
                            <Link href={modulesCreate.url()}>
                                <Plus className="mr-2 size-4" />
                                Create Module
                            </Link>
                        </Button>
                    }
                />

                {modules.data.length === 0 ? (
                    <Card>
                        <CardHeader>
                            <CardTitle>No Modules Yet</CardTitle>
                            <CardDescription>
                                Get started by creating your first course
                                module.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Link href={modulesCreate.url()}>
                                <Button>
                                    <Plus className="mr-2 size-4" />
                                    Create Module
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {modules.data.map((module) => (
                                <Card
                                    key={module.id}
                                    className="group relative"
                                >
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="mb-2 flex items-center gap-2">
                                                    <Badge
                                                        variant="outline"
                                                        className="font-mono text-xs"
                                                    >
                                                        {module.code}
                                                    </Badge>
                                                    {!module.is_active && (
                                                        <Badge variant="secondary">
                                                            Inactive
                                                        </Badge>
                                                    )}
                                                </div>
                                                <CardTitle className="text-lg">
                                                    {module.name}
                                                </CardTitle>
                                                <CardDescription className="mt-1 line-clamp-2">
                                                    {module.description ||
                                                        'No description'}
                                                </CardDescription>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {/* Module Info */}
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <div>
                                                <span className="text-muted-foreground">
                                                    Subject:
                                                </span>
                                                <p className="font-medium">
                                                    {module.subject_area}
                                                </p>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">
                                                    Grade Level:
                                                </span>
                                                <p className="font-medium">
                                                    {module.grade_level}
                                                </p>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">
                                                    Curriculum:
                                                </span>
                                                <p className="font-medium">
                                                    {module.curriculum_year}
                                                </p>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">
                                                    Created by:
                                                </span>
                                                <p className="font-medium">
                                                    {module.creator?.name ||
                                                        'Unknown'}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Stats */}
                                        <div className="flex items-center gap-4 border-t pt-2 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <FileText className="size-4" />
                                                <span>
                                                    {module.tos_generates_count ||
                                                        0}{' '}
                                                    TOS
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <BookOpen className="size-4" />
                                                <span>
                                                    {module.questions_count ||
                                                        0}{' '}
                                                    Questions
                                                </span>
                                            </div>
                                        </div>

                                        {/* Quick Actions */}
                                        <div className="grid grid-cols-2 gap-2 border-t pt-2">
                                            <Link
                                                href={topicsIndex.url(
                                                    module.id,
                                                )}
                                            >
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="w-full"
                                                >
                                                    <FolderTree className="mr-2 size-4" />
                                                    Topics
                                                </Button>
                                            </Link>
                                            <Link
                                                href={modulesTosCalculator.url(
                                                    module.id,
                                                )}
                                            >
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="w-full"
                                                >
                                                    <Calculator className="mr-2 size-4" />
                                                    TOS
                                                </Button>
                                            </Link>
                                        </div>

                                        {/* Edit/Delete Actions */}
                                        <div className="flex items-center gap-2 border-t pt-2">
                                            <Link
                                                href={modulesShow.url(
                                                    module.id,
                                                )}
                                                className="flex-1"
                                            >
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="w-full"
                                                >
                                                    View Details
                                                </Button>
                                            </Link>
                                            <Link
                                                href={modulesEdit.url(
                                                    module.id,
                                                )}
                                            >
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                >
                                                    <Edit className="size-4" />
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() =>
                                                    handleDelete(module.id)
                                                }
                                            >
                                                <Trash2 className="size-4 text-destructive" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {/* Pagination */}
                        {modules.last_page > 1 && (
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-muted-foreground">
                                    Showing {modules.data.length} of{' '}
                                    {modules.total} modules
                                </p>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={modules.current_page === 1}
                                        onClick={() =>
                                            router.get(
                                                index.url({
                                                    query: {
                                                        page:
                                                            modules.current_page -
                                                            1,
                                                    },
                                                }),
                                            )
                                        }
                                    >
                                        Previous
                                    </Button>
                                    <span className="text-sm">
                                        Page {modules.current_page} of{' '}
                                        {modules.last_page}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={
                                            modules.current_page ===
                                            modules.last_page
                                        }
                                        onClick={() =>
                                            router.get(
                                                index.url({
                                                    query: {
                                                        page:
                                                            modules.current_page +
                                                            1,
                                                    },
                                                }),
                                            )
                                        }
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </AppLayout>
    );
}
