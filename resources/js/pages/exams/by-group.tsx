import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { Module } from '@/types/models';
import { ArrowLeft, Search, Filter, FileText, FolderOpen, CheckCircle2, XCircle, Plus } from 'lucide-react';
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
        id: number;
        subject: string;
        grade_level: string;
    };
    creator?: {
        name: string;
    };
}

interface PaginatedQuestions {
    data: Question[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

interface GroupInfo {
    id: number;
    name: string;
    code?: string;
    subject?: string;
    grade_level?: string;
}

interface PageProps {
    questions: PaginatedQuestions;
    groupType: 'tos' | 'module';
    groupInfo: GroupInfo;
    filters: {
        question_type?: string;
        cognitive_level?: string;
        difficulty?: string;
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

export default function ExamsByGroup({ questions, groupType, groupInfo, filters }: PageProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [showFilters, setShowFilters] = useState(false);

    const breadcrumbs = [
        { title: 'Questions', href: '/exams' },
        { title: groupInfo.name, href: '#' },
    ];

    useEffect(() => {
        const timer = setTimeout(() => {
            if (search !== filters.search) {
                router.get(
                    groupType === 'tos' 
                        ? `/exams/tos/${groupInfo.id}` 
                        : `/exams/module/${groupInfo.id}`,
                    { ...filters, search },
                    { preserveState: true }
                );
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [search]);

    const handleFilterChange = (key: string, value: string | null) => {
        const newValue = value === "all" ? undefined : (value || undefined);
        router.get(
            groupType === 'tos' 
                ? `/exams/tos/${groupInfo.id}` 
                : `/exams/module/${groupInfo.id}`,
            { ...filters, [key]: newValue },
            { preserveState: true }
        );
    };

    const clearFilters = () => {
        router.get(
            groupType === 'tos' 
                ? `/exams/tos/${groupInfo.id}` 
                : `/exams/module/${groupInfo.id}`
        );
    };

    const handlePageChange = (page: number) => {
        router.get(
            groupType === 'tos' 
                ? `/exams/tos/${groupInfo.id}` 
                : `/exams/module/${groupInfo.id}`,
            { ...filters, page },
            { preserveState: true, preserveScroll: true }
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${groupInfo.name} - Questions`} />

            <div className="p-4 md:p-6 space-y-6">
                {/* Header */}
                <div className="space-y-4">
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                            {groupType === 'tos' ? (
                                <div className="w-16 h-16 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                                    <FileText className="size-8 text-blue-600 dark:text-blue-300" />
                                </div>
                            ) : (
                                <div className="w-16 h-16 rounded-lg bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                                    <FolderOpen className="size-8 text-orange-600 dark:text-orange-300" />
                                </div>
                            )}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <Badge variant="secondary" className="font-mono">
                                    {groupType === 'tos' ? 'TOS' : 'Module'}
                                </Badge>
                                {groupInfo.code && (
                                    <Badge variant="outline" className="font-mono">
                                        {groupInfo.code}
                                    </Badge>
                                )}
                            </div>
                            <h1 className="text-3xl font-bold tracking-tight">{groupInfo.name}</h1>
                            {groupType === 'tos' && groupInfo.subject && (
                                <p className="mt-1 text-muted-foreground">
                                    {groupInfo.subject} - {groupInfo.grade_level}
                                </p>
                            )}
                            <p className="mt-2 text-muted-foreground">
                                Showing {questions.from || 0} to {questions.to || 0} of {questions.total} questions
                            </p>
                        </div>
                        <div className="flex-shrink-0">
                            <Button onClick={() => router.visit(
                                groupType === 'tos' 
                                    ? `/exams/create/tos/${groupInfo.id}` 
                                    : `/exams/create/module/${groupInfo.id}`
                            )}>
                                <Plus className="mr-2 size-4" />
                                Add Question
                            </Button>
                        </div>
                    </div>
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
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                                    onClick={clearFilters}
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
                                    : 'No questions have been added to this group yet'}
                            </CardDescription>
                        </CardHeader>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        {questions.data.map((question, index) => (
                            <Card key={question.id} className="hover:bg-muted/50 transition-colors">
                                <CardContent className="p-4">
                                    <div className="flex items-start gap-4">
                                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold">
                                            {(questions.current_page - 1) * questions.per_page + index + 1}
                                        </div>
                                        <div className="flex-1 space-y-3">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <Badge variant="outline" className="capitalize">
                                                    {question.question_type.replace('_', ' ')}
                                                </Badge>
                                                <Badge className={cognitiveColors[question.cognitive_level]}>
                                                    {question.cognitive_level}
                                                </Badge>
                                                <Badge className={difficultyColors[question.difficulty]}>
                                                    {question.difficulty}
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
                                            {question.creator && (
                                                <p className="text-xs text-muted-foreground">
                                                    Created by {question.creator.name}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0">
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
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {questions.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                            Page {questions.current_page} of {questions.last_page}
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={questions.current_page === 1}
                                onClick={() => handlePageChange(questions.current_page - 1)}
                            >
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={questions.current_page === questions.last_page}
                                onClick={() => handlePageChange(questions.current_page + 1)}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
