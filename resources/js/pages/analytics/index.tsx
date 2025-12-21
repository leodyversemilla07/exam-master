import AppLayout from "@/layouts/app-layout";
import { PageProps } from "@/types";
import { Head } from "@inertiajs/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import PageHeader from "@/components/page-header";
import { 
    BarChart3, 
    Download, 
    TrendingUp, 
    Users, 
    BookOpen,
    FileText
} from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";
import { ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { Badge } from "@/components/ui/badge";

const breadcrumbs = [{ title: "Analytics & Reports", href: "/analytics" }];

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

export default function AnalyticsIndex({}: PageProps) {
    const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year'>('month');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [examsData, setExamsData] = useState<ExamsCreatedData | null>(null);
    const [usageData, setUsageData] = useState<UsageData | null>(null);
    const [educatorData, setEducatorData] = useState<EducatorActivityData | null>(null);
    const [loading, setLoading] = useState(false);

    // Fetch exams created data
    const fetchExamsData = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/analytics/exams-created', {
                params: { period, start_date: startDate || undefined, end_date: endDate || undefined }
            });
            setExamsData(response.data);
        } catch (error) {
            console.error('Failed to fetch exams data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch most used modules and topics
    const fetchUsageData = async () => {
        try {
            const response = await axios.get('/analytics/modules-topics', {
                params: { limit: 10 }
            });
            setUsageData(response.data);
        } catch (error) {
            console.error('Failed to fetch usage data:', error);
        }
    };

    // Fetch educator activity
    const fetchEducatorActivity = async () => {
        try {
            const response = await axios.get('/analytics/educator-activity', {
                params: { start_date: startDate || undefined, end_date: endDate || undefined }
            });
            setEducatorData(response.data);
        } catch (error) {
            console.error('Failed to fetch educator activity:', error);
        }
    };

    // Export to CSV
    const handleExport = (type: 'exams_created' | 'modules_topics' | 'educator_activity') => {
        const params = new URLSearchParams({
            type,
            ...(startDate && { start_date: startDate }),
            ...(endDate && { end_date: endDate }),
        });
        window.location.href = `/analytics/export-csv?${params.toString()}`;
    };

    useEffect(() => {
        fetchExamsData();
        fetchUsageData();
        fetchEducatorActivity();
    }, []);

    const formatChartData = () => {
        if (!examsData) return [];
        
        return examsData.data.map((item) => {
            let label = '';
            if (period === 'day') {
                label = item.date || '';
            } else if (period === 'week') {
                label = `Week ${item.week}`;
            } else if (period === 'month') {
                const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
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
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Analytics & Reports" />

            <div className="p-4 md:p-6">
                <div className="space-y-6">
                {/* Header */}
                <PageHeader
                    title="Analytics & Reports"
                    description="Comprehensive insights into exam creation and system usage"
                    actions={
                        <Button variant="outline" onClick={() => fetchExamsData()}>
                            <TrendingUp className="mr-2 h-4 w-4" />
                            Refresh
                        </Button>
                    }
                />

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle>Filters</CardTitle>
                        <CardDescription>Customize your analytics view</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-4">
                            <div className="space-y-2">
                                <Label htmlFor="period">Period</Label>
                                <Select value={period} onValueChange={(val) => setPeriod(val as any)}>
                                    <SelectTrigger id="period">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="day">Daily</SelectItem>
                                        <SelectItem value="week">Weekly</SelectItem>
                                        <SelectItem value="month">Monthly</SelectItem>
                                        <SelectItem value="year">Yearly</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="start_date">Start Date</Label>
                                <Input
                                    id="start_date"
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="end_date">End Date</Label>
                                <Input
                                    id="end_date"
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                />
                            </div>
                            <div className="flex items-end">
                                <Button onClick={() => {
                                    fetchExamsData();
                                    fetchEducatorActivity();
                                }} className="w-full">
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
                                <BarChart3 className="h-5 w-5" />
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
                                onClick={() => handleExport('exams_created')}
                            >
                                <Download className="mr-2 h-4 w-4" />
                                Export CSV
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex items-center justify-center h-75">
                                <p className="text-muted-foreground">Loading...</p>
                            </div>
                        ) : examsData ? (
                            <>
                                <div className="mb-4">
                                    <p className="text-2xl font-bold">{examsData.total}</p>
                                    <p className="text-sm text-muted-foreground">Total exams created</p>
                                </div>
                                <div className="h-75">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={formatChartData()}>
                                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                            <XAxis 
                                                dataKey="name" 
                                                className="text-xs"
                                                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                                            />
                                            <YAxis 
                                                className="text-xs"
                                                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                                            />
                                            <ChartTooltip content={<ChartTooltipContent />} />
                                            <Bar 
                                                dataKey="count" 
                                                fill="hsl(var(--primary))" 
                                                radius={[4, 4, 0, 0]}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center justify-center h-75">
                                <p className="text-muted-foreground">No data available</p>
                            </div>
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
                                    <BookOpen className="h-5 w-5" />
                                    Most Used Modules
                                </CardTitle>
                                <CardDescription>Top 10 modules by TOS generation</CardDescription>
                            </div>
                            <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleExport('modules_topics')}
                            >
                                <Download className="h-4 w-4" />
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {usageData?.modules.slice(0, 10).map((module, index) => (
                                    <div key={module.id} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Badge variant="outline" className="w-8 h-8 flex items-center justify-center rounded-full">
                                                {index + 1}
                                            </Badge>
                                            <div>
                                                <p className="font-medium text-sm">{module.code}</p>
                                                <p className="text-xs text-muted-foreground line-clamp-1">
                                                    {module.title}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="secondary">
                                                {module.tos_generates_count} TOS
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                                {(!usageData?.modules || usageData.modules.length === 0) && (
                                    <p className="text-sm text-muted-foreground text-center py-8">
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
                                <FileText className="h-5 w-5" />
                                Most Used Topics
                            </CardTitle>
                            <CardDescription>Top 10 topics by question usage</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {usageData?.topics.slice(0, 10).map((topic, index) => (
                                    <div key={topic.id} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Badge variant="outline" className="w-8 h-8 flex items-center justify-center rounded-full">
                                                {index + 1}
                                            </Badge>
                                            <div>
                                                <p className="font-medium text-sm">{topic.code}</p>
                                                <p className="text-xs text-muted-foreground line-clamp-1">
                                                    {topic.title}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="secondary">
                                                {topic.usage_count} questions
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                                {(!usageData?.topics || usageData.topics.length === 0) && (
                                    <p className="text-sm text-muted-foreground text-center py-8">
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
                                <Users className="h-5 w-5" />
                                Educator Activity
                            </CardTitle>
                            <CardDescription>
                                Track educator productivity and engagement
                            </CardDescription>
                        </div>
                        <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleExport('educator_activity')}
                        >
                            <Download className="mr-2 h-4 w-4" />
                            Export CSV
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/50">
                                        <th className="p-3 text-left font-medium">Educator</th>
                                        <th className="p-3 text-left font-medium">Email</th>
                                        <th className="p-3 text-right font-medium">TOS Created</th>
                                        <th className="p-3 text-right font-medium">Exams Created</th>
                                        <th className="p-3 text-right font-medium">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {educatorData?.educators.map((educator) => (
                                        <tr key={educator.id} className="border-b last:border-0 hover:bg-muted/50">
                                            <td className="p-3 font-medium">{educator.name}</td>
                                            <td className="p-3 text-muted-foreground">{educator.email}</td>
                                            <td className="p-3 text-right">
                                                <Badge variant="outline">{educator.tos_created}</Badge>
                                            </td>
                                            <td className="p-3 text-right">
                                                <Badge variant="outline">{educator.exams_created}</Badge>
                                            </td>
                                            <td className="p-3 text-right">
                                                <Badge>
                                                    {educator.tos_created + educator.exams_created}
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {(!educatorData?.educators || educatorData.educators.length === 0) && (
                                <p className="text-sm text-muted-foreground text-center py-8">
                                    No educator activity in the selected period
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    </AppLayout>
    );
}
