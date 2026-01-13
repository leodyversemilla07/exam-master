import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from '@/components/ui/empty';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { Module, Topic, LearningObjective, CognitiveLevel } from '@/types/models';
import { Calculator, TrendingUp, AlertCircle, CheckCircle2, Plus, BookOpen } from 'lucide-react';
import PageHeader from '@/components/page-header';

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

const cognitiveLevelColors: Record<
    CognitiveLevel,
    { bg: string; text: string; border: string; bar: string }
> = {
    remembering: {
        bg: 'bg-primary/10',
        text: 'text-primary',
        border: 'border-primary/20',
        bar: 'bg-primary',
    },
    understanding: {
        bg: 'bg-success/10',
        text: 'text-success',
        border: 'border-success/20',
        bar: 'bg-success',
    },
    applying: {
        bg: 'bg-warning/10',
        text: 'text-warning',
        border: 'border-warning/20',
        bar: 'bg-warning',
    },
    analyzing: { bg: 'bg-info/10', text: 'text-info', border: 'border-info/20', bar: 'bg-info' },
    evaluating: {
        bg: 'bg-secondary/10',
        text: 'text-secondary',
        border: 'border-secondary/20',
        bar: 'bg-secondary',
    },
    creating: {
        bg: 'bg-destructive/10',
        text: 'text-destructive',
        border: 'border-destructive/20',
        bar: 'bg-destructive',
    },
};

const cognitiveLevels: CognitiveLevel[] = [
    'remembering',
    'understanding',
    'applying',
    'analyzing',
    'evaluating',
    'creating',
];

export default function TosCalculatorIndex({
    module,
    matrix,
    distribution,
    statistics,
    balance,
}: PageProps) {
    const breadcrumbs = [
        { title: 'Modules', href: '/modules' },
        { title: module.name, href: `/modules/${module.id}` },
        { title: 'TOS Calculator', href: `/tos-calculator/${module.id}` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`TOS Calculator - ${module.name}`} />

            <div className="p-4 md:p-6 space-y-6">
                {/* Header */}
                <PageHeader
                    title="TOS Calculator"
                    description={
                        <>
                            Table of Specifications for <strong>{module.code}</strong> -{' '}
                            {module.name}
                        </>
                    }
                />

                {/* Empty State */}
                {statistics.total_objectives === 0 && (
                    <Empty>
                        <EmptyHeader>
                            <EmptyMedia variant="icon">
                                <BookOpen className="size-8" />
                            </EmptyMedia>
                            <EmptyTitle>No Topics or Learning Objectives Yet</EmptyTitle>
                            <EmptyDescription>
                                To use the TOS Calculator, you need to add topics and learning
                                objectives to this module first. These will be used to analyze the
                                distribution across Bloom's taxonomy levels.
                            </EmptyDescription>
                        </EmptyHeader>
                        <EmptyContent>
                            <div className="flex gap-2">
                                <Link href={`/modules/${module.id}`}>
                                    <Button>
                                        <Plus className="mr-2 size-4" />
                                        Add Topics & Objectives
                                    </Button>
                                </Link>
                                <Link href="/modules">
                                    <Button variant="outline">Back to Modules</Button>
                                </Link>
                            </div>
                        </EmptyContent>
                    </Empty>
                )}

                {/* Statistics Cards - Only show if there are objectives */}
                {statistics.total_objectives > 0 && (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Total Objectives
                                </CardTitle>
                                <TrendingUp className="size-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {statistics.total_objectives}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Across {statistics.total_topics} topics
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Average per Topic
                                </CardTitle>
                                <Calculator className="size-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {isNaN(statistics.average_per_topic)
                                        ? '0.0'
                                        : statistics.average_per_topic.toFixed(1)}
                                </div>
                                <p className="text-xs text-muted-foreground">Learning objectives</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Most Used Level
                                </CardTitle>
                                <TrendingUp className="size-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold capitalize">
                                    {statistics.total_objectives > 0
                                        ? statistics.most_used_level
                                        : 'N/A'}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {statistics.total_objectives > 0
                                        ? "Bloom's taxonomy"
                                        : 'No objectives yet'}
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Least Used Level
                                </CardTitle>
                                <AlertCircle className="size-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold capitalize">
                                    {statistics.total_objectives > 0
                                        ? statistics.least_used_level
                                        : 'N/A'}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {statistics.total_objectives > 0
                                        ? 'Consider balancing'
                                        : 'No objectives yet'}
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* TOS Matrix - Only show if there are objectives */}
                {statistics.total_objectives > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Table of Specifications Matrix</CardTitle>
                            <CardDescription>
                                Distribution of learning objectives across topics and cognitive
                                levels
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse text-sm">
                                    <thead>
                                        <tr className="border-b bg-muted/50">
                                            <th className="p-2 text-left font-medium">Topic</th>
                                            {cognitiveLevels.map((level) => (
                                                <th
                                                    key={level}
                                                    className="p-2 text-center font-medium capitalize"
                                                >
                                                    {level.slice(0, 3)}
                                                </th>
                                            ))}
                                            <th className="p-2 text-center font-medium">Total</th>
                                            <th className="p-2 text-center font-medium">%</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {matrix.map((row) => (
                                            <tr
                                                key={row.topic_id}
                                                className="border-b hover:bg-muted/50"
                                            >
                                                <td className="p-2">
                                                    <div className="font-medium">
                                                        {row.topic_code}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {row.topic_title}
                                                    </div>
                                                </td>
                                                <td
                                                    className={`p-2 text-center ${cognitiveLevelColors.remembering.bg} ${cognitiveLevelColors.remembering.text}`}
                                                >
                                                    {row.remembering || '-'}
                                                </td>
                                                <td
                                                    className={`p-2 text-center ${cognitiveLevelColors.understanding.bg} ${cognitiveLevelColors.understanding.text}`}
                                                >
                                                    {row.understanding || '-'}
                                                </td>
                                                <td
                                                    className={`p-2 text-center ${cognitiveLevelColors.applying.bg} ${cognitiveLevelColors.applying.text}`}
                                                >
                                                    {row.applying || '-'}
                                                </td>
                                                <td
                                                    className={`p-2 text-center ${cognitiveLevelColors.analyzing.bg} ${cognitiveLevelColors.analyzing.text}`}
                                                >
                                                    {row.analyzing || '-'}
                                                </td>
                                                <td
                                                    className={`p-2 text-center ${cognitiveLevelColors.evaluating.bg} ${cognitiveLevelColors.evaluating.text}`}
                                                >
                                                    {row.evaluating || '-'}
                                                </td>
                                                <td
                                                    className={`p-2 text-center ${cognitiveLevelColors.creating.bg} ${cognitiveLevelColors.creating.text}`}
                                                >
                                                    {row.creating || '-'}
                                                </td>
                                                <td className="p-2 text-center font-medium">
                                                    {row.total}
                                                </td>
                                                <td className="p-2 text-center text-muted-foreground">
                                                    {isNaN(row.percentage)
                                                        ? '0.0'
                                                        : row.percentage.toFixed(1)}
                                                    %
                                                </td>
                                            </tr>
                                        ))}
                                        <tr className="border-t-2 bg-muted font-medium">
                                            <td className="p-2">Total</td>
                                            {cognitiveLevels.map((level) => {
                                                const dist = distribution.find(
                                                    (d) => d.cognitive_level === level,
                                                );
                                                return (
                                                    <td key={level} className="p-2 text-center">
                                                        {dist?.count || 0}
                                                    </td>
                                                );
                                            })}
                                            <td className="p-2 text-center">
                                                {statistics.total_objectives}
                                            </td>
                                            <td className="p-2 text-center">100%</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Distribution and Balance - Only show if there are objectives */}
                {statistics.total_objectives > 0 && (
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Distribution */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Cognitive Level Distribution</CardTitle>
                                <CardDescription>
                                    Breakdown by Bloom's taxonomy level
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {distribution.map((item) => {
                                    const colors = cognitiveLevelColors[item.cognitive_level];
                                    const percentage = isNaN(item.percentage) ? 0 : item.percentage;
                                    return (
                                        <div key={item.cognitive_level} className="space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="font-medium capitalize">
                                                    {item.cognitive_level}
                                                </span>
                                                <span className="text-muted-foreground">
                                                    {item.count} ({percentage.toFixed(1)}%)
                                                </span>
                                            </div>
                                            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                                                <div
                                                    className={`h-full ${colors.bar}`}
                                                    style={{ width: `${percentage}%` }}
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
                                    const percentage =
                                        statistics.total_objectives > 0
                                            ? (item.count / statistics.total_objectives) * 100
                                            : 0;
                                    return (
                                        <div
                                            key={item.level}
                                            className={`flex items-center justify-between rounded-lg border p-3 ${colors.border}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                {item.status === 'balanced' ? (
                                                    <CheckCircle2 className="size-5 text-success" />
                                                ) : (
                                                    <AlertCircle
                                                        className={`size-5 ${item.status === 'over' ? 'text-destructive' : 'text-warning'}`}
                                                    />
                                                )}
                                                <div>
                                                    <div className="font-medium capitalize">
                                                        {item.level}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {item.count} objectives (
                                                        {percentage.toFixed(1)}%)
                                                    </div>
                                                </div>
                                            </div>
                                            <Badge
                                                variant={
                                                    item.status === 'balanced'
                                                        ? 'default'
                                                        : 'secondary'
                                                }
                                                className={
                                                    item.status === 'balanced'
                                                        ? 'bg-success/10 text-success border-success/20'
                                                        : item.status === 'over'
                                                          ? 'bg-destructive/10 text-destructive border-destructive/20'
                                                          : 'bg-warning/10 text-warning border-warning/20'
                                                }
                                            >
                                                {item.status === 'balanced'
                                                    ? 'Balanced'
                                                    : item.status === 'over'
                                                      ? 'Over-represented'
                                                      : 'Under-represented'}
                                            </Badge>
                                        </div>
                                    );
                                })}
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
