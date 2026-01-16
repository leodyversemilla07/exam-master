import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from '@/components/ui/empty';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import PageHeader from '@/components/page-header';
import { BreadcrumbItem } from '@/types';
import {
    FileText,
    Download,
    Trash2,
    RefreshCw,
    AlertCircle,
    AlertTriangle,
    Info,
    Bug,
    ChevronDown,
    ChevronUp,
} from 'lucide-react';
import { useState } from 'react';
import { getLogs, clearLogs, downloadLogs } from '@/actions/App/Http/Controllers/SystemLogsController';

interface LogEntry {
    timestamp: string;
    environment: string;
    level: string;
    message: string;
    stack_trace: string;
}

interface SystemLogsProps {
    logs?: LogEntry[];
    total?: number;
    message?: string;
    error?: string;
    success?: boolean;
}

const levelColors: Record<string, string> = {
    EMERGENCY: 'bg-destructive text-destructive-foreground',
    ALERT: 'bg-destructive text-destructive-foreground',
    CRITICAL: 'bg-destructive text-destructive-foreground',
    ERROR: 'bg-destructive/80 text-destructive-foreground',
    WARNING: 'bg-warning text-warning-foreground',
    NOTICE: 'bg-info text-info-foreground',
    INFO: 'bg-info text-info-foreground',
    DEBUG: 'bg-muted text-muted-foreground',
};

const levelIcons: Record<string, React.ReactNode> = {
    EMERGENCY: <AlertCircle className="h-4 w-4" />,
    ALERT: <AlertCircle className="h-4 w-4" />,
    CRITICAL: <AlertCircle className="h-4 w-4" />,
    ERROR: <AlertTriangle className="h-4 w-4" />,
    WARNING: <AlertTriangle className="h-4 w-4" />,
    NOTICE: <Info className="h-4 w-4" />,
    INFO: <Info className="h-4 w-4" />,
    DEBUG: <Bug className="h-4 w-4" />,
};

const breadcrumbs: BreadcrumbItem[] = [{ title: 'System Logs', href: '/system-logs' }];

export default function SystemLogsIndex({ logs = [], total = 0 }: SystemLogsProps) {
    const [loading, setLoading] = useState(false);
    const [lines, setLines] = useState('100');
    const [level, setLevel] = useState('all');
    const [expandedLogs, setExpandedLogs] = useState<Set<number>>(new Set());
    const [showClearDialog, setShowClearDialog] = useState(false);

    const fetchLogs = () => {
        setLoading(true);
        router.get(
            getLogs.url(),
            {
                lines: parseInt(lines),
                level: level === 'all' ? undefined : level,
            },
            {
                preserveScroll: true,
                onFinish: () => {
                    setLoading(false);
                },
            }
        );
    };

    const handleClearLogs = () => {
        router.post(clearLogs.url(), {}, {
            preserveScroll: true,
            onSuccess: () => {
                setShowClearDialog(false);
            },
        });
    };

    const handleDownload = () => {
        window.location.href = downloadLogs.url();
    };

    const toggleExpand = (index: number) => {
        const newExpanded = new Set(expandedLogs);
        if (newExpanded.has(index)) {
            newExpanded.delete(index);
        } else {
            newExpanded.add(index);
        }
        setExpandedLogs(newExpanded);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="System Logs" />

            <div className="p-6 md:p-8">
                <div className="mx-auto max-w-7xl space-y-6">
                    <PageHeader
                        title="System Logs"
                        description="View and manage application logs"
                        actions={
                            <>
                                <Button variant="outline" onClick={handleDownload}>
                                    <Download className="mr-2 h-4 w-4" />
                                    Download
                                </Button>
                                <Button variant="destructive" onClick={() => setShowClearDialog(true)}>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Clear Logs
                                </Button>
                            </>
                        }
                    />

                    {/* Filters */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Filters</CardTitle>
                            <CardDescription>Filter log entries by level and limit</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="flex flex-col gap-6">
                                <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="level">Log Level</Label>
                                        <Select value={level} onValueChange={setLevel}>
                                            <SelectTrigger id="level">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Levels</SelectItem>
                                                <SelectItem value="emergency">Emergency</SelectItem>
                                                <SelectItem value="alert">Alert</SelectItem>
                                                <SelectItem value="critical">Critical</SelectItem>
                                                <SelectItem value="error">Error</SelectItem>
                                                <SelectItem value="warning">Warning</SelectItem>
                                                <SelectItem value="notice">Notice</SelectItem>
                                                <SelectItem value="info">Info</SelectItem>
                                                <SelectItem value="debug">Debug</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="lines">Lines to Load</Label>
                                        <Select value={lines} onValueChange={setLines}>
                                            <SelectTrigger id="lines">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="50">50 lines</SelectItem>
                                                <SelectItem value="100">100 lines</SelectItem>
                                                <SelectItem value="200">200 lines</SelectItem>
                                                <SelectItem value="500">500 lines</SelectItem>
                                                <SelectItem value="1000">1000 lines</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2 md:col-span-1">
                                        <Label>&nbsp;</Label>
                                        <Button
                                            onClick={fetchLogs}
                                            disabled={loading}
                                            className="w-full"
                                        >
                                            <RefreshCw
                                                className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`}
                                            />
                                            {loading ? 'Loading...' : 'Refresh'}
                                        </Button>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between pt-2 border-t">
                                    <p className="text-sm text-muted-foreground">
                                        Showing <span className="font-medium text-foreground">{logs.length}</span> of{' '}
                                        <span className="font-medium text-foreground">{total}</span> entries
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Last refreshed: {new Date().toLocaleTimeString()}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Log Entries */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Log Entries
                            </CardTitle>
                            <CardDescription>
                                Recent application log entries (newest first)
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-6">
                            {loading ? (
                                <Empty>
                                    <EmptyHeader>
                                        <EmptyMedia variant="icon">
                                            <RefreshCw className="size-8 animate-spin" />
                                        </EmptyMedia>
                                        <EmptyTitle>Loading...</EmptyTitle>
                                        <EmptyDescription>Fetching log entries</EmptyDescription>
                                    </EmptyHeader>
                                </Empty>
                            ) : logs.length === 0 ? (
                                <Empty>
                                    <EmptyHeader>
                                        <EmptyMedia variant="icon">
                                            <FileText className="size-8" />
                                        </EmptyMedia>
                                        <EmptyTitle>No Log Entries Found</EmptyTitle>
                                        <EmptyDescription>
                                            There are no log entries matching your filters
                                        </EmptyDescription>
                                    </EmptyHeader>
                                </Empty>
                            ) : (
                                <div className="space-y-3">
                                    {logs.map((log, index) => (
                                        <div
                                            key={index}
                                            className="border rounded-lg overflow-hidden"
                                        >
                                            <div
                                                className="flex items-center gap-4 p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                                                onClick={() =>
                                                    log.stack_trace && toggleExpand(index)
                                                }
                                            >
                                                <Badge
                                                    className={`${levelColors[log.level] || 'bg-muted'} flex items-center gap-1 shrink-0`}
                                                >
                                                    {levelIcons[log.level]}
                                                    {log.level}
                                                </Badge>
                                                <span className="text-xs text-muted-foreground font-mono shrink-0">
                                                    {log.timestamp}
                                                </span>
                                                <span className="text-sm flex-1 truncate">
                                                    {log.message}
                                                </span>
                                                {log.stack_trace && (
                                                    <Button variant="ghost" size="sm" className="shrink-0">
                                                        {expandedLogs.has(index) ? (
                                                            <ChevronUp className="h-4 w-4" />
                                                        ) : (
                                                            <ChevronDown className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                )}
                                            </div>
                                            {expandedLogs.has(index) && log.stack_trace && (
                                                <div className="bg-muted/30 p-4 border-t">
                                                    <pre className="text-xs font-mono overflow-x-auto whitespace-pre-wrap text-muted-foreground">
                                                        {log.stack_trace}
                                                    </pre>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Clear System Logs</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to clear all logs? This action cannot be undone and all log entries will be permanently deleted.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleClearLogs} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Clear Logs
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
