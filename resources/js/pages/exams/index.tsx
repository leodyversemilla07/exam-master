import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { Module } from '@/types/models';
import { FolderOpen, FileText, ArrowRight } from 'lucide-react';

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

interface QuestionGroup {
    key: string;
    type: 'tos' | 'module' | 'ungrouped';
    group_name: string;
    module?: Module;
    tos?: {
        id: number;
        subject: string;
        grade_level: string;
    };
    count: number;
    questions: Question[];
}

interface PageProps {
    groupedQuestions: QuestionGroup[];
    totalQuestions: number;
    modules: Module[];
    filters: {
        module_id?: number;
        tos_generate_id?: number;
        question_type?: string;
        cognitive_level?: string;
        difficulty?: string;
        is_approved?: boolean;
        search?: string;
    };
}

const breadcrumbs = [
    { title: 'Questions', href: '/exams' },
];

export default function ExamsIndex({ groupedQuestions, totalQuestions, modules, filters }: PageProps) {
    const viewGroupQuestions = (group: QuestionGroup) => {
        if (group.type === 'tos' && group.tos) {
            router.visit(`/exams/tos/${group.tos.id}`);
        } else if (group.type === 'module' && group.module) {
            router.visit(`/exams/module/${group.module.id}`);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Question Bank" />

            <div className="p-4 md:p-6 space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Question Bank</h1>
                    <p className="mt-2 text-muted-foreground">
                        {totalQuestions} questions in {groupedQuestions.length} {groupedQuestions.length === 1 ? 'group' : 'groups'}
                    </p>
                </div>

                {/* Content Area */}
                {groupedQuestions.length === 0 ? (
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
                    /* Show group cards */
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {groupedQuestions.map((group) => (
                            <Card key={group.key} className="hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0">
                                            {group.type === 'tos' ? (
                                                <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                                                    <FileText className="size-6 text-blue-600 dark:text-blue-300" />
                                                </div>
                                            ) : group.type === 'module' ? (
                                                <div className="w-12 h-12 rounded-lg bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                                                    <FolderOpen className="size-6 text-orange-600 dark:text-orange-300" />
                                                </div>
                                            ) : (
                                                <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                                    <FolderOpen className="size-6 text-gray-600 dark:text-gray-400" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <CardTitle className="text-lg line-clamp-2">{group.group_name}</CardTitle>
                                            <CardDescription className="mt-1">
                                                {group.count} {group.count === 1 ? 'question' : 'questions'}
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <Badge variant="secondary" className="font-mono">
                                            {group.type === 'tos' ? 'TOS' : group.type === 'module' ? 'Module' : 'Other'}
                                        </Badge>
                                        {group.module && (
                                            <Badge variant="outline" className="font-mono">
                                                {group.module.code}
                                            </Badge>
                                        )}
                                        {group.type === 'tos' && group.tos && (
                                            <Badge variant="outline">
                                                Quarter {group.tos.id}
                                            </Badge>
                                        )}
                                    </div>
                                    <Button 
                                        className="w-full" 
                                        onClick={() => viewGroupQuestions(group)}
                                        disabled={group.type === 'ungrouped'}
                                    >
                                        View Questions
                                        <ArrowRight className="ml-2 size-4" />
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
