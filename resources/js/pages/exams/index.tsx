import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Module } from '@/types/models';
import { Plus, Search, Filter, CheckCircle2, XCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Question {
    id: number;
    question: string;
    question_type: 'multiple_choice' | 'true_false' | 'essay' | 'identification';
    cognitive_level: 'remembering' | 'understanding' | 'applying' | 'analyzing' | 'evaluating' | 'creating';
    difficulty: 'easy' | 'moderate' | 'difficult';
    is_approved: boolean;
    module?: Module;
    tosGenerate?: {
        subject: string;
        grade_level: string;
    };
    creator?: {
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
        module_id?: number;
        question_type?: string;
        cognitive_level?: string;
        difficulty?: string;
        is_approved?: boolean;
        search?: string;
    };
}

const difficultyColors = {
    easy: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    moderate: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    difficult: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

const cognitiveColors = {
    remembering: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    understanding: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300',
    applying: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    analyzing: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    evaluating: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
    creating: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

export default function ExamsIndex({ questions, modules, filters }: PageProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (search !== filters.search) {
                router.get('/exams', { ...filters, search }, { preserveState: true });
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [search]);

    const handleFilterChange = (key: string, value: string | null) => {
        const newValue = value === "all" ? undefined : (value || undefined);
        router.get('/exams', { ...filters, [key]: newValue }, { preserveState: true });
    };

    return (
        <AppLayout>
            <Head title="Question Bank" />

            <div className="p-4 md:p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Question Bank</h1>
                        <p className="mt-2 text-muted-foreground">
                            Manage exam questions and test items
                        </p>
                    </div>
                    <Button>
                        <Plus className="mr-2 size-4" />
                        Add Question
                    </Button>
                </div>

                {/* Search and Filters */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Search & Filters</CardTitle>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowFilters(!showFilters)}
                            >
                                <Filter className="mr-2 size-4" />
                                {showFilters ? 'Hide' : 'Show'} Filters
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
                            <Input
                                placeholder="Search questions..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        {showFilters && (
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Module</label>
                                    <Select
                                        value={filters.module_id?.toString() || "all"}
                                        onValueChange={(value) => handleFilterChange('module_id', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="All modules" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All modules</SelectItem>
                                            {modules.map((module) => (
                                                <SelectItem key={module.id} value={module.id.toString()}>
                                                    {module.code} - {module.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Question Type</label>
                                    <Select
                                        value={filters.question_type || "all"}
                                        onValueChange={(value) => handleFilterChange('question_type', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="All types" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All types</SelectItem>
                                            <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                                            <SelectItem value="true_false">True/False</SelectItem>
                                            <SelectItem value="essay">Essay</SelectItem>
                                            <SelectItem value="identification">Identification</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Cognitive Level</label>
                                    <Select
                                        value={filters.cognitive_level || "all"}
                                        onValueChange={(value) => handleFilterChange('cognitive_level', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="All levels" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All levels</SelectItem>
                                            <SelectItem value="remembering">Remembering</SelectItem>
                                            <SelectItem value="understanding">Understanding</SelectItem>
                                            <SelectItem value="applying">Applying</SelectItem>
                                            <SelectItem value="analyzing">Analyzing</SelectItem>
                                            <SelectItem value="evaluating">Evaluating</SelectItem>
                                            <SelectItem value="creating">Creating</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Difficulty</label>
                                    <Select
                                        value={filters.difficulty || "all"}
                                        onValueChange={(value) => handleFilterChange('difficulty', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="All levels" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All levels</SelectItem>
                                            <SelectItem value="easy">Easy</SelectItem>
                                            <SelectItem value="moderate">Moderate</SelectItem>
                                            <SelectItem value="difficult">Difficult</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        )}

                        {/* Active Filters */}
                        {Object.values(filters).some(v => v) && (
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-sm text-muted-foreground">Active filters:</span>
                                {filters.module_id && (
                                    <Badge variant="secondary">
                                        Module: {modules.find(m => m.id === filters.module_id)?.code}
                                        <button
                                            className="ml-2"
                                            onClick={() => handleFilterChange('module_id', null)}
                                        >
                                            ×
                                        </button>
                                    </Badge>
                                )}
                                {filters.question_type && (
                                    <Badge variant="secondary">
                                        Type: {filters.question_type.replace('_', ' ')}
                                        <button
                                            className="ml-2"
                                            onClick={() => handleFilterChange('question_type', null)}
                                        >
                                            ×
                                        </button>
                                    </Badge>
                                )}
                                {filters.cognitive_level && (
                                    <Badge variant="secondary">
                                        Level: {filters.cognitive_level}
                                        <button
                                            className="ml-2"
                                            onClick={() => handleFilterChange('cognitive_level', null)}
                                        >
                                            ×
                                        </button>
                                    </Badge>
                                )}
                                {filters.difficulty && (
                                    <Badge variant="secondary">
                                        Difficulty: {filters.difficulty}
                                        <button
                                            className="ml-2"
                                            onClick={() => handleFilterChange('difficulty', null)}
                                        >
                                            ×
                                        </button>
                                    </Badge>
                                )}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => router.get('/exams')}
                                >
                                    Clear all
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Questions List */}
                {questions.data.length === 0 ? (
                    <Card>
                        <CardHeader>
                            <CardTitle>No Questions Found</CardTitle>
                            <CardDescription>
                                {Object.values(filters).some(v => v)
                                    ? 'Try adjusting your filters'
                                    : 'Get started by adding your first question'}
                            </CardDescription>
                        </CardHeader>
                    </Card>
                ) : (
                    <>
                        <div className="space-y-4">
                            {questions.data.map((question) => (
                                <Card key={question.id}>
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1 space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline" className="font-mono">
                                                        {question.module?.code}
                                                    </Badge>
                                                    <Badge className={cognitiveColors[question.cognitive_level]}>
                                                        {question.cognitive_level}
                                                    </Badge>
                                                    <Badge className={difficultyColors[question.difficulty]}>
                                                        {question.difficulty}
                                                    </Badge>
                                                    <Badge variant="outline" className="capitalize">
                                                        {question.question_type.replace('_', ' ')}
                                                    </Badge>
                                                    {question.is_approved ? (
                                                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                                                            <CheckCircle2 className="mr-1 size-3" />
                                                            Approved
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="secondary">
                                                            <XCircle className="mr-1 size-3" />
                                                            Pending
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-sm leading-relaxed">
                                                    {question.question ? (
                                                        <>
                                                            {question.question.substring(0, 200)}
                                                            {question.question.length > 200 && '...'}
                                                        </>
                                                    ) : (
                                                        <span className="text-muted-foreground italic">No question text</span>
                                                    )}
                                                </p>
                                                {question.tosGenerate && (
                                                    <p className="text-xs text-muted-foreground">
                                                        From: {question.tosGenerate.subject} - {question.tosGenerate.grade_level}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button 
                                                    variant="outline" 
                                                    size="sm"
                                                    onClick={() => router.visit(`/exams/${question.id}`)}
                                                >
                                                    View
                                                </Button>
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm"
                                                    onClick={() => router.visit(`/exams/${question.id}/edit`)}
                                                >
                                                    Edit
                                                </Button>
                                            </div>
                                        </div>
                                    </CardHeader>
                                </Card>
                            ))}
                        </div>

                        {/* Pagination */}
                        {questions.last_page > 1 && (
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-muted-foreground">
                                    Showing {questions.data.length} of {questions.total} questions
                                </p>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={questions.current_page === 1}
                                        onClick={() => router.get('/exams', { ...filters, page: questions.current_page - 1 }, { preserveState: true })}
                                    >
                                        Previous
                                    </Button>
                                    <span className="text-sm">
                                        Page {questions.current_page} of {questions.last_page}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={questions.current_page === questions.last_page}
                                        onClick={() => router.get('/exams', { ...filters, page: questions.current_page + 1 }, { preserveState: true })}
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
