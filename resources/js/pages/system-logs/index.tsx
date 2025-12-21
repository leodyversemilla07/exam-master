import AppLayout from "@/layouts/app-layout";
import { PageProps } from "@/types";
import { Head } from "@inertiajs/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
    ChevronUp
} from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";

interface LogEntry {
    timestamp: string;
    environment: string;
    level: string;
    message: string;
    stack_trace: string;
}

const levelColors: Record<string, string> = {
    EMERGENCY: "bg-red-600 text-white",
    ALERT: "bg-red-500 text-white",
    CRITICAL: "bg-red-500 text-white",
    ERROR: "bg-red-400 text-white",
    WARNING: "bg-yellow-500 text-white",
    NOTICE: "bg-blue-400 text-white",
    INFO: "bg-blue-500 text-white",
    DEBUG: "bg-gray-500 text-white",
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

export default function SystemLogsIndex({ auth }: PageProps) {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [loading, setLoading] = useState(false);
    const [lines, setLines] = useState("100");
    const [level, setLevel] = useState("all");
    const [expandedLogs, setExpandedLogs] = useState<Set<number>>(new Set());
    const [total, setTotal] = useState(0);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/system-logs/logs', {
                params: { 
                    lines: parseInt(lines),
                    level: level === 'all' ? undefined : level 
                }
            });
            setLogs(response.data.logs || []);
            setTotal(response.data.total || 0);
        } catch (error) {
            console.error('Failed to fetch logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleClearLogs = async () => {
        if (!confirm('Are you sure you want to clear all logs? This action cannot be undone.')) {
            return;
        }
        
        try {
            await axios.post('/system-logs/clear');
            setLogs([]);
            setTotal(0);
        } catch (error) {
            console.error('Failed to clear logs:', error);
        }
    };

    const handleDownload = () => {
        window.location.href = '/system-logs/download';
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

    useEffect(() => {
        fetchLogs();
    }, []);

    return (
        <AppLayout user={auth.user}>
            <Head title="System Logs" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">System Logs</h1>
                        <p className="text-muted-foreground mt-1">
                            View and manage application logs
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleDownload}>
                            <Download className="mr-2 h-4 w-4" />
                            Download
                        </Button>
                        <Button variant="destructive" onClick={handleClearLogs}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Clear Logs
                        </Button>
                    </div>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle>Filters</CardTitle>
                        <CardDescription>Filter log entries by level and limit</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-4">
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
                            <div className="flex items-end">
                                <Button onClick={fetchLogs} disabled={loading} className="w-full">
                                    <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                                    {loading ? 'Loading...' : 'Refresh'}
                                </Button>
                            </div>
                            <div className="flex items-end">
                                <p className="text-sm text-muted-foreground">
                                    Showing {logs.length} of {total} entries
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
                    <CardContent>
                        {loading ? (
                            <div className="flex items-center justify-center h-[300px]">
                                <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                        ) : logs.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
                                <FileText className="h-12 w-12 mb-4" />
                                <p>No log entries found</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {logs.map((log, index) => (
                                    <div 
                                        key={index} 
                                        className="border rounded-lg overflow-hidden"
                                    >
                                        <div 
                                            className="flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/50"
                                            onClick={() => log.stack_trace && toggleExpand(index)}
                                        >
                                            <Badge className={`${levelColors[log.level] || 'bg-gray-500'} flex items-center gap-1`}>
                                                {levelIcons[log.level]}
                                                {log.level}
                                            </Badge>
                                            <span className="text-xs text-muted-foreground font-mono">
                                                {log.timestamp}
                                            </span>
                                            <span className="text-sm flex-1 truncate">
                                                {log.message}
                                            </span>
                                            {log.stack_trace && (
                                                <Button variant="ghost" size="sm">
                                                    {expandedLogs.has(index) ? (
                                                        <ChevronUp className="h-4 w-4" />
                                                    ) : (
                                                        <ChevronDown className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            )}
                                        </div>
                                        {expandedLogs.has(index) && log.stack_trace && (
                                            <div className="bg-muted/30 p-3 border-t">
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
        </AppLayout>
    );
}
