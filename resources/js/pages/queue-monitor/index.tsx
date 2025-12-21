import AppLayout from "@/layouts/app-layout";
import { PageProps } from "@/types";
import { Head } from "@inertiajs/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
    Activity, 
    RefreshCw,
    Trash2,
    RotateCcw,
    AlertCircle,
    CheckCircle,
    Clock,
    XCircle
} from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";

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

export default function QueueMonitorIndex({ auth }: PageProps) {
    const [stats, setStats] = useState<QueueStats | null>(null);
    const [failedJobs, setFailedJobs] = useState<FailedJob[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/queue-monitor/stats');
            setStats(response.data.stats);
            setFailedJobs(response.data.recent_failed || []);
        } catch (error) {
            console.error('Failed to fetch queue stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRetryJob = async (id: number) => {
        try {
            await axios.post('/queue-monitor/retry', { id });
            fetchStats();
        } catch (error) {
            console.error('Failed to retry job:', error);
        }
    };

    const handleDeleteJob = async (id: number) => {
        if (!confirm('Are you sure you want to delete this failed job?')) {
            return;
        }
        
        try {
            await axios.delete('/queue-monitor/job', { data: { id } });
            fetchStats();
        } catch (error) {
            console.error('Failed to delete job:', error);
        }
    };

    const handleClearAllFailed = async () => {
        if (!confirm('Are you sure you want to clear all failed jobs? This action cannot be undone.')) {
            return;
        }
        
        try {
            await axios.post('/queue-monitor/clear');
            fetchStats();
        } catch (error) {
            console.error('Failed to clear failed jobs:', error);
        }
    };

    useEffect(() => {
        fetchStats();
        
        // Auto-refresh every 30 seconds
        const interval = setInterval(fetchStats, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <AppLayout user={auth.user}>
            <Head title="Queue Monitor" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Queue Monitor</h1>
                        <p className="text-muted-foreground mt-1">
                            Monitor background jobs and queue status
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={fetchStats} disabled={loading}>
                            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                        {failedJobs.length > 0 && (
                            <Button variant="destructive" onClick={handleClearAllFailed}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Clear All Failed
                            </Button>
                        )}
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Pending Jobs
                            </CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats?.pending_jobs ?? '-'}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Jobs waiting to be processed
                            </p>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Failed Jobs
                            </CardTitle>
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
                            <CardTitle className="text-sm font-medium">
                                Queue Status
                            </CardTitle>
                            <Activity className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                {stats?.failed_jobs === 0 ? (
                                    <>
                                        <CheckCircle className="h-5 w-5 text-green-500" />
                                        <span className="text-lg font-semibold text-green-500">Healthy</span>
                                    </>
                                ) : (
                                    <>
                                        <AlertCircle className="h-5 w-5 text-yellow-500" />
                                        <span className="text-lg font-semibold text-yellow-500">Attention Needed</span>
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
                        <CardDescription>
                            Recent failed jobs that need attention
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex items-center justify-center h-[200px]">
                                <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                        ) : failedJobs.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
                                <CheckCircle className="h-12 w-12 mb-4 text-green-500" />
                                <p className="text-green-600 font-medium">No failed jobs!</p>
                                <p className="text-sm">All queue jobs are running smoothly</p>
                            </div>
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
                                            <tr key={job.id} className="border-b last:border-0 hover:bg-muted/50">
                                                <td className="p-3 font-mono text-xs">
                                                    {job.id}
                                                </td>
                                                <td className="p-3">
                                                    <Badge variant="outline">{job.queue}</Badge>
                                                </td>
                                                <td className="p-3">
                                                    <p className="text-xs text-muted-foreground max-w-md truncate" title={job.exception}>
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
                                                            onClick={() => handleDeleteJob(job.id)}
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
                    <CardContent>
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
        </AppLayout>
    );
}
