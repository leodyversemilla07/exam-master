import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { TosGenerate, Module } from '@/types/models';
import { Plus, FileText, Loader2, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

interface PageProps {
    tosGenerates: {
        data: (TosGenerate & {
            module?: Module;
            questions_count?: number;
        })[];
        current_page: number;
        last_page: number;
        total: number;
    };
    modules: Module[];
}

const statusColors = {
    draft: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
    generating: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    failed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

const statusIcons = {
    draft: Clock,
    generating: Loader2,
    completed: CheckCircle2,
    failed: AlertCircle,
};

export default function TosGeneratesIndex({ tosGenerates, modules }: PageProps) {
    return (
        <AppLayout>
            <Head title="Table of Specifications" />

            <div className="p-4 md:p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Table of Specifications</h1>
                        <p className="mt-2 text-muted-foreground">
                            Generate and manage test specifications and questions
                        </p>
                    </div>
                    <Link href="/tos-generates/create">
                        <Button>
                            <Plus className="mr-2 size-4" />
                            Generate TOS
                        </Button>
                    </Link>
                </div>

                {tosGenerates.data.length === 0 ? (
                    <Card>
                        <CardHeader>
                            <CardTitle>No TOS Generated Yet</CardTitle>
                            <CardDescription>
                                Get started by generating your first table of specifications
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Link href="/tos-generates/create">
                                <Button>
                                    <Plus className="mr-2 size-4" />
                                    Generate TOS
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {tosGenerates.data.map((tos) => {
                                const StatusIcon = statusIcons[tos.status];
                                return (
                                    <Card key={tos.id} className="group relative">
                                        <CardHeader>
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Badge variant="outline" className="font-mono text-xs">
                                                            {tos.module?.code}
                                                        </Badge>
                                                        <Badge className={statusColors[tos.status]}>
                                                            <StatusIcon className={`mr-1 size-3 ${tos.status === 'generating' ? 'animate-spin' : ''}`} />
                                                            {tos.status}
                                                        </Badge>
                                                    </div>
                                                    <CardTitle className="text-lg">
                                                        {tos.subject} - {tos.grade_level}
                                                    </CardTitle>
                                                    <CardDescription className="mt-1">
                                                        {tos.module?.name}
                                                    </CardDescription>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            {/* TOS Info */}
                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                <div>
                                                    <span className="text-muted-foreground">Total Items:</span>
                                                    <p className="font-medium">{tos.total_items}</p>
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground">Difficulty:</span>
                                                    <p className="font-medium capitalize">{tos.difficulty_level}</p>
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground">Type:</span>
                                                    <p className="font-medium capitalize">{tos.question_type.replace('_', ' ')}</p>
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground">Quarter:</span>
                                                    <p className="font-medium">{tos.quarter || 'N/A'}</p>
                                                </div>
                                            </div>

                                            {/* Cognitive Levels */}
                                            <div className="pt-2 border-t">
                                                <p className="text-sm text-muted-foreground mb-2">Cognitive Levels:</p>
                                                <div className="flex flex-wrap gap-1">
                                                    {Object.entries(tos.cognitive_levels).map(([level, count]) => (
                                                        count > 0 && (
                                                            <Badge key={level} variant="secondary" className="text-xs">
                                                                {level}: {count}
                                                            </Badge>
                                                        )
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-2 pt-2 border-t">
                                                <Link href={`/tos-generates/${tos.id}`} className="flex-1">
                                                    <Button variant="outline" size="sm" className="w-full">
                                                        View Details
                                                    </Button>
                                                </Link>
                                                {tos.status === 'draft' && (
                                                    <Link href={`/tos-generates/${tos.id}/edit`}>
                                                        <Button variant="ghost" size="sm">
                                                            Edit
                                                        </Button>
                                                    </Link>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>

                        {/* Pagination */}
                        {tosGenerates.last_page > 1 && (
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-muted-foreground">
                                    Showing {tosGenerates.data.length} of {tosGenerates.total} TOS generations
                                </p>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={tosGenerates.current_page === 1}
                                        onClick={() => router.get(`/tos-generates?page=${tosGenerates.current_page - 1}`)}
                                    >
                                        Previous
                                    </Button>
                                    <span className="text-sm">
                                        Page {tosGenerates.current_page} of {tosGenerates.last_page}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={tosGenerates.current_page === tosGenerates.last_page}
                                        onClick={() => router.get(`/tos-generates?page=${tosGenerates.current_page + 1}`)}
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
