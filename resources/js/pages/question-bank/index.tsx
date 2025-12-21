import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { Head, router, Link } from '@inertiajs/react';
import { Module } from '@/types/models';
import { Plus, Search, Eye, Edit, Trash2, CheckCircle2, XCircle, Filter } from 'lucide-react';
import { useState } from 'react';
import PageHeader from '@/components/page-header';

interface Question {
    id: number;
    question_text: string;
    question_type: 'multiple_choice' | 'true_false' | 'essay' | 'identification';
    cognitive_level: 'remembering' | 'understanding' | 'applying' | 'analyzing' | 'evaluating' | 'creating';
    difficulty: 'easy' | 'moderate' | 'difficult';
    is_approved: boolean;
    points: number;
    module: Module;
    tosGenerate?: {
        id: number;
        title: string;
    };
    creator: {
        name: string;
    };
}

interface PageProps {
    questions: {
        data: Question[];
        current_page: number;
        last_page: number;
        total: number;
    };
    modules: Module[];
    filters: {
        module_id?: string;
        tos_generate_id?: string;
        question_type?: string;
        cognitive_level?: string;
        difficulty?: string;
        is_approved?: string;
        search?: string;
    };
}

const breadcrumbs = [
    { title: 'Question Bank', href: '/question-bank' },
];

export default function ExamsIndex({ questions, modules, filters }: PageProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [moduleFilter, setModuleFilter] = useState(filters.module_id || 'all');
    const [typeFilter, setTypeFilter] = useState(filters.question_type || 'all');
    const [difficultyFilter, setDifficultyFilter] = useState(filters.difficulty || 'all');
    const [cognitiveFilter, setCognitiveFilter] = useState(filters.cognitive_level || 'all');
    const [approvalFilter, setApprovalFilter] = useState(filters.is_approved || 'all');

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
            question_type: typeFilter === 'all' ? undefined : typeFilter || undefined,
            difficulty: difficultyFilter === 'all' ? undefined : difficultyFilter || undefined,
            cognitive_level: cognitiveFilter === 'all' ? undefined : cognitiveFilter || undefined,
            is_approved: approvalFilter === 'all' ? undefined : approvalFilter || undefined,
            search: search || undefined,
            ...newFilters,
        };

        router.get('/question-bank', currentFilters, { preserveState: true });
    };

    const handleDelete = (question: Question) => {
        if (confirm('Are you sure you want to delete this question?')) {
            router.delete(`/question-bank/${question.id}`);
        }
    };

    const getDifficultyBadge = (difficulty: string) => {
        const colors = {
            easy: 'bg-success/10 text-success border-success/20',
            moderate: 'bg-warning/10 text-warning border-warning/20',
            difficult: 'bg-destructive/10 text-destructive border-destructive/20',
        } as const;

        return (
            <Badge className={colors[difficulty as keyof typeof colors] || 'bg-muted text-muted-foreground'}>
                {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
            </Badge>
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Question Bank" />

            <div className="p-4 md:p-6 space-y-6">
                {/* Header */}
                <PageHeader
                    title="Question Bank"
                    description={`${questions.total} ${questions.total === 1 ? 'question' : 'questions'} available • Browse, search, and manage all your exam questions in one place`}
                    actions={
                        <Button asChild>
                            <Link href="/question-bank/create">
                                <Plus className="mr-2 h-4 w-4" />
                                Add Question
                            </Link>
                        </Button>
                    }
                />

                {/* Search and Filters */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            <CardTitle>Search & Filter</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search questions..."
                                value={search}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="pl-9"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                            <Select value={moduleFilter} onValueChange={(value) => {
                                setModuleFilter(value);
                                applyFilters({ module_id: value === 'all' ? undefined : value });
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

                            <Select value={typeFilter} onValueChange={(value) => {
                                setTypeFilter(value);
                                applyFilters({ question_type: value === 'all' ? undefined : value });
                            }}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Types" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                                    <SelectItem value="true_false">True/False</SelectItem>
                                    <SelectItem value="essay">Essay</SelectItem>
                                    <SelectItem value="identification">Identification</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={difficultyFilter} onValueChange={(value) => {
                                setDifficultyFilter(value);
                                applyFilters({ difficulty: value === 'all' ? undefined : value });
                            }}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Difficulty" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Difficulty</SelectItem>
                                    <SelectItem value="easy">Easy</SelectItem>
                                    <SelectItem value="moderate">Moderate</SelectItem>
                                    <SelectItem value="difficult">Difficult</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={cognitiveFilter} onValueChange={(value) => {
                                setCognitiveFilter(value);
                                applyFilters({ cognitive_level: value === 'all' ? undefined : value });
                            }}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Cognitive Levels" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Levels</SelectItem>
                                    <SelectItem value="remembering">Remembering</SelectItem>
                                    <SelectItem value="understanding">Understanding</SelectItem>
                                    <SelectItem value="applying">Applying</SelectItem>
                                    <SelectItem value="analyzing">Analyzing</SelectItem>
                                    <SelectItem value="evaluating">Evaluating</SelectItem>
                                    <SelectItem value="creating">Creating</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={approvalFilter} onValueChange={(value) => {
                                setApprovalFilter(value);
                                applyFilters({ is_approved: value === 'all' ? undefined : value });
                            }}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="1">Approved</SelectItem>
                                    <SelectItem value="0">Pending</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <Button
                            variant="outline"
                            onClick={() => {
                                setSearch('');
                                setModuleFilter('all');
                                setTypeFilter('all');
                                setDifficultyFilter('all');
                                setCognitiveFilter('all');
                                setApprovalFilter('all');
                                router.get('/question-bank', {}, { preserveState: true });
                            }}
                        >
                            Clear All Filters
                        </Button>
                    </CardContent>
                </Card>

                {/* Questions List */}
                <div className="space-y-4">
                    {questions.data.length === 0 ? (
                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-center py-12">
                                    <Search className="mx-auto h-12 w-12 text-muted-foreground" />
                                    <h3 className="mt-2 text-sm font-semibold text-foreground">No questions found</h3>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        {Object.values(filters).some(v => v) 
                                            ? 'Try adjusting your filters or search terms'
                                            : 'Get started by adding your first question'}
                                    </p>
                                    <div className="mt-6">
                                        <Button asChild>
                                            <Link href="/exams/create">
                                                <Plus className="mr-2 h-4 w-4" />
                                                Add Question
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <>
                            {questions.data.map((question) => (
                                <Card key={question.id}>
                                    <CardContent className="pt-6">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-start gap-4 mb-3">
                                                    <div className="flex-1">
                                                        <h3 className="text-base font-medium text-foreground line-clamp-2">
                                                            {question.question_text}
                                                        </h3>
                                                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                                                            <Badge variant="outline" className="font-mono">
                                                                {question.module.code}
                                                            </Badge>
                                                            <Badge variant="secondary">
                                                                {question.question_type.replace('_', ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                                            </Badge>
                                                            {getDifficultyBadge(question.difficulty)}
                                                            <Badge variant="outline">
                                                                {question.cognitive_level.charAt(0).toUpperCase() + question.cognitive_level.slice(1)}
                                                            </Badge>
                                                            <Badge variant="outline">
                                                                {question.points} {question.points === 1 ? 'point' : 'points'}
                                                            </Badge>
                                                            {question.is_approved ? (
                                                                <Badge className="bg-success/10 text-success border-success/20">
                                                                    <CheckCircle2 className="mr-1 h-3 w-3" />
                                                                    Approved
                                                                </Badge>
                                                            ) : (
                                                                <Badge className="bg-warning/10 text-warning border-warning/20">
                                                                    <XCircle className="mr-1 h-3 w-3" />
                                                                    Pending
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <div className="mt-2 text-sm text-muted-foreground">
                                                            Created by {question.creator.name}
                                                            {question.tosGenerate && (
                                                                <span> • {question.tosGenerate.title}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex gap-2 ml-4">
                                                <Button variant="outline" size="sm" asChild>
                                                    <Link href={`/question-bank/${question.id}`}>
                                                        <Eye className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                <Button variant="outline" size="sm" asChild>
                                                    <Link href={`/question-bank/${question.id}/edit`}>
                                                        <Edit className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleDelete(question)}
                                                    className="text-destructive hover:text-destructive/80"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}

                            {/* Pagination */}
                            {questions.last_page > 1 && (
                                <div className="flex items-center justify-center gap-2 mt-6">
                                    <Button
                                        variant="outline"
                                        disabled={questions.current_page === 1}
                                    onClick={() => router.get('/question-bank', { ...filters, page: questions.current_page - 1 }, { preserveState: true })}
                                    >
                                        Previous
                                    </Button>
                                    <span className="text-sm text-muted-foreground">
                                        Page {questions.current_page} of {questions.last_page}
                                    </span>
                                    <Button
                                        variant="outline"
                                        disabled={questions.current_page === questions.last_page}
                                    onClick={() => router.get('/question-bank', { ...filters, page: questions.current_page + 1 }, { preserveState: true })}
                                    >
                                        Next
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
