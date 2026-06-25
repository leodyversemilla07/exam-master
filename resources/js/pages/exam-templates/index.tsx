import { Head, Link, router } from '@inertiajs/react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
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
        <>
            <Head title="Exam Templates" />

            <div className="p-4 md:p-6">
                <div className="mx-auto max-w-6xl">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">
                                Exam Templates
                            </h1>
                            <p className="text-muted-foreground">
                                Manage your custom exam layouts, headers, and
                                footers.
                            </p>
                        </div>
                        <Button render={<Link href={examTemplates.create.url()} />} nativeButton={false}>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Template
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {templates.map((template) => (
                            <Card key={template.id}>
                                <CardHeader>
                                    <CardTitle>{template.name}</CardTitle>
                                    <CardDescription>
                                        Created on{' '}
                                        {new Date(
                                            template.created_at,
                                        ).toLocaleDateString()}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex justify-end space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            render={<Link href={examTemplates.edit.url(template.id)} />}
                            nativeButton={false}
                        >
                            <Edit className="mr-1 h-4 w-4" />
                            Edit
                        </Button>

                                        <AlertDialog>
                                            <AlertDialogTrigger render={<Button variant="destructive" size="sm"><Trash2 className="mr-1 h-4 w-4" />Delete</Button>} />
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>
                                                        Are you sure?
                                                    </AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This action cannot be
                                                        undone. This will
                                                        permanently delete the
                                                        template "
                                                        {template.name}".
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>
                                                        Cancel
                                                    </AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={() =>
                                                            handleDelete(
                                                                template.id,
                                                            )
                                                        }
                                                    >
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
                            <div className="col-span-full rounded-lg border border-dashed bg-muted/50 py-12 text-center">
                                <h3 className="text-lg font-medium">
                                    No templates found
                                </h3>
                                <p className="mt-2 mb-4 text-muted-foreground">
                                    Create your first template to customize your
                                    exam PDFs.
                                </p>
                                <Button render={<Link href={examTemplates.create.url()} />} nativeButton={false}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create Template
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

Index.layout = {
    breadcrumbs: [{ title: 'Exam Templates', href: examTemplates.index.url() }],
};
