import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { Module, ExamQuestion } from '@/types/models';
import { AlertTriangle, FileQuestion, Search } from 'lucide-react';

interface DuplicateMatch {
    question: ExamQuestion;
    similarity_score: number;
    matching_aspects: string[];
}

interface PageProps {
    module: Module;
    duplicates: {
        question: ExamQuestion;
        matches: DuplicateMatch[];
    }[];
    statistics: {
        total_questions: number;
        duplicate_groups: number;
        highest_similarity: number;
        questions_with_duplicates: number;
    };
}

const getSimilarityColor = (score: number): string => {
    if (score >= 90) return 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 border-red-200 dark:border-red-800';
    if (score >= 75) return 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300 border-orange-200 dark:border-orange-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800';
    return 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300 border-green-200 dark:border-green-800';
};

const getSimilarityLabel = (score: number): string => {
    if (score >= 90) return 'Very High';
    if (score >= 75) return 'High';
    if (score >= 60) return 'Moderate';
    return 'Low';
};

export default function DuplicateDetectionIndex({ module, duplicates, statistics }: PageProps) {
    return (
        <AppLayout>
            <Head title={`Duplicate Detection - ${module.name}`} />

            <div className="p-4 md:p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Duplicate Detection</h1>
                        <p className="mt-2 text-muted-foreground">
                            Question similarity analysis for <strong>{module.code}</strong> - {module.name}
                        </p>
                    </div>
                    <Search className="size-8 text-muted-foreground" />
                </div>

                {/* Statistics Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Questions</CardTitle>
                            <FileQuestion className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{statistics.total_questions}</div>
                            <p className="text-xs text-muted-foreground">
                                In question bank
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Duplicate Groups</CardTitle>
                            <AlertTriangle className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{statistics.duplicate_groups}</div>
                            <p className="text-xs text-muted-foreground">
                                Questions with matches
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Highest Similarity</CardTitle>
                            <AlertTriangle className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{statistics.highest_similarity.toFixed(1)}%</div>
                            <p className="text-xs text-muted-foreground">
                                Maximum detected
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Questions Flagged</CardTitle>
                            <AlertTriangle className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{statistics.questions_with_duplicates}</div>
                            <p className="text-xs text-muted-foreground">
                                Need review
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Duplicate Groups */}
                {duplicates.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-16">
                            <FileQuestion className="size-12 text-muted-foreground" />
                            <h3 className="mt-4 text-lg font-medium">No Duplicates Found</h3>
                            <p className="mt-2 text-sm text-muted-foreground">
                                All questions in this module appear to be unique.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-6">
                        {duplicates.map((group) => (
                            <Card key={group.question.id}>
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <CardTitle className="text-base">Question #{group.question.id}</CardTitle>
                                            <CardDescription className="mt-2 line-clamp-2">
                                                {group.question.question}
                                            </CardDescription>
                                        </div>
                                        <Badge variant="outline" className="ml-4">
                                            {group.matches.length} {group.matches.length === 1 ? 'match' : 'matches'}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {group.matches.map((match) => (
                                        <div
                                            key={match.question.id}
                                            className={`rounded-lg border p-4 ${getSimilarityColor(match.similarity_score)}`}
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-medium">
                                                            Question #{match.question.id}
                                                        </span>
                                                        <Badge
                                                            variant="secondary"
                                                            className={getSimilarityColor(match.similarity_score)}
                                                        >
                                                            {match.similarity_score.toFixed(1)}% - {getSimilarityLabel(match.similarity_score)}
                                                        </Badge>
                                                    </div>
                                                    <p className="mt-2 text-sm">{match.question.question}</p>
                                                    <div className="mt-3 flex flex-wrap gap-2">
                                                        {match.matching_aspects.map((aspect, aspectIndex) => (
                                                            <Badge key={aspectIndex} variant="outline" className="text-xs">
                                                                {aspect}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Side-by-side comparison */}
                                            <div className="mt-4 grid gap-4 border-t pt-4 md:grid-cols-2">
                                                <div>
                                                    <h4 className="mb-2 text-xs font-medium uppercase text-muted-foreground">
                                                        Original Question
                                                    </h4>
                                                    <div className="space-y-1 text-sm">
                                                        <div>
                                                            <span className="font-medium">Type:</span> {group.question.question_type}
                                                        </div>
                                                        <div>
                                                            <span className="font-medium">Difficulty:</span>{' '}
                                                            <span className="capitalize">{group.question.difficulty}</span>
                                                        </div>
                                                        <div>
                                                            <span className="font-medium">Cognitive Level:</span>{' '}
                                                            <span className="capitalize">{group.question.cognitive_level}</span>
                                                        </div>
                                                        {group.question.correct_answer && (
                                                            <div>
                                                                <span className="font-medium">Answer:</span> {group.question.correct_answer}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div>
                                                    <h4 className="mb-2 text-xs font-medium uppercase text-muted-foreground">
                                                        Similar Question
                                                    </h4>
                                                    <div className="space-y-1 text-sm">
                                                        <div>
                                                            <span className="font-medium">Type:</span> {match.question.question_type}
                                                        </div>
                                                        <div>
                                                            <span className="font-medium">Difficulty:</span>{' '}
                                                            <span className="capitalize">{match.question.difficulty}</span>
                                                        </div>
                                                        <div>
                                                            <span className="font-medium">Cognitive Level:</span>{' '}
                                                            <span className="capitalize">{match.question.cognitive_level}</span>
                                                        </div>
                                                        {match.question.correct_answer && (
                                                            <div>
                                                                <span className="font-medium">Answer:</span> {match.question.correct_answer}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Legend */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Similarity Score Legend</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="flex items-center gap-2">
                            <div className="size-4 rounded bg-green-500" />
                            <span className="text-sm">
                                <strong>Low (60-74%):</strong> Minor similarities
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="size-4 rounded bg-yellow-500" />
                            <span className="text-sm">
                                <strong>Moderate (75-89%):</strong> Notable overlap
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="size-4 rounded bg-orange-500" />
                            <span className="text-sm">
                                <strong>High (90-94%):</strong> Very similar
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="size-4 rounded bg-red-500" />
                            <span className="text-sm">
                                <strong>Very High (95%+):</strong> Near duplicates
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
