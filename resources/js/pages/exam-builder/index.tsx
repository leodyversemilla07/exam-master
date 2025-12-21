import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { Head, router, Link } from '@inertiajs/react';
import { Exam } from '@/types/models';
import { Plus, Search, Eye, Edit, Copy, Trash2, Clock, FileText, Users } from 'lucide-react';
import { useState } from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Exam Builder', href: '/exam-builder' },
];

interface PageProps {
    exams: {
        data: (Exam & {
            module: {
                code: string;
                name: string;
            };
            creator: {
                name: string;
            };
            tos_generate?: {
                title: string;
            };
            questions_count: number;
        })[];
        current_page: number;
        last_page: number;
        total: number;
    };
    modules: {
        id: number;
        code: string;
        name: string;
    }[];
    filters: {
        module_id?: string;
        status?: string;
        exam_type?: string;
        search?: string;
    };
}

export default function ExamBuilderIndex({ exams, modules, filters }: PageProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [moduleFilter, setModuleFilter] = useState(filters.module_id || 'all');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [typeFilter, setTypeFilter] = useState(filters.exam_type || 'all');
    const [deletingExam, setDeletingExam] = useState<Exam | null>(null);

    const handleSearch = (value: string) => {
        setSearch(value);
        const timer = setTimeout(() => {
            applyFilters({ search: value || undefined });
        }, 300);
        return () => clearTimeout(timer);
    };

    const applyFilters = (newFilters: Partial<typeof filters> = {}) => {
        const currentFilters = {
            module_id: moduleFilter === 'all' ? undefined : moduleFilter || undefined,
            status: statusFilter === 'all' ? undefined : statusFilter || undefined,
            exam_type: typeFilter === 'all' ? undefined : typeFilter || undefined,
            search: search || undefined,
            ...newFilters,
        };

        router.get('/exam-builder', currentFilters, { preserveState: true });
    };

    const handleDelete = (exam: Exam) => {
        setDeletingExam(exam);
    };

    const confirmDelete = () => {
        if (deletingExam) {
            router.delete(`/exam-builder/${deletingExam.id}`, {
                onSuccess: () => setDeletingExam(null),
            });
        }
    };

    const getStatusBadge = (status: string) => {
        const variants = {
            draft: 'secondary',
            published: 'default',
            archived: 'outline',
        } as const;

        return (
            <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
        );
    };

    const getTypeBadge = (type: string) => {
        const colors = {
            formative: 'bg-blue-100 text-blue-800',
            summative: 'bg-green-100 text-green-800',
            diagnostic: 'bg-purple-100 text-purple-800',
        } as const;

        return (
            <Badge className={colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
            </Badge>
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Exam Builder" />

            <div className="p-4 md:p-6">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Exam Builder</h1>
                            <p className="text-gray-600">Create complete exams by combining questions from your question bank</p>
                        </div>
                        <Button asChild className="mt-4 sm:mt-0">
                            <Link href="/exam-builder/create">
                                <Plus className="mr-2 h-4 w-4" />
                                Create Exam
                            </Link>
                        </Button>
                    </div>

                    {/* Filters */}
                    <Card className="mb-6">
                        <CardContent className="pt-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                                <div>
                                    <Input
                                        placeholder="Search exams..."
                                        value={search}
                                        onChange={(e) => handleSearch(e.target.value)}
                                        className="w-full"
                                    />
                                </div>
                                <Select value={moduleFilter} onValueChange={(value) => {
                                    setModuleFilter(value);
                                    applyFilters({ module_id: value === 'all' ? undefined : value || undefined });
                                }}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Modules" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Modules</SelectItem>
                                        {modules.map((module) => (
                                            <SelectItem key={module.id} value={module.id.toString()}>
                                                {module.code}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Select value={statusFilter} onValueChange={(value) => {
                                    setStatusFilter(value);
                                    applyFilters({ status: value === 'all' ? undefined : value || undefined });
                                }}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="draft">Draft</SelectItem>
                                        <SelectItem value="published">Published</SelectItem>
                                        <SelectItem value="archived">Archived</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select value={typeFilter} onValueChange={(value) => {
                                    setTypeFilter(value);
                                    applyFilters({ exam_type: value === 'all' ? undefined : value || undefined });
                                }}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Types" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Types</SelectItem>
                                        <SelectItem value="formative">Formative</SelectItem>
                                        <SelectItem value="summative">Summative</SelectItem>
                                        <SelectItem value="diagnostic">Diagnostic</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setSearch('');
                                        setModuleFilter('all');
                                        setStatusFilter('all');
                                        setTypeFilter('all');
                                        router.get('/exam-builder', {}, { preserveState: true });
                                    }}
                                >
                                    Clear Filters
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Exams List */}
                    <div className="grid gap-6">
                        {exams.data.map((exam) => (
                            <Card key={exam.id}>
                                <CardContent className="pt-6">
                                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between mb-2">
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    {exam.title}
                                                </h3>
                                                <div className="flex gap-2 ml-4">
                                                    {getStatusBadge(exam.status)}
                                                    {getTypeBadge(exam.exam_type)}
                                                </div>
                                            </div>

                                            {exam.description && (
                                                <p className="text-gray-600 mb-3 line-clamp-2">
                                                    {exam.description}
                                                </p>
                                            )}

                                            <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
                                                <div className="flex items-center gap-1">
                                                    <FileText className="h-4 w-4" />
                                                    {exam.module.code} - {exam.module.name}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Users className="h-4 w-4" />
                                                    {exam.questions_count} questions
                                                </div>
                                                {exam.time_limit && (
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="h-4 w-4" />
                                                        {exam.time_limit} min
                                                    </div>
                                                )}
                                                <div>
                                                    Passing: {exam.passing_score}%
                                                </div>
                                            </div>

                                            <div className="text-sm text-gray-500">
                                                Created by {exam.creator.name}
                                                {exam.tos_generate && (
                                                    <span> • Based on {exam.tos_generate.title}</span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex gap-2 mt-4 lg:mt-0 lg:ml-4">
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href={`/exam-builder/${exam.id}`}>
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href={`/exam-builder/${exam.id}/edit`}>
                                                    <Edit className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => router.post(`/exam-builder/${exam.id}/duplicate`)}
                                            >
                                                <Copy className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleDelete(exam)}
                                                className="text-red-600 hover:text-red-700"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {exams.data.length === 0 && (
                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-center py-12">
                                    <FileText className="mx-auto h-12 w-12 text-gray-400" />
                                    <h3 className="mt-2 text-sm font-semibold text-gray-900">No exams found</h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Get started by creating your first exam.
                                    </p>
                                    <div className="mt-6">
                                        <Button asChild>
                                            <Link href="/exam-builder/create">
                                                <Plus className="mr-2 h-4 w-4" />
                                                Create Exam
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Pagination would go here if needed */}
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!deletingExam} onOpenChange={() => setDeletingExam(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Exam</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete "{deletingExam?.title}"? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}