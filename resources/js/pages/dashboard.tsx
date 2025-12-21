import AppLayout from "@/layouts/app-layout";
import { PageProps } from "@/types";
import { Head, Link } from "@inertiajs/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    MessageSquare,
    ClipboardList,
    ArrowRight,
    BookOpen,
    FileText,
    Users,
    CheckCircle2,
    Clock,
    Brain,
    Sparkles,
    TableProperties,
    TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardStats {
    total_modules: number;
    active_modules: number;
    total_questions: number;
    approved_questions: number;
    pending_questions: number;
    ai_generated_questions: number;
    total_exams: number;
    published_exams: number;
    draft_exams: number;
    total_tos: number;
    completed_tos: number;
    total_users: number;
}

interface RecentQuestion {
    id: number;
    question: string;
    cognitive_level: string;
    difficulty: string;
    is_approved: boolean;
    created_at: string;
    module: { id: number; code: string; name: string } | null;
}

interface RecentExam {
    id: number;
    title: string;
    status: string;
    total_items: number;
    created_at: string;
    module: { id: number; code: string; name: string } | null;
}

interface RecentTos {
    id: number;
    subject: string;
    status: string;
    total_items: number;
    created_at: string;
    module: { id: number; code: string; name: string } | null;
}

interface ModuleStat {
    id: number;
    code: string;
    name: string;
    questions_count: number;
    exams_count: number;
    tos_generates_count: number;
}

interface DashboardPageProps extends PageProps {
    stats: DashboardStats;
    questionsByCognitiveLevel: Record<string, number>;
    questionsByDifficulty: Record<string, number>;
    questionsByType: Record<string, number>;
    recentQuestions: RecentQuestion[];
    recentExams: RecentExam[];
    recentTos: RecentTos[];
    moduleStats: ModuleStat[];
}

const breadcrumbs = [{ title: "Dashboard", href: "/dashboard" }];

const cognitiveColors: Record<string, string> = {
    remembering: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
    understanding: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    applying: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    analyzing: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    evaluating: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
    creating: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

const difficultyColors: Record<string, string> = {
    easy: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    moderate: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    difficult: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

const statusColors: Record<string, string> = {
    draft: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
    published: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    generating: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    failed: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

export default function Dashboard({
    auth,
    stats,
    questionsByCognitiveLevel,
    questionsByDifficulty,
    questionsByType,
    recentQuestions,
    recentExams,
    recentTos,
    moduleStats,
}: DashboardPageProps) {
    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const truncateText = (text: string, maxLength: number = 50) => {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + "...";
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="p-4 md:p-6">
                <div className="space-y-6">
                    {/* Welcome Section */}
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Welcome back, {auth.user.name}!
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                                Here's an overview of your exam management system
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button asChild variant="outline">
                                <Link href="/question-bank/create">
                                    <MessageSquare className="mr-2 h-4 w-4" />
                                    New Question
                                </Link>
                            </Button>
                            <Button asChild>
                                <Link href="/exam-builder/create">
                                    <ClipboardList className="mr-2 h-4 w-4" />
                                    New Exam
                                </Link>
                            </Button>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                                        <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">{stats.active_modules}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Active Modules</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                                        <MessageSquare className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">{stats.total_questions}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Total Questions</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                                        <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">{stats.approved_questions}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Approved</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                                        <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">{stats.pending_questions}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Pending</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                                        <Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">{stats.ai_generated_questions}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">AI Generated</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-lg">
                                        <ClipboardList className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">{stats.published_exams}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Published Exams</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Distribution Charts */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Cognitive Level Distribution */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Brain className="h-5 w-5" />
                                    By Cognitive Level
                                </CardTitle>
                                <CardDescription>Bloom's Taxonomy distribution</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {Object.entries(questionsByCognitiveLevel).map(([level, count]) => (
                                        <div key={level} className="flex items-center justify-between">
                                            <Badge className={cognitiveColors[level] || "bg-gray-100"}>
                                                {level.charAt(0).toUpperCase() + level.slice(1)}
                                            </Badge>
                                            <span className="font-medium">{count}</span>
                                        </div>
                                    ))}
                                    {Object.keys(questionsByCognitiveLevel).length === 0 && (
                                        <p className="text-sm text-gray-500 text-center py-4">No data available</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Difficulty Distribution */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5" />
                                    By Difficulty
                                </CardTitle>
                                <CardDescription>Question difficulty breakdown</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {Object.entries(questionsByDifficulty).map(([difficulty, count]) => (
                                        <div key={difficulty} className="flex items-center justify-between">
                                            <Badge className={difficultyColors[difficulty] || "bg-gray-100"}>
                                                {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                                            </Badge>
                                            <span className="font-medium">{count}</span>
                                        </div>
                                    ))}
                                    {Object.keys(questionsByDifficulty).length === 0 && (
                                        <p className="text-sm text-gray-500 text-center py-4">No data available</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Question Type Distribution */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <FileText className="h-5 w-5" />
                                    By Question Type
                                </CardTitle>
                                <CardDescription>Question format breakdown</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {Object.entries(questionsByType).map(([type, count]) => (
                                        <div key={type} className="flex items-center justify-between">
                                            <span className="text-sm">
                                                {type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                                            </span>
                                            <span className="font-medium">{count}</span>
                                        </div>
                                    ))}
                                    {Object.keys(questionsByType).length === 0 && (
                                        <p className="text-sm text-gray-500 text-center py-4">No data available</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Recent Activity & Quick Actions */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Recent Questions */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-base">Recent Questions</CardTitle>
                                    <CardDescription>Latest questions added to the bank</CardDescription>
                                </div>
                                <Button asChild variant="ghost" size="sm">
                                    <Link href="/question-bank">
                                        View All
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {recentQuestions.map((question) => (
                                        <div key={question.id} className="flex items-start justify-between gap-4 pb-4 border-b last:border-0 last:pb-0">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">
                                                    {truncateText(question.question, 60)}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Badge variant="outline" className="text-xs">
                                                        {question.module?.code || "N/A"}
                                                    </Badge>
                                                    <Badge className={`text-xs ${cognitiveColors[question.cognitive_level] || ""}`}>
                                                        {question.cognitive_level}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {question.is_approved ? (
                                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                ) : (
                                                    <Clock className="h-4 w-4 text-yellow-500" />
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {recentQuestions.length === 0 && (
                                        <p className="text-sm text-gray-500 text-center py-8">No questions yet</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Recent Exams */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-base">Recent Exams</CardTitle>
                                    <CardDescription>Latest exams created</CardDescription>
                                </div>
                                <Button asChild variant="ghost" size="sm">
                                    <Link href="/exam-builder">
                                        View All
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {recentExams.map((exam) => (
                                        <div key={exam.id} className="flex items-start justify-between gap-4 pb-4 border-b last:border-0 last:pb-0">
                                            <div className="flex-1 min-w-0">
                                                <Link
                                                    href={`/exam-builder/${exam.id}`}
                                                    className="text-sm font-medium hover:underline truncate block"
                                                >
                                                    {truncateText(exam.title, 40)}
                                                </Link>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Badge variant="outline" className="text-xs">
                                                        {exam.module?.code || "N/A"}
                                                    </Badge>
                                                    <span className="text-xs text-gray-500">
                                                        {exam.total_items} items
                                                    </span>
                                                </div>
                                            </div>
                                            <Badge className={statusColors[exam.status] || ""}>
                                                {exam.status}
                                            </Badge>
                                        </div>
                                    ))}
                                    {recentExams.length === 0 && (
                                        <p className="text-sm text-gray-500 text-center py-8">No exams yet</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Module Statistics */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-base">Top Modules</CardTitle>
                                <CardDescription>Most active modules by question count</CardDescription>
                            </div>
                            <Button asChild variant="ghost" size="sm">
                                <Link href="/modules">
                                    View All
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                                {moduleStats.map((module) => (
                                    <Link
                                        key={module.id}
                                        href={`/modules/${module.id}`}
                                        className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                    >
                                        <p className="font-medium text-sm truncate">{module.name}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{module.code}</p>
                                        <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                                            <span className="flex items-center gap-1">
                                                <MessageSquare className="h-3 w-3" />
                                                {module.questions_count}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <ClipboardList className="h-3 w-3" />
                                                {module.exams_count}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <TableProperties className="h-3 w-3" />
                                                {module.tos_generates_count}
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                                {moduleStats.length === 0 && (
                                    <p className="text-sm text-gray-500 text-center py-8 col-span-full">
                                        No modules yet.{" "}
                                        <Link href="/modules/create" className="text-blue-600 hover:underline">
                                            Create one
                                        </Link>
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                                        <MessageSquare className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <CardTitle>Question Bank</CardTitle>
                                        <CardDescription>Manage individual exam questions</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Create, organize, and manage your collection of exam questions.
                                </p>
                                <Button asChild className="w-full">
                                    <Link href="/question-bank">
                                        Go to Question Bank
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                                        <ClipboardList className="h-6 w-6 text-green-600 dark:text-green-400" />
                                    </div>
                                    <div>
                                        <CardTitle>Exam Builder</CardTitle>
                                        <CardDescription>Build complete exams from questions</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Combine questions to create complete, ready-to-use exams.
                                </p>
                                <Button asChild className="w-full">
                                    <Link href="/exam-builder">
                                        Go to Exam Builder
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
