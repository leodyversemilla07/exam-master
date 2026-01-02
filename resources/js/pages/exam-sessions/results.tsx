import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
    ArrowLeft, 
    Download,
    Clock, 
    Users,
    CheckCircle,
    Search
} from 'lucide-react';
import { BreadcrumbItem } from '@/types';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import * as examSessions from '@/routes/exam-sessions';
import { useState, useMemo } from 'react';

interface User {
    id: number;
    name: string;
    email: string;
}

interface Answer {
    id: number;
    is_correct: boolean | null;
    points_earned: number;
    question: {
        id: number;
        question_text: string;
        points: number;
    };
}

interface AttemptWithDetails {
    id: number;
    exam_session_id: number;
    user_id: number;
    status: string;
    started_at: string;
    completed_at: string | null;
    submitted_at: string | null;
    attempt_number: number;
    score: number | null;
    total_points: number | null;
    percentage: number | null;
    time_spent_seconds: number | null;
    created_at: string;
    updated_at: string;
    user: User;
    answers: Answer[];
}

interface PaginatedAttempts {
    data: AttemptWithDetails[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface SessionWithExam {
    id: number;
    title: string;
    status: string;
    access_code: string;
    start_time: string;
    end_time: string;
    exam: {
        id: number;
        title: string;
        module: { id: number; name: string } | null;
    };
}

interface PageProps {
    session: SessionWithExam;
    attempts: PaginatedAttempts;
}

const breadcrumbs = (session: SessionWithExam): BreadcrumbItem[] => [
    { title: 'Exam Sessions', href: examSessions.index.url() },
    { title: session.title, href: examSessions.show.url(session.id) },
    { title: 'Results', href: examSessions.results.url(session.id) },
];

function getAttemptStatusBadge(status: string) {
    switch (status) {
        case 'in_progress':
            return <Badge variant="outline" className="gap-1 text-blue-600 border-blue-600"><Clock className="h-3 w-3" /> In Progress</Badge>;
        case 'submitted':
            return <Badge variant="secondary" className="gap-1"><CheckCircle className="h-3 w-3" /> Submitted</Badge>;
        case 'graded':
            return <Badge className="gap-1 bg-green-600"><CheckCircle className="h-3 w-3" /> Graded</Badge>;
        default:
            return <Badge variant="outline">{status}</Badge>;
    }
}

function getScoreColor(percentage: number): string {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 75) return 'text-blue-600';
    if (percentage >= 60) return 'text-amber-600';
    return 'text-red-600';
}

export default function Results({ session, attempts }: PageProps) {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredAttempts = useMemo(() => {
        if (!searchQuery) return attempts.data;
        const query = searchQuery.toLowerCase();
        return attempts.data.filter(
            attempt =>
                attempt.user.name.toLowerCase().includes(query) ||
                attempt.user.email.toLowerCase().includes(query)
        );
    }, [attempts.data, searchQuery]);

    const handleExport = () => {
        window.location.href = examSessions.exportResults.url(session.id);
    };

    const completedAttempts = attempts.data.filter(
        a => a.status === 'submitted' || a.status === 'graded'
    );

    const stats = useMemo(() => {
        if (completedAttempts.length === 0) {
            return { average: 0, highest: 0, lowest: 0, passing: 0 };
        }
        const percentages = completedAttempts.map(a => a.percentage || 0);
        return {
            average: percentages.reduce((a, b) => a + b, 0) / percentages.length,
            highest: Math.max(...percentages),
            lowest: Math.min(...percentages),
            passing: percentages.filter(p => p >= 60).length,
        };
    }, [completedAttempts]);

    return (
        <AppLayout breadcrumbs={breadcrumbs(session)}>
            <Head title={`Results - ${session.title}`} />

            <div className="p-4 md:p-6">
                <div className="mx-auto max-w-7xl">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <Button variant="outline" size="icon" asChild>
                                <Link href={examSessions.show.url(session.id)}>
                                    <ArrowLeft className="h-4 w-4" />
                                </Link>
                            </Button>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight">Exam Results</h1>
                                <p className="text-muted-foreground">
                                    {session.title} • {session.exam.title}
                                </p>
                            </div>
                        </div>
                        <Button onClick={handleExport} disabled={completedAttempts.length === 0}>
                            <Download className="mr-2 h-4 w-4" />
                            Export CSV
                        </Button>
                    </div>

                    {/* Summary Stats */}
                    <div className="grid gap-4 md:grid-cols-4 mb-6">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{completedAttempts.length}</div>
                                <p className="text-xs text-muted-foreground">
                                    of {attempts.total} total attempts
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className={`text-2xl font-bold ${getScoreColor(stats.average)}`}>
                                    {stats.average.toFixed(1)}%
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Highest / Lowest</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    <span className="text-green-600">{stats.highest.toFixed(0)}%</span>
                                    {' / '}
                                    <span className="text-red-600">{stats.lowest.toFixed(0)}%</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Passing Rate</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {completedAttempts.length > 0
                                        ? ((stats.passing / completedAttempts.length) * 100).toFixed(0)
                                        : 0}%
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {stats.passing} of {completedAttempts.length} passed (≥60%)
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Results Table */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>All Attempts</CardTitle>
                                    <CardDescription>
                                        Detailed results for each student attempt
                                    </CardDescription>
                                </div>
                                <div className="relative w-64">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search by name or email..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-9"
                                    />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {filteredAttempts.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <Users className="h-12 w-12 text-muted-foreground mb-4" />
                                    <h3 className="font-semibold mb-2">
                                        {searchQuery ? 'No Matching Results' : 'No Attempts Yet'}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        {searchQuery
                                            ? 'Try a different search term.'
                                            : 'Students have not yet taken this exam.'}
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Student</TableHead>
                                                <TableHead>Attempt</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Score</TableHead>
                                                <TableHead>Percentage</TableHead>
                                                <TableHead>Correct/Total</TableHead>
                                                <TableHead>Time Spent</TableHead>
                                                <TableHead>Submitted</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredAttempts.map((attempt) => {
                                                const correctAnswers = attempt.answers.filter(a => a.is_correct === true).length;
                                                const totalAnswers = attempt.answers.length;
                                                
                                                return (
                                                    <TableRow key={attempt.id}>
                                                        <TableCell>
                                                            <div>
                                                                <div className="font-medium">{attempt.user.name}</div>
                                                                <div className="text-sm text-muted-foreground">
                                                                    {attempt.user.email}
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant="outline">
                                                                #{attempt.attempt_number}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            {getAttemptStatusBadge(attempt.status)}
                                                        </TableCell>
                                                        <TableCell>
                                                            {attempt.score !== null ? (
                                                                <span className="font-medium">
                                                                    {attempt.score.toFixed(1)}
                                                                </span>
                                                            ) : (
                                                                <span className="text-muted-foreground">—</span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            {attempt.percentage !== null ? (
                                                                <span className={`font-bold ${getScoreColor(attempt.percentage)}`}>
                                                                    {attempt.percentage.toFixed(1)}%
                                                                </span>
                                                            ) : (
                                                                <span className="text-muted-foreground">—</span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            {attempt.status !== 'in_progress' ? (
                                                                <div className="flex items-center gap-2">
                                                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                                                    <span>{correctAnswers}</span>
                                                                    <span className="text-muted-foreground">/</span>
                                                                    <span>{totalAnswers}</span>
                                                                </div>
                                                            ) : (
                                                                <span className="text-muted-foreground">—</span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            {attempt.time_spent_seconds ? (
                                                                <div className="flex items-center gap-1">
                                                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                                                    {Math.floor(attempt.time_spent_seconds / 60)} min
                                                                </div>
                                                            ) : (
                                                                <span className="text-muted-foreground">—</span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            {attempt.submitted_at ? (
                                                                <div className="text-sm">
                                                                    {new Date(attempt.submitted_at).toLocaleDateString()}
                                                                    <br />
                                                                    <span className="text-muted-foreground">
                                                                        {new Date(attempt.submitted_at).toLocaleTimeString([], {
                                                                            hour: '2-digit',
                                                                            minute: '2-digit',
                                                                        })}
                                                                    </span>
                                                                </div>
                                                            ) : (
                                                                <span className="text-muted-foreground">In progress</span>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>

                                    {/* Pagination */}
                                    {attempts.last_page > 1 && !searchQuery && (
                                        <div className="flex items-center justify-center gap-2 mt-6">
                                            {attempts.links.map((link, i) => (
                                                <Button
                                                    key={i}
                                                    variant={link.active ? 'default' : 'outline'}
                                                    size="sm"
                                                    disabled={!link.url}
                                                    asChild={!!link.url}
                                                >
                                                    {link.url ? (
                                                        <Link href={link.url} dangerouslySetInnerHTML={{ __html: link.label }} />
                                                    ) : (
                                                        <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                                    )}
                                                </Button>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
