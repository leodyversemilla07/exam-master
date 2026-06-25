import { Head, router } from '@inertiajs/react';
import {
    BarChart3,
    Download,
    TrendingUp,
    BookOpen,
    FileText,
    BarChart,
    Users,
} from 'lucide-react';
import { useState } from 'react';
import { format } from 'date-fns';
import {
    Bar,
    BarChart as RechartsBarChart,
    CartesianGrid,
    XAxis,
    YAxis,
    ResponsiveContainer,
} from 'recharts';
import type { PageProps } from '@/types';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from '@/components/ui/empty';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';
import PageHeader from '@/components/page-header';
import * as analytics from '@/routes/analytics';
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart';
import { Badge } from '@/components/ui/badge';

interface ExamsCreatedData {
    period: string;
    data: Array<{
        date?: string;
        week?: string;
        month?: number;
        year?: number;
        count: number;
    }>;
    total: number;
}

interface ModuleUsage {
    id: number;
    code: string;
    title: string;
    tos_generates_count: number;
}

interface TopicUsage {
    id: number;
    code: string;
    title: string;
    usage_count: number;
}

interface UsageData {
    modules: ModuleUsage[];
    topics: TopicUsage[];
}

interface EducatorActivity {
    id: number;
    name: string;
    email: string;
    tos_created: number;
    exams_created: number;
}

interface EducatorActivityData {
    educators: EducatorActivity[];
    period: {
        start: string;
        end: string;
    };
}

interface AnalyticsPageProps extends PageProps {
    filters: {
        period: 'day' | 'week' | 'month' | 'year';
        start_date?: string;
        end_date?: string;
    };
    examsData?: ExamsCreatedData;
    usageData?: UsageData;
    educatorData?: EducatorActivityData;
}

export default function AnalyticsIndex({
    filters,
    examsData,
    usageData,
    educatorData,
}: AnalyticsPageProps) {
    const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year'>(
        filters.period,
    );
    const [startDate, setStartDate] = useState<Date | undefined>(
        filters.start_date ? new Date(filters.start_date) : undefined,
    );
    const [endDate, setEndDate] = useState<Date | undefined>(
        filters.end_date ? new Date(filters.end_date) : undefined,
    );

    // Apply filters using Inertia
    const applyFilters = () => {
        router.visit(analytics.index.url(), {
            data: {
                period,
                ...(startDate && {
                    start_date: format(startDate, 'yyyy-MM-dd'),
                }),
                ...(endDate && { end_date: format(endDate, 'yyyy-MM-dd') }),
            },
            preserveState: true,
            preserveScroll: true,
        });
    };

    // Export to CSV
    const handleExport = (
        type: 'exams_created' | 'modules_topics' | 'educator_activity',
    ) => {
        const url = analytics.exportCsv.url({
            query: {
                type,
                ...(startDate && {
                    start_date: format(startDate, 'yyyy-MM-dd'),
                }),
                ...(endDate && { end_date: format(endDate, 'yyyy-MM-dd') }),
            },
        });
        window.location.href = url;
    };

    const formatChartData = () => {
        if (!examsData) {
            return [];
        }

        return examsData.data.map((item) => {
            let label = '';

            if (period === 'day') {
                label = item.date || '';
            } else if (period === 'week') {
                label = `Week ${item.week}`;
            } else if (period === 'month') {
                const months = [
                    'Jan',
                    'Feb',
                    'Mar',
                    'Apr',
                    'May',
                    'Jun',
                    'Jul',
                    'Aug',
                    'Sep',
                    'Oct',
                    'Nov',
                    'Dec',
                ];
                label = `${months[(item.month || 1) - 1]} ${item.year}`;
            } else if (period === 'year') {
                label = `${item.year}`;
            }

            return {
                name: label,
                count: item.count,
            };
        });
    };

    return (
        <>
            <Head title="Analytics & Reports" />

            <div className="p-6 md:p-8">
                <div className="mx-auto max-w-7xl space-y-6">
                    {/* Header */}
                    <PageHeader
                        title="Analytics & Reports"
                        description="Comprehensive insights into exam creation and system usage"
                        actions={
                            <Button variant="outline" onClick={applyFilters}>
                                <TrendingUp className="mr-2 size-4" />
                                Refresh
                            </Button>
                        }
                    />

                    {/* Filters */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Filters</CardTitle>
                            <CardDescription>
                                Customize your analytics view
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-4">
                                <div className="space-y-2">
                                    <Label htmlFor="period">Period</Label>
                                    <Select
                                        value={period}
                                        onValueChange={(val) =>
                                            setPeriod(val as any)
                                        }
                                    >
                                        <SelectTrigger id="period">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="day">
                                                Daily
                                            </SelectItem>
                                            <SelectItem value="week">
                                                Weekly
                                            </SelectItem>
                                            <SelectItem value="month">
                                                Monthly
                                            </SelectItem>
                                            <SelectItem value="year">
                                                Yearly
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="start_date">
                                        Start Date
                                    </Label>
                                    <DatePicker
                                        date={startDate}
                                        onSelect={setStartDate}
                                        placeholder="Select start date"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="end_date">End Date</Label>
                                    <DatePicker
                                        date={endDate}
                                        onSelect={setEndDate}
                                        placeholder="Select end date"
                                    />
                                </div>
                                <div className="flex items-end">
                                    <Button
                                        onClick={applyFilters}
                                        className="w-full"
                                    >
                                        Apply Filters
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Exams Created Chart */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <BarChart3 className="size-5" />
                                    Exams Created
                                </CardTitle>
                                <CardDescription>
                                    Track exam creation over time
                                </CardDescription>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        handleExport('exams_created')
                                    }
                                >
                                    <Download className="mr-2 size-4" />
                                    Export CSV
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {examsData && examsData.data.length > 0 ? (
                                <>
                                    <div className="mb-4">
                                        <p className="text-2xl font-bold">
                                            {examsData.total}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Total exams created
                                        </p>
                                    </div>
                                    <ChartContainer
                                        config={{
                                            count: {
                                                label: 'Exams Created',
                                                color: 'hsl(var(--primary))',
                                            },
                                        }}
                                        className="h-75 w-full"
                                    >
                                        <ResponsiveContainer
                                            width="100%"
                                            height="100%"
                                        >
                                            <RechartsBarChart
                                                data={formatChartData()}
                                            >
                                                <CartesianGrid
                                                    strokeDasharray="3 3"
                                                    className="stroke-muted"
                                                />
                                                <XAxis
                                                    dataKey="name"
                                                    className="text-xs"
                                                    tick={{
                                                        fill: 'hsl(var(--muted-foreground))',
                                                    }}
                                                />
                                                <YAxis
                                                    className="text-xs"
                                                    tick={{
                                                        fill: 'hsl(var(--muted-foreground))',
                                                    }}
                                                />
                                                <ChartTooltip
                                                    content={
                                                        <ChartTooltipContent />
                                                    }
                                                />
                                                <Bar
                                                    dataKey="count"
                                                    fill="hsl(var(--primary))"
                                                    radius={[4, 4, 0, 0]}
                                                />
                                            </RechartsBarChart>
                                        </ResponsiveContainer>
                                    </ChartContainer>
                                </>
                            ) : (
                                <Empty>
                                    <EmptyHeader>
                                        <EmptyMedia variant="icon">
                                            <BarChart className="size-8" />
                                        </EmptyMedia>
                                        <EmptyTitle>
                                            No Data Available
                                        </EmptyTitle>
                                        <EmptyDescription>
                                            No exam data available for the
                                            selected period
                                        </EmptyDescription>
                                    </EmptyHeader>
                                </Empty>
                            )}
                        </CardContent>
                    </Card>

                    {/* Most Used Modules & Topics */}
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Modules */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <BookOpen className="size-5" />
                                        Most Used Modules
                                    </CardTitle>
                                    <CardDescription>
                                        Top 10 modules by TOS generation
                                    </CardDescription>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        handleExport('modules_topics')
                                    }
                                >
                                    <Download className="size-4" />
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {usageData?.modules
                                        .slice(0, 10)
                                        .map((module, index) => (
                                            <div
                                                key={module.id}
                                                className="flex items-center justify-between"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Badge
                                                        variant="outline"
                                                        className="flex h-8 w-8 items-center justify-center rounded-full"
                                                    >
                                                        {index + 1}
                                                    </Badge>
                                                    <div>
                                                        <p className="text-sm font-medium">
                                                            {module.code}
                                                        </p>
                                                        <p className="line-clamp-1 text-xs text-muted-foreground">
                                                            {module.title}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="secondary">
                                                        {
                                                            module.tos_generates_count
                                                        }{' '}
                                                        TOS
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))}
                                    {(!usageData?.modules ||
                                        usageData.modules.length === 0) && (
                                        <p className="py-8 text-center text-sm text-muted-foreground">
                                            No module data available
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Topics */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="size-5" />
                                    Most Used Topics
                                </CardTitle>
                                <CardDescription>
                                    Top 10 topics by question usage
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {usageData?.topics
                                        .slice(0, 10)
                                        .map((topic, index) => (
                                            <div
                                                key={topic.id}
                                                className="flex items-center justify-between"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Badge
                                                        variant="outline"
                                                        className="flex h-8 w-8 items-center justify-center rounded-full"
                                                    >
                                                        {index + 1}
                                                    </Badge>
                                                    <div>
                                                        <p className="text-sm font-medium">
                                                            {topic.code}
                                                        </p>
                                                        <p className="line-clamp-1 text-xs text-muted-foreground">
                                                            {topic.title}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="secondary">
                                                        {topic.usage_count}{' '}
                                                        questions
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))}
                                    {(!usageData?.topics ||
                                        usageData.topics.length === 0) && (
                                        <p className="py-8 text-center text-sm text-muted-foreground">
                                            No topic data available
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Educator Activity */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="size-5" />
                                    Educator Activity
                                </CardTitle>
                                <CardDescription>
                                    Track educator productivity and engagement
                                </CardDescription>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    handleExport('educator_activity')
                                }
                            >
                                <Download className="mr-2 size-4" />
                                Export CSV
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b bg-muted/50">
                                            <th className="p-3 text-left font-medium">
                                                Educator
                                            </th>
                                            <th className="p-3 text-left font-medium">
                                                Email
                                            </th>
                                            <th className="p-3 text-right font-medium">
                                                TOS Created
                                            </th>
                                            <th className="p-3 text-right font-medium">
                                                Exams Created
                                            </th>
                                            <th className="p-3 text-right font-medium">
                                                Total
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {educatorData?.educators.map(
                                            (educator) => (
                                                <tr
                                                    key={educator.id}
                                                    className="border-b last:border-0 hover:bg-muted/50"
                                                >
                                                    <td className="p-3 font-medium">
                                                        {educator.name}
                                                    </td>
                                                    <td className="p-3 text-muted-foreground">
                                                        {educator.email}
                                                    </td>
                                                    <td className="p-3 text-right">
                                                        <Badge variant="outline">
                                                            {
                                                                educator.tos_created
                                                            }
                                                        </Badge>
                                                    </td>
                                                    <td className="p-3 text-right">
                                                        <Badge variant="outline">
                                                            {
                                                                educator.exams_created
                                                            }
                                                        </Badge>
                                                    </td>
                                                    <td className="p-3 text-right">
                                                        <Badge>
                                                            {educator.tos_created +
                                                                educator.exams_created}
                                                        </Badge>
                                                    </td>
                                                </tr>
                                            ),
                                        )}
                                    </tbody>
                                </table>
                                {(!educatorData?.educators ||
                                    educatorData.educators.length === 0) && (
                                    <p className="py-8 text-center text-sm text-muted-foreground">
                                        No educator activity in the selected
                                        period
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

AnalyticsIndex.layout = {
    breadcrumbs: [
        { title: 'Analytics & Reports', href: analytics.index.url() },
    ],
};
