import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { BreadcrumbItem } from '@/types';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import examTemplates from '@/routes/exam-templates';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Exam Templates', href: examTemplates.index.url() },
];

interface ExamTemplate {
    id: number;
    name: string;
    created_at: string;
}

interface PageProps {
    templates: ExamTemplate[];
}

export default function Index({ templates }: PageProps) {
    const handleDelete = (id: number) => {
        router.delete(examTemplates.destroy.url(id));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Exam Templates" />

            <div className="p-4 md:p-6">
                <div className="mx-auto max-w-6xl">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Exam Templates</h1>
                            <p className="text-muted-foreground">
                                Manage your custom exam layouts, headers, and footers.
                            </p>
                        </div>
                        <Button asChild>
                            <Link href={examTemplates.create.url()}>
                                <Plus className="mr-2 h-4 w-4" />
                                Create Template
                            </Link>
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {templates.map((template) => (
                            <Card key={template.id}>
                                <CardHeader>
                                    <CardTitle>{template.name}</CardTitle>
                                    <CardDescription>
                                        Created on {new Date(template.created_at).toLocaleDateString()}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex justify-end space-x-2">
                                        <Button variant="outline" size="sm" asChild>
                                            <Link href={examTemplates.edit.url(template.id)}>
                                                <Edit className="h-4 w-4 mr-1" />
                                                Edit
                                            </Link>
                                        </Button>

                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="destructive" size="sm">
                                                    <Trash2 className="h-4 w-4 mr-1" />
                                                    Delete
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This action cannot be undone. This will permanently delete the template
                                                        "{template.name}".
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDelete(template.id)}>
                                                        Delete
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}

                        {templates.length === 0 && (
                            <div className="col-span-full text-center py-12 bg-muted/50 rounded-lg border border-dashed">
                                <h3 className="text-lg font-medium">No templates found</h3>
                                <p className="text-muted-foreground mt-2 mb-4">
                                    Create your first template to customize your exam PDFs.
                                </p>
                                <Button asChild>
                                    <Link href={examTemplates.create.url()}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Create Template
                                    </Link>
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
