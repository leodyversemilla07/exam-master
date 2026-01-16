import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
    Activity,
    RefreshCw,
    Trash2,
    RotateCcw,
    AlertCircle,
    CheckCircle,
    Clock,
    XCircle,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { getStats, retryJob, deleteJob, clearFailedJobs } from '@/actions/App/Http/Controllers/QueueMonitorController';

interface QueueStats {
    failed_jobs: number;
    pending_jobs: number;
    total_jobs: number;
}

interface FailedJob {
    id: number;
    uuid: string;
    connection: string;
    queue: string;
    exception: string;
    failed_at: string;
}

interface QueueMonitorProps {
    stats?: QueueStats;
    recent_failed?: FailedJob[];
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Queue Monitor', href: '/queue-monitor' }];

export default function QueueMonitorIndex({ stats: initialStats, recent_failed = [] }: QueueMonitorProps) {
    const [stats, setStats] = useState<QueueStats | null>(initialStats || null);
    const [failedJobs, setFailedJobs] = useState<FailedJob[]>(recent_failed);
    const [loading, setLoading] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showClearDialog, setShowClearDialog] = useState(false);
    const [selectedJobId, setSelectedJobId] = useState<number | null>(null);

    const fetchStats = () => {
        setLoading(true);
        router.get(
            getStats.url(),
            {},
            {
                preserveScroll: true,
                onFinish: () => {
                    setLoading(false);
                },
            }
        );
    };

    const handleRetryJob = (id: number) => {
        router.post(
            retryJob.url(),
            { id },
            {
                preserveScroll: true,
            }
        );
    };

    const confirmDeleteJob = () => {
        if (selectedJobId) {
            router.delete(
                deleteJob.url(),
                {
                    data: { id: selectedJobId },
                    preserveScroll: true,
                    onSuccess: () => {
                        setShowDeleteDialog(false);
                        setSelectedJobId(null);
                    },
                }
            );
        }
    };

    const confirmClearAll = () => {
        router.post(
            clearFailedJobs.url(),
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    setShowClearDialog(false);
                },
            }
        );
    };

    useEffect(() => {
        if (initialStats) {
            setStats(initialStats);
        }
        setFailedJobs(recent_failed);
    }, [initialStats, recent_failed]);

    useEffect(() => {
        // Auto-refresh every 30 seconds
        const interval = setInterval(fetchStats, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Queue Monitor" />

            <div className="p-6 md:p-8">
                <div className="mx-auto max-w-7xl space-y-6">
                    {/* Header */}
                    <PageHeader
                        title="Queue Monitor"
                        description="Monitor background jobs and queue status"
                        actions={
                            <>
                                <Button variant="outline" onClick={fetchStats} disabled={loading}>
                                    <RefreshCw
                                        className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`}
                                    />
                                    Refresh
                                </Button>
                                {failedJobs.length > 0 && (
                                    <Button variant="destructive" onClick={() => setShowClearDialog(true)}>
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Clear All Failed
                                    </Button>
                                )}
                            </>
                        }
                    />

                    {/* Stats Cards */}
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Pending Jobs</CardTitle>
                                <Clock className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats?.pending_jobs ?? '-'}</div>
                                <p className="text-xs text-muted-foreground">
                                    Jobs waiting to be processed
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Failed Jobs</CardTitle>
                                <XCircle className="h-4 w-4 text-destructive" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-destructive">
                                    {stats?.failed_jobs ?? '-'}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Jobs that encountered errors
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Queue Status</CardTitle>
                                <Activity className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-2">
                                    {stats?.failed_jobs === 0 ? (
                                        <>
                                            <CheckCircle className="h-5 w-5 text-success" />
                                            <span className="text-lg font-semibold text-success">
                                                Healthy
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <AlertCircle className="h-5 w-5 text-warning" />
                                            <span className="text-lg font-semibold text-warning">
                                                Attention Needed
                                            </span>
                                        </>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {stats?.total_jobs ?? 0} total jobs in queue
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Failed Jobs Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertCircle className="h-5 w-5 text-destructive" />
                                Failed Jobs
                            </CardTitle>
                            <CardDescription>Recent failed jobs that need attention</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6">
                            {loading ? (
                                <Empty>
                                    <EmptyHeader>
                                        <EmptyMedia variant="icon">
                                            <RefreshCw className="size-8 animate-spin" />
                                        </EmptyMedia>
                                        <EmptyTitle>Loading...</EmptyTitle>
                                        <EmptyDescription>Fetching queue statistics</EmptyDescription>
                                    </EmptyHeader>
                                </Empty>
                            ) : failedJobs.length === 0 ? (
                                <Empty>
                                    <EmptyHeader>
                                        <EmptyMedia variant="icon">
                                            <CheckCircle className="size-8 text-success" />
                                        </EmptyMedia>
                                        <EmptyTitle className="text-success">No Failed Jobs!</EmptyTitle>
                                        <EmptyDescription>
                                            All queue jobs are running smoothly
                                        </EmptyDescription>
                                    </EmptyHeader>
                                </Empty>
                            ) : (
                                <div className="rounded-md border">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b bg-muted/50">
                                                <th className="p-3 text-left font-medium">ID</th>
                                                <th className="p-3 text-left font-medium">Queue</th>
                                                <th className="p-3 text-left font-medium">Error</th>
                                                <th className="p-3 text-left font-medium">Failed At</th>
                                                <th className="p-3 text-right font-medium">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {failedJobs.map((job) => (
                                                <tr
                                                    key={job.id}
                                                    className="border-b last:border-0 hover:bg-muted/50"
                                                >
                                                    <td className="p-3 font-mono text-xs">{job.id}</td>
                                                    <td className="p-3">
                                                        <Badge variant="outline">{job.queue}</Badge>
                                                    </td>
                                                    <td className="p-3">
                                                        <p
                                                            className="text-xs text-muted-foreground max-w-md truncate"
                                                            title={job.exception}
                                                        >
                                                            {job.exception}
                                                        </p>
                                                    </td>
                                                    <td className="p-3 text-xs text-muted-foreground">
                                                        {new Date(job.failed_at).toLocaleString()}
                                                    </td>
                                                    <td className="p-3 text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleRetryJob(job.id)}
                                                            >
                                                                <RotateCcw className="h-3 w-3" />
                                                            </Button>
                                                            <Button
                                                                variant="destructive"
                                                                size="sm"
                                                                onClick={() => {
                                                                    setSelectedJobId(job.id);
                                                                    setShowDeleteDialog(true);
                                                                }}
                                                            >
                                                                <Trash2 className="h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Queue Worker Instructions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Queue Worker Commands</CardTitle>
                            <CardDescription>
                                Useful commands for managing the queue worker
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="rounded-lg border p-4">
                                    <h4 className="font-medium mb-2">Start Queue Worker</h4>
                                    <code className="text-xs bg-muted px-2 py-1 rounded block">
                                        php artisan queue:work
                                    </code>
                                </div>
                                <div className="rounded-lg border p-4">
                                    <h4 className="font-medium mb-2">Retry All Failed Jobs</h4>
                                    <code className="text-xs bg-muted px-2 py-1 rounded block">
                                        php artisan queue:retry all
                                    </code>
                                </div>
                                <div className="rounded-lg border p-4">
                                    <h4 className="font-medium mb-2">Clear Failed Jobs</h4>
                                    <code className="text-xs bg-muted px-2 py-1 rounded block">
                                        php artisan queue:flush
                                    </code>
                                </div>
                                <div className="rounded-lg border p-4">
                                    <h4 className="font-medium mb-2">Restart Workers</h4>
                                    <code className="text-xs bg-muted px-2 py-1 rounded block">
                                        php artisan queue:restart
                                    </code>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Failed Job</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this failed job? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDeleteJob} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Clear All Failed Jobs</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to clear all failed jobs? This action cannot be undone and all failed job records will be permanently deleted.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmClearAll} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Clear All
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
