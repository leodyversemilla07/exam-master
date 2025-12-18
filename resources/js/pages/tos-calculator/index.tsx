import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { Module, Topic, LearningObjective, CognitiveLevel } from '@/types/models';
import { Calculator, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';

interface PageProps {
    module: Module & {
        topics: (Topic & {
            learning_objectives: LearningObjective[];
        })[];
    };
    matrix: {
        topic_id: number;
        topic_code: string;
        topic_title: string;
        remembering: number;
        understanding: number;
        applying: number;
        analyzing: number;
        evaluating: number;
        creating: number;
        total: number;
        percentage: number;
    }[];
    distribution: {
        cognitive_level: CognitiveLevel;
        count: number;
        percentage: number;
    }[];
    statistics: {
        total_objectives: number;
        total_topics: number;
        average_per_topic: number;
        most_used_level: CognitiveLevel;
        least_used_level: CognitiveLevel;
    };
    balance: {
        level: CognitiveLevel;
        count: number;
        ideal_min: number;
        ideal_max: number;
        status: 'balanced' | 'over' | 'under';
    }[];
}

const cognitiveLevelColors: Record<CognitiveLevel, { bg: string; text: string; border: string }> = {
    remembering: { bg: 'bg-blue-50 dark:bg-blue-950', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-800' },
    understanding: { bg: 'bg-green-50 dark:bg-green-950', text: 'text-green-700 dark:text-green-300', border: 'border-green-200 dark:border-green-800' },
    applying: { bg: 'bg-yellow-50 dark:bg-yellow-950', text: 'text-yellow-700 dark:text-yellow-300', border: 'border-yellow-200 dark:border-yellow-800' },
    analyzing: { bg: 'bg-orange-50 dark:bg-orange-950', text: 'text-orange-700 dark:text-orange-300', border: 'border-orange-200 dark:border-orange-800' },
    evaluating: { bg: 'bg-purple-50 dark:bg-purple-950', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-200 dark:border-purple-800' },
    creating: { bg: 'bg-pink-50 dark:bg-pink-950', text: 'text-pink-700 dark:text-pink-300', border: 'border-pink-200 dark:border-pink-800' },
};

const cognitiveLevels: CognitiveLevel[] = ['remembering', 'understanding', 'applying', 'analyzing', 'evaluating', 'creating'];

export default function TosCalculatorIndex({ module, matrix, distribution, statistics, balance }: PageProps) {
    return (
        <AppLayout>
            <Head title={`TOS Calculator - ${module.name}`} />

            <div className="p-4 md:p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">TOS Calculator</h1>
                        <p className="mt-2 text-muted-foreground">
                            Table of Specifications for <strong>{module.code}</strong> - {module.name}
                        </p>
                    </div>
                    <Calculator className="size-8 text-muted-foreground" />
                </div>

                {/* Statistics Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Objectives</CardTitle>
                            <TrendingUp className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{statistics.total_objectives}</div>
                            <p className="text-xs text-muted-foreground">
                                Across {statistics.total_topics} topics
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Average per Topic</CardTitle>
                            <Calculator className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{statistics.average_per_topic.toFixed(1)}</div>
                            <p className="text-xs text-muted-foreground">
                                Learning objectives
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Most Used Level</CardTitle>
                            <TrendingUp className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold capitalize">{statistics.most_used_level}</div>
                            <p className="text-xs text-muted-foreground">
                                Bloom's taxonomy
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Least Used Level</CardTitle>
                            <AlertCircle className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold capitalize">{statistics.least_used_level}</div>
                            <p className="text-xs text-muted-foreground">
                                Consider balancing
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* TOS Matrix */}
                <Card>
                    <CardHeader>
                        <CardTitle>Table of Specifications Matrix</CardTitle>
                        <CardDescription>
                            Distribution of learning objectives across topics and cognitive levels
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/50">
                                        <th className="p-2 text-left font-medium">Topic</th>
                                        {cognitiveLevels.map((level) => (
                                            <th key={level} className="p-2 text-center font-medium capitalize">
                                                {level.slice(0, 3)}
                                            </th>
                                        ))}
                                        <th className="p-2 text-center font-medium">Total</th>
                                        <th className="p-2 text-center font-medium">%</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {matrix.map((row) => (
                                        <tr key={row.topic_id} className="border-b hover:bg-muted/50">
                                            <td className="p-2">
                                                <div className="font-medium">{row.topic_code}</div>
                                                <div className="text-xs text-muted-foreground">{row.topic_title}</div>
                                            </td>
                                            <td className={`p-2 text-center ${cognitiveLevelColors.remembering.bg} ${cognitiveLevelColors.remembering.text}`}>
                                                {row.remembering || '-'}
                                            </td>
                                            <td className={`p-2 text-center ${cognitiveLevelColors.understanding.bg} ${cognitiveLevelColors.understanding.text}`}>
                                                {row.understanding || '-'}
                                            </td>
                                            <td className={`p-2 text-center ${cognitiveLevelColors.applying.bg} ${cognitiveLevelColors.applying.text}`}>
                                                {row.applying || '-'}
                                            </td>
                                            <td className={`p-2 text-center ${cognitiveLevelColors.analyzing.bg} ${cognitiveLevelColors.analyzing.text}`}>
                                                {row.analyzing || '-'}
                                            </td>
                                            <td className={`p-2 text-center ${cognitiveLevelColors.evaluating.bg} ${cognitiveLevelColors.evaluating.text}`}>
                                                {row.evaluating || '-'}
                                            </td>
                                            <td className={`p-2 text-center ${cognitiveLevelColors.creating.bg} ${cognitiveLevelColors.creating.text}`}>
                                                {row.creating || '-'}
                                            </td>
                                            <td className="p-2 text-center font-medium">{row.total}</td>
                                            <td className="p-2 text-center text-muted-foreground">{row.percentage.toFixed(1)}%</td>
                                        </tr>
                                    ))}
                                    <tr className="border-t-2 bg-muted font-medium">
                                        <td className="p-2">Total</td>
                                        {cognitiveLevels.map((level) => {
                                            const dist = distribution.find((d) => d.cognitive_level === level);
                                            return (
                                                <td key={level} className="p-2 text-center">
                                                    {dist?.count || 0}
                                                </td>
                                            );
                                        })}
                                        <td className="p-2 text-center">{statistics.total_objectives}</td>
                                        <td className="p-2 text-center">100%</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Distribution and Balance */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Distribution */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Cognitive Level Distribution</CardTitle>
                            <CardDescription>Breakdown by Bloom's taxonomy level</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {distribution.map((item) => {
                                const colors = cognitiveLevelColors[item.cognitive_level];
                                return (
                                    <div key={item.cognitive_level} className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="font-medium capitalize">{item.cognitive_level}</span>
                                            <span className="text-muted-foreground">
                                                {item.count} ({item.percentage.toFixed(1)}%)
                                            </span>
                                        </div>
                                        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                                            <div
                                                className={`h-full ${colors.bg.replace('50', '500').replace('dark:bg-', 'dark:bg-').replace('950', '600')}`}
                                                style={{ width: `${item.percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </CardContent>
                    </Card>

                    {/* Balance Status */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Balance Analysis</CardTitle>
                            <CardDescription>Ideal range: 10-25% per level</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {balance.map((item) => {
                                const colors = cognitiveLevelColors[item.level];
                                const percentage = (item.count / statistics.total_objectives) * 100;
                                return (
                                    <div
                                        key={item.level}
                                        className={`flex items-center justify-between rounded-lg border p-3 ${colors.border}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            {item.status === 'balanced' ? (
                                                <CheckCircle2 className="size-5 text-green-600 dark:text-green-400" />
                                            ) : (
                                                <AlertCircle className={`size-5 ${item.status === 'over' ? 'text-orange-600 dark:text-orange-400' : 'text-yellow-600 dark:text-yellow-400'}`} />
                                            )}
                                            <div>
                                                <div className="font-medium capitalize">{item.level}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {item.count} objectives ({percentage.toFixed(1)}%)
                                                </div>
                                            </div>
                                        </div>
                                        <Badge
                                            variant={item.status === 'balanced' ? 'default' : 'secondary'}
                                            className={
                                                item.status === 'balanced'
                                                    ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300'
                                                    : item.status === 'over'
                                                      ? 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300'
                                                      : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300'
                                            }
                                        >
                                            {item.status === 'balanced' ? 'Balanced' : item.status === 'over' ? 'Over-represented' : 'Under-represented'}
                                        </Badge>
                                    </div>
                                );
                            })}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
