import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    BookOpen,
    FileText,
    Download,
    ChevronRight,
    ChevronDown,
    Sparkles,
    Calculator,
    Search,
    Edit,
    ClipboardList,
    Stethoscope,
    Plus,
    Trash2,
    FolderTree,
    CheckCircle2,
    Clock,
    Users,
    AlertTriangle,
    FileQuestion,
    Copy,
    CheckCircle,
    XCircle,
    AlertCircle,
    Percent,
    BarChart3,
    ArrowLeft,
} from 'lucide-react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import type {
    Module,
    TosGenerate,
    ExamQuestion,
    Exam,
    ExamSession,
    Topic,
} from '@/types/models';

import type { BreadcrumbItem } from '@/types';
import WorkflowStepper from '@/components/workflow/WorkflowStepper';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

/* ─── Types ─── */

interface TopicSidebar {
    id: number;
    title: string;
    code: string;
    learning_objectives_count: number;
    children: {
        id: number;
        title: string;
        code: string;
        learning_objectives_count: number;
    }[];
}

interface TopicFull extends Topic {
    learning_objectives_count: number;
}

interface TosMatrixRow {
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
}

interface TosDistributionItem {
    cognitive_level: string;
    count: number;
    percentage: number;
}

interface TosStatistics {
    total_objectives: number;
    total_topics: number;
    average_per_topic: number;
}

interface TosBalanceItem {
    level: string;
    count: number;
    ideal_min: number;
    ideal_max: number;
    status: 'balanced' | 'under' | 'over';
}

interface DuplicateMatch {
    question: ExamQuestion;
    similarity_score: number;
    matching_aspects: string[];
}

interface DuplicateGroup {
    question: ExamQuestion;
    matches: DuplicateMatch[];
}

interface DuplicateStats {
    total_questions: number;
    duplicate_groups: number;
    highest_similarity: number;
    questions_with_duplicates: number;
}

interface SessionRow extends ExamSession {
    exam: {
        id: number;
        title: string;
        module: { id: number; name: string } | null;
    };
    creator: { id: number; name: string };
    attempts_count: number;
}

interface PageProps {
    module: Module & {
        creator?: { name: string };
        tos_generates?: TosGenerate[];
        questions_count?: number;
        exams_count?: number;
    };
    questions: {
        data: (ExamQuestion & { module: { code: string; name: string } })[];
        current_page: number;
        last_page: number;
        total: number;
    };
    exams: (Exam & {
        creator: { name: string };
        questions_count: number;
    })[];
    topics: TopicSidebar[];
    allTopics: TopicFull[];
    latestTos: (TosGenerate & { questions: ExamQuestion[] }) | null;
    latestExam: (Exam & { questions: ExamQuestion[] }) | null;
    availableQuestions: ExamQuestion[];
    sessions: SessionRow[];
    tosMatrix: TosMatrixRow[];
    tosDistribution: TosDistributionItem[];
    tosStatistics: TosStatistics;
    tosBalance: TosBalanceItem[];
    duplicates: DuplicateGroup[];
    duplicateStats: DuplicateStats;
}

/* ─── Helpers ─── */

function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

function getExamTypeIcon(type: string) {
    switch (type) {
        case 'formative':
            return <FileText className="size-4 text-blue-500" />;
        case 'summative':
            return <ClipboardList className="size-4 text-purple-500" />;
        case 'diagnostic':
            return <Stethoscope className="size-4 text-amber-500" />;
        default:
            return <FileText className="size-4 text-muted-foreground" />;
    }
}

function getSessionStatusBadge(session: ExamSession) {
    const now = new Date();
    const startTime = new Date(session.start_time);
    const endTime = new Date(session.end_time);

    if (session.status === 'ended' || now > endTime) {
        return (
            <Badge variant="secondary" className="gap-1">
                <XCircle className="size-3" /> Ended
            </Badge>
        );
    }

    if (session.status === 'draft') {
        return (
            <Badge variant="outline" className="gap-1">
                <AlertCircle className="size-3" /> Draft
            </Badge>
        );
    }

    if (now < startTime) {
        return (
            <Badge
                variant="outline"
                className="gap-1 border-blue-600 text-blue-600"
            >
                <Clock className="size-3" /> Upcoming
            </Badge>
        );
    }

    return (
        <Badge className="gap-1 bg-green-600">
            <CheckCircle className="size-3" /> Active
        </Badge>
    );
}

function getSimilarityColor(score: number): string {
    if (score >= 90) {
        return 'bg-destructive/10 text-destructive border-destructive/20';
    }

    if (score >= 75) {
        return 'bg-warning/10 text-warning border-warning/20';
    }

    if (score >= 60) {
        return 'bg-info/10 text-info border-info/20';
    }

    return 'bg-success/10 text-success border-success/20';
}

function getSimilarityLabel(score: number): string {
    if (score >= 90) {
        return 'Very High';
    }

    if (score >= 75) {
        return 'High';
    }

    if (score >= 60) {
        return 'Moderate';
    }

    return 'Low';
}

/* ─── Sidebar Topic Tree Item ─── */
function TopicItem({ topic }: { topic: TopicSidebar }) {
    const [expanded, setExpanded] = useState(false);
    const hasChildren = topic.children && topic.children.length > 0;

    return (
        <div>
            <button
                onClick={() => hasChildren && setExpanded(!expanded)}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-accent/50"
            >
                {hasChildren ? (
                    expanded ? (
                        <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
                    ) : (
                        <ChevronRight className="size-3.5 shrink-0 text-muted-foreground" />
                    )
                ) : (
                    <span className="size-3.5 shrink-0" />
                )}
                <span className="flex-1 truncate">{topic.title}</span>
                {topic.learning_objectives_count > 0 && (
                    <span className="text-xs text-muted-foreground">
                        {topic.learning_objectives_count}
                    </span>
                )}
            </button>
            {expanded && hasChildren && (
                <div className="ml-4 space-y-0.5 border-l pl-2">
                    {topic.children.map((child) => (
                        <div
                            key={child.id}
                            className="flex items-center gap-2 rounded-md px-2 py-1 text-sm text-muted-foreground transition-colors hover:bg-accent/50"
                        >
                            <span className="size-3.5 shrink-0" />
                            <span className="flex-1 truncate">
                                {child.title}
                            </span>
                            {child.learning_objectives_count > 0 && (
                                <span className="text-xs">
                                    {child.learning_objectives_count}
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

/* ─── Studio Action Card ─── */
function StudioCard({
    icon,
    label,
    href,
    colorClass,
    onClick,
}: {
    icon: React.ReactNode;
    label: string;
    href?: string;
    colorClass: string;
    onClick?: () => void;
}) {
    const className =
        'flex flex-col items-center gap-2 rounded-xl border p-3 hover:bg-accent/50 transition-colors text-center group';

    if (onClick) {
        return (
            <button type="button" onClick={onClick} className={className}>
                <div className={`rounded-lg p-2 ${colorClass}`}>{icon}</div>
                <span className="text-xs font-medium">{label}</span>
            </button>
        );
    }

    return (
        <Link href={href ?? '#'} className={className}>
            <div className={`rounded-lg p-2 ${colorClass}`}>{icon}</div>
            <span className="text-xs font-medium">{label}</span>
        </Link>
    );
}

/* ─── Topic Form (inline) ─── */
function TopicFormPanel({
    module,
    topic,
    allTopics,
    onCancel,
}: {
    module: Module;
    topic?: TopicFull;
    allTopics: TopicFull[];
    onCancel: () => void;
}) {
    const isEditing = !!topic;

    const form = useForm({
        code: topic?.code ?? '',
        title: topic?.title ?? '',
        description: topic?.description ?? '',
        parent_id: topic?.parent_id?.toString() ?? '',
        hours_allocated: topic?.hours_allocated?.toString() ?? '',
        weight_percentage: topic?.weight_percentage?.toString() ?? '',
        is_active: topic?.is_active ?? true,
    });

    const availableParents = allTopics.filter((t) => {
        if (isEditing) {
            return t.id !== topic!.id && t.parent_id !== topic!.id;
        }

        return true;
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEditing) {
            form.put(`/modules/${module.id}/topics/${topic!.id}`, {
                preserveScroll: true,
            });
        } else {
            form.post(`/modules/${module.id}/topics`, { preserveScroll: true });
        }
    };

    return (
        <div className="max-w-2xl p-6">
            <div className="mb-6 flex items-center gap-3">
                <Button variant="ghost" size="icon" onClick={onCancel}>
                    <ArrowLeft className="size-4" />
                </Button>
                <div>
                    <h2 className="text-lg font-semibold">
                        {isEditing ? 'Edit Topic' : 'Create Topic'}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        {isEditing
                            ? `Update topic details for ${module.name}`
                            : `Add a new topic to ${module.name}`}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle>Topic Information</CardTitle>
                        <CardDescription>
                            Enter the details for this topic. Topics can be
                            organized hierarchically.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="topic-code">Topic Code *</Label>
                                <Input
                                    id="topic-code"
                                    value={form.data.code}
                                    onChange={(e) =>
                                        form.setData('code', e.target.value)
                                    }
                                    placeholder="e.g., T1, T2.1"
                                    required
                                />
                                {form.errors.code && (
                                    <p className="text-sm text-destructive">
                                        {form.errors.code}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="topic-parent">
                                    Parent Topic
                                </Label>
                                <Select
                                    value={form.data.parent_id || 'none'}
                                    onValueChange={(value) =>
                                        form.setData(
                                            'parent_id',
                                            value === 'none' ? '' : value,
                                        )
                                    }
                                >
                                    <SelectTrigger id="topic-parent">
                                        <SelectValue placeholder="None (Root Topic)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">
                                            None (Root Topic)
                                        </SelectItem>
                                        {availableParents.map((t) => (
                                            <SelectItem
                                                key={t.id}
                                                value={t.id.toString()}
                                            >
                                                {t.code} - {t.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="topic-title">Topic Title *</Label>
                            <Input
                                id="topic-title"
                                value={form.data.title}
                                onChange={(e) =>
                                    form.setData('title', e.target.value)
                                }
                                placeholder="e.g., Introduction to Algebra"
                                required
                            />
                            {form.errors.title && (
                                <p className="text-sm text-destructive">
                                    {form.errors.title}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="topic-description">
                                Description
                            </Label>
                            <Textarea
                                id="topic-description"
                                value={form.data.description}
                                onChange={(e) =>
                                    form.setData('description', e.target.value)
                                }
                                placeholder="Brief description of this topic..."
                                rows={3}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="topic-hours">
                                    Hours Allocated
                                </Label>
                                <Input
                                    id="topic-hours"
                                    type="number"
                                    min="0"
                                    step="0.5"
                                    value={form.data.hours_allocated}
                                    onChange={(e) =>
                                        form.setData(
                                            'hours_allocated',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="e.g., 4"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="topic-weight">Weight (%)</Label>
                                <Input
                                    id="topic-weight"
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.1"
                                    value={form.data.weight_percentage}
                                    onChange={(e) =>
                                        form.setData(
                                            'weight_percentage',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="e.g., 25"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <Label htmlFor="topic-active">
                                    Active Status
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    Inactive topics won't appear in TOS
                                    generation
                                </p>
                            </div>
                            <Switch
                                id="topic-active"
                                checked={form.data.is_active}
                                onCheckedChange={(checked) =>
                                    form.setData('is_active', checked)
                                }
                            />
                        </div>
                    </CardContent>
                </Card>

                <div className="mt-6 flex items-center justify-end gap-4">
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={form.processing}>
                        {form.processing
                            ? 'Saving...'
                            : isEditing
                              ? 'Update Topic'
                              : 'Create Topic'}
                    </Button>
                </div>
            </form>
        </div>
    );
}

/* ─── Topics Tab Content ─── */
function TopicsTabContent({
    module,
    allTopics,
}: {
    module: Module;
    allTopics: TopicFull[];
}) {
    const [panel, setPanel] = useState<'list' | 'create' | 'edit'>('list');
    const [editingTopic, setEditingTopic] = useState<TopicFull | undefined>(
        undefined,
    );

    if (panel === 'create') {
        return (
            <TopicFormPanel
                module={module}
                allTopics={allTopics}
                onCancel={() => setPanel('list')}
            />
        );
    }

    if (panel === 'edit' && editingTopic) {
        return (
            <TopicFormPanel
                module={module}
                topic={editingTopic}
                allTopics={allTopics}
                onCancel={() => setPanel('list')}
            />
        );
    }

    const rootTopics = allTopics.filter((t) => !t.parent_id);

    const renderTopicRow = (
        topic: TopicFull,
        level: number = 0,
    ): React.ReactNode => {
        const children = allTopics.filter((t) => t.parent_id === topic.id);

        return (
            <div key={topic.id} className="group">
                <Card className={`mb-2 ${level > 0 ? 'ml-8' : ''}`}>
                    <CardContent className="flex items-center justify-between p-4">
                        <div className="flex flex-1 items-center gap-4">
                            {children.length > 0 && (
                                <FolderTree className="h-4 w-4 shrink-0 text-muted-foreground" />
                            )}
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <Badge
                                        variant="outline"
                                        className="font-mono text-xs"
                                    >
                                        {topic.code}
                                    </Badge>
                                    <h3 className="font-semibold">
                                        {topic.title}
                                    </h3>
                                    {!topic.is_active && (
                                        <Badge variant="secondary">
                                            Inactive
                                        </Badge>
                                    )}
                                </div>
                                {topic.description && (
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        {topic.description}
                                    </p>
                                )}
                                <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                                    {topic.hours_allocated && (
                                        <div className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            <span>
                                                {topic.hours_allocated}h
                                            </span>
                                        </div>
                                    )}
                                    {topic.weight_percentage && (
                                        <div className="flex items-center gap-1">
                                            <Percent className="h-3 w-3" />
                                            <span>
                                                {topic.weight_percentage}%
                                            </span>
                                        </div>
                                    )}
                                    {topic.learning_objectives_count > 0 && (
                                        <span>
                                            {topic.learning_objectives_count}{' '}
                                            objectives
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setEditingTopic(topic);
                                    setPanel('edit');
                                }}
                            >
                                <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    if (
                                        confirm(
                                            `Delete topic "${topic.title}"? This cannot be undone.`,
                                        )
                                    ) {
                                        router.delete(
                                            `/modules/${module.id}/topics/${topic.id}`,
                                            {
                                                preserveScroll: true,
                                            },
                                        );
                                    }
                                }}
                            >
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {children.length > 0 && (
                    <div className="ml-8 border-l-2 border-border pl-4">
                        {children.map((child) =>
                            renderTopicRow(child, level + 1),
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="p-6">
            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                    Topics ({allTopics.length})
                </h2>
                <Button size="sm" onClick={() => setPanel('create')}>
                    <Plus className="mr-2 size-4" />
                    Add Topic
                </Button>
            </div>

            {rootTopics.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="mb-4 rounded-2xl bg-muted/50 p-5">
                        <FolderTree className="size-10 text-muted-foreground" />
                    </div>
                    <h3 className="mb-1 font-medium">No topics yet</h3>
                    <p className="mb-4 max-w-sm text-sm text-muted-foreground">
                        Organize your module by creating topics and subtopics.
                    </p>
                    <Button size="sm" onClick={() => setPanel('create')}>
                        <Plus className="mr-2 size-4" />
                        Add Topic
                    </Button>
                </div>
            ) : (
                <div className="space-y-2">
                    {rootTopics.map((t) => renderTopicRow(t))}
                </div>
            )}
        </div>
    );
}

/* ─── Sessions Tab Content ─── */
function SessionsTabContent({
    sessions,
    moduleId,
}: {
    sessions: SessionRow[];
    moduleId: number;
}) {
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    const copyAccessCode = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    return (
        <div className="p-6">
            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                    Exam Sessions ({sessions.length})
                </h2>
                <Button asChild size="sm">
                    <Link href={`/modules/${moduleId}`}>
                        <Plus className="mr-2 size-4" />
                        Create Session
                    </Link>
                </Button>
            </div>

            {sessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="mb-4 rounded-2xl bg-muted/50 p-5">
                        <Clock className="size-10 text-muted-foreground" />
                    </div>
                    <h3 className="mb-1 font-medium">No sessions yet</h3>
                    <p className="mb-4 max-w-sm text-sm text-muted-foreground">
                        Create an exam session to allow students to take exams
                        online.
                    </p>
                </div>
            ) : (
                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Session</TableHead>
                                    <TableHead>Exam</TableHead>
                                    <TableHead>Access Code</TableHead>
                                    <TableHead>Schedule</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-center">
                                        Attempts
                                    </TableHead>
                                    <TableHead className="text-right">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sessions.map((session) => (
                                    <TableRow key={session.id}>
                                        <TableCell>
                                            <div className="font-medium">
                                                {session.title}
                                            </div>
                                            {session.description && (
                                                <div className="max-w-44 truncate text-sm text-muted-foreground">
                                                    {session.description}
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">
                                                {session.exam.title}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() =>
                                                                copyAccessCode(
                                                                    session.access_code,
                                                                )
                                                            }
                                                            className="gap-2 font-mono"
                                                        >
                                                            {
                                                                session.access_code
                                                            }
                                                            {copiedCode ===
                                                            session.access_code ? (
                                                                <CheckCircle className="size-4 text-green-600" />
                                                            ) : (
                                                                <Copy className="size-4" />
                                                            )}
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        {copiedCode ===
                                                        session.access_code
                                                            ? 'Copied!'
                                                            : 'Click to copy'}
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm">
                                                <div>
                                                    {new Date(
                                                        session.start_time,
                                                    ).toLocaleDateString()}{' '}
                                                    {new Date(
                                                        session.start_time,
                                                    ).toLocaleTimeString([], {
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </div>
                                                <div className="text-muted-foreground">
                                                    to{' '}
                                                    {new Date(
                                                        session.end_time,
                                                    ).toLocaleDateString()}{' '}
                                                    {new Date(
                                                        session.end_time,
                                                    ).toLocaleTimeString([], {
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {getSessionStatusBadge(session)}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <Users className="size-4 text-muted-foreground" />
                                                {session.attempts_count}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    asChild
                                                >
                                                    <Link
                                                        href={`/exam-sessions/${session.id}`}
                                                    >
                                                        <Edit className="size-4" />
                                                    </Link>
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="icon"
                                                    disabled={
                                                        session.attempts_count >
                                                        0
                                                    }
                                                    onClick={() => {
                                                        if (
                                                            confirm(
                                                                `Delete session "${session.title}"?`,
                                                            )
                                                        ) {
                                                            router.delete(
                                                                `/exam-sessions/${session.id}`,
                                                                {
                                                                    preserveScroll: true,
                                                                },
                                                            );
                                                        }
                                                    }}
                                                >
                                                    <Trash2 className="size-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

/* ─── TOS Calculator Tab Content ─── */
function TosCalculatorTabContent({
    matrix,
    distribution,
    statistics,
    balance,
}: {
    matrix: TosMatrixRow[];
    distribution: TosDistributionItem[];
    statistics: TosStatistics;
    balance: TosBalanceItem[];
}) {
    const cogLevels = [
        'remembering',
        'understanding',
        'applying',
        'analyzing',
        'evaluating',
        'creating',
    ];

    const getBalanceColor = (status: string) => {
        if (status === 'balanced') {
            return 'text-success';
        }

        if (status === 'over') {
            return 'text-destructive';
        }

        return 'text-warning';
    };

    return (
        <div className="space-y-6 p-6">
            <h2 className="text-lg font-semibold">TOS Calculator</h2>

            {/* Stats row */}
            <div className="grid gap-4 sm:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Objectives
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {statistics.total_objectives}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Active learning objectives
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">
                            Topics Covered
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {statistics.total_topics}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            With objectives
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">
                            Avg per Topic
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {statistics.average_per_topic.toFixed(1)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Objectives per topic
                        </p>
                    </CardContent>
                </Card>
            </div>

            {matrix.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="mb-4 rounded-2xl bg-muted/50 p-5">
                        <Calculator className="size-10 text-muted-foreground" />
                    </div>
                    <h3 className="mb-1 font-medium">No TOS data yet</h3>
                    <p className="max-w-sm text-sm text-muted-foreground">
                        Add topics with active learning objectives to see the
                        TOS matrix.
                    </p>
                </div>
            ) : (
                <>
                    {/* Matrix table */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">
                                TOS Matrix
                            </CardTitle>
                            <CardDescription>
                                Distribution of learning objectives by topic and
                                cognitive level
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="py-2 pr-4 text-left font-medium">
                                                Topic
                                            </th>
                                            {cogLevels.map((l) => (
                                                <th
                                                    key={l}
                                                    className="px-2 py-2 text-center font-medium capitalize"
                                                >
                                                    {l.slice(0, 3)}
                                                </th>
                                            ))}
                                            <th className="px-2 py-2 text-center font-medium">
                                                Total
                                            </th>
                                            <th className="px-2 py-2 text-center font-medium">
                                                %
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {matrix.map((row) => (
                                            <tr
                                                key={row.topic_id}
                                                className="border-b last:border-0 hover:bg-muted/30"
                                            >
                                                <td className="py-2 pr-4">
                                                    <div className="font-medium">
                                                        {row.topic_title}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {row.topic_code}
                                                    </div>
                                                </td>
                                                {cogLevels.map((l) => (
                                                    <td
                                                        key={l}
                                                        className="px-2 py-2 text-center"
                                                    >
                                                        {(row as any)[l] || '-'}
                                                    </td>
                                                ))}
                                                <td className="px-2 py-2 text-center font-medium">
                                                    {row.total}
                                                </td>
                                                <td className="px-2 py-2 text-center text-muted-foreground">
                                                    {row.percentage.toFixed(1)}%
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Distribution */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <BarChart3 className="size-4" />
                                Cognitive Level Distribution
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {distribution.map((item) => (
                                <div key={item.cognitive_level}>
                                    <div className="mb-1 flex items-center justify-between text-sm">
                                        <span className="font-medium capitalize">
                                            {item.cognitive_level}
                                        </span>
                                        <span className="text-muted-foreground">
                                            {item.count} (
                                            {item.percentage.toFixed(1)}%)
                                        </span>
                                    </div>
                                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                                        <div
                                            className="h-full rounded-full bg-primary transition-all"
                                            style={{
                                                width: `${item.percentage}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Balance analysis */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">
                                Balance Analysis
                            </CardTitle>
                            <CardDescription>
                                Ideal range: 10–25% per cognitive level
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {balance.map((item) => (
                                <div
                                    key={item.level}
                                    className="flex items-center justify-between rounded-lg border p-3"
                                >
                                    <div>
                                        <p className="font-medium capitalize">
                                            {item.level}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {item.count} objectives
                                        </p>
                                    </div>
                                    <Badge
                                        variant="outline"
                                        className={getBalanceColor(item.status)}
                                    >
                                        {item.status}
                                    </Badge>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    );
}

/* ─── Duplicate Detection Tab Content ─── */
function DuplicateDetectionTabContent({
    duplicates,
    statistics,
}: {
    duplicates: DuplicateGroup[];
    statistics: DuplicateStats;
}) {
    return (
        <div className="space-y-6 p-6">
            <h2 className="text-lg font-semibold">Duplicate Detection</h2>

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Questions
                        </CardTitle>
                        <FileQuestion className="size-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {statistics.total_questions}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            In question bank
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Duplicate Groups
                        </CardTitle>
                        <AlertTriangle className="size-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {statistics.duplicate_groups}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Questions with matches
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Highest Similarity
                        </CardTitle>
                        <AlertTriangle className="size-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {statistics.highest_similarity.toFixed(1)}%
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Maximum detected
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Questions Flagged
                        </CardTitle>
                        <AlertTriangle className="size-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {statistics.questions_with_duplicates}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Need review
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Groups */}
            {duplicates.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <FileQuestion className="size-12 text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-medium">
                            No Duplicates Found
                        </h3>
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
                                        <CardTitle className="text-base">
                                            Question #{group.question.id}
                                        </CardTitle>
                                        <CardDescription className="mt-2 line-clamp-2">
                                            {group.question.question}
                                        </CardDescription>
                                    </div>
                                    <Badge variant="outline" className="ml-4">
                                        {group.matches.length}{' '}
                                        {group.matches.length === 1
                                            ? 'match'
                                            : 'matches'}
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
                                                        Question #
                                                        {match.question.id}
                                                    </span>
                                                    <Badge
                                                        variant="secondary"
                                                        className={getSimilarityColor(
                                                            match.similarity_score,
                                                        )}
                                                    >
                                                        {match.similarity_score.toFixed(
                                                            1,
                                                        )}
                                                        % -{' '}
                                                        {getSimilarityLabel(
                                                            match.similarity_score,
                                                        )}
                                                    </Badge>
                                                </div>
                                                <p className="mt-2 text-sm">
                                                    {match.question.question}
                                                </p>
                                                <div className="mt-3 flex flex-wrap gap-2">
                                                    {match.matching_aspects.map(
                                                        (
                                                            aspect,
                                                            aspectIndex,
                                                        ) => (
                                                            <Badge
                                                                key={
                                                                    aspectIndex
                                                                }
                                                                variant="outline"
                                                                className="text-xs"
                                                            >
                                                                {aspect}
                                                            </Badge>
                                                        ),
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-4 grid gap-4 border-t pt-4 md:grid-cols-2">
                                            <div>
                                                <h4 className="mb-2 text-xs font-medium text-muted-foreground uppercase">
                                                    Original
                                                </h4>
                                                <div className="space-y-1 text-sm">
                                                    <div>
                                                        <span className="font-medium">
                                                            Type:
                                                        </span>{' '}
                                                        {
                                                            group.question
                                                                .question_type
                                                        }
                                                    </div>
                                                    <div>
                                                        <span className="font-medium">
                                                            Difficulty:
                                                        </span>{' '}
                                                        <span className="capitalize">
                                                            {
                                                                group.question
                                                                    .difficulty
                                                            }
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="font-medium">
                                                            Cognitive:
                                                        </span>{' '}
                                                        <span className="capitalize">
                                                            {
                                                                group.question
                                                                    .cognitive_level
                                                            }
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                <h4 className="mb-2 text-xs font-medium text-muted-foreground uppercase">
                                                    Similar
                                                </h4>
                                                <div className="space-y-1 text-sm">
                                                    <div>
                                                        <span className="font-medium">
                                                            Type:
                                                        </span>{' '}
                                                        {
                                                            match.question
                                                                .question_type
                                                        }
                                                    </div>
                                                    <div>
                                                        <span className="font-medium">
                                                            Difficulty:
                                                        </span>{' '}
                                                        <span className="capitalize">
                                                            {
                                                                match.question
                                                                    .difficulty
                                                            }
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="font-medium">
                                                            Cognitive:
                                                        </span>{' '}
                                                        <span className="capitalize">
                                                            {
                                                                match.question
                                                                    .cognitive_level
                                                            }
                                                        </span>
                                                    </div>
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
                    <CardTitle className="text-base">
                        Similarity Score Legend
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="flex items-center gap-2">
                        <div className="size-4 rounded bg-success" />
                        <span className="text-sm">
                            <strong>Low (60-74%):</strong> Minor similarities
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="size-4 rounded bg-info" />
                        <span className="text-sm">
                            <strong>Moderate (75-89%):</strong> Notable overlap
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="size-4 rounded bg-warning" />
                        <span className="text-sm">
                            <strong>High (90-94%):</strong> Very similar
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="size-4 rounded bg-destructive" />
                        <span className="text-sm">
                            <strong>Very High (95%+):</strong> Near duplicates
                        </span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

/* ─── Main Page ─── */
export default function ModuleShow({
    module,
    questions,
    exams,
    topics,
    allTopics,
    latestTos,
    latestExam,
    availableQuestions,
    sessions,
    tosMatrix,
    tosDistribution,
    tosStatistics,
    tosBalance,
    duplicates,
    duplicateStats,
}: PageProps) {
    const [deletingModule, setDeletingModule] = useState(false);
    const [activeTab, setActiveTab] = useState<string>(() => {
        if (latestTos !== null && !(latestExam?.status === 'published')) {
            return 'workflow';
        }

        return 'tos';
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Modules', href: '/modules' },
        { title: module.code, href: `/modules/${module.id}` },
    ];

    const confirmDelete = () => {
        router.delete(`/modules/${module.id}`, {
            onSuccess: () => router.visit('/modules'),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${module.code} - ${module.name}`} />

            <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
                {/* ═══════════ LEFT PANEL — Sources ═══════════ */}
                <aside className="flex w-64 shrink-0 flex-col border-r">
                    <div className="border-b p-4">
                        <h2 className="truncate text-sm font-semibold">
                            {module.name}
                        </h2>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                            {module.code} · {module.subject_area}
                        </p>
                    </div>

                    <ScrollArea className="flex-1">
                        <div className="space-y-5 p-3">
                            {/* Sources / PDFs */}
                            <div>
                                <div className="mb-2 flex items-center justify-between">
                                    <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                        Sources
                                    </h3>
                                </div>
                                {module.pdf_file ? (
                                    <a
                                        href={`/storage/${module.pdf_file}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors hover:bg-accent/50"
                                    >
                                        <FileText className="size-4 shrink-0 text-primary" />
                                        <span className="flex-1 truncate">
                                            {module.pdf_file.split('/').pop()}
                                        </span>
                                        <Download className="size-3.5 text-muted-foreground opacity-0 group-hover:opacity-100" />
                                    </a>
                                ) : (
                                    <p className="px-2 py-2 text-xs text-muted-foreground">
                                        No PDF uploaded
                                    </p>
                                )}
                            </div>

                            {/* Topics Tree */}
                            <div>
                                <div className="mb-2 flex items-center justify-between">
                                    <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                        Topics
                                    </h3>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="size-6"
                                        onClick={() => setActiveTab('topics')}
                                    >
                                        <Plus className="size-3" />
                                    </Button>
                                </div>
                                {topics.length > 0 ? (
                                    <div className="space-y-0.5">
                                        {topics.map((topic) => (
                                            <TopicItem
                                                key={topic.id}
                                                topic={topic}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <p className="px-2 py-2 text-xs text-muted-foreground">
                                        No topics yet
                                    </p>
                                )}
                            </div>

                            {/* Module Stats */}
                            <div>
                                <h3 className="mb-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                    Stats
                                </h3>
                                <div className="space-y-1.5 px-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            Questions
                                        </span>
                                        <span className="font-medium">
                                            {module.questions_count || 0}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            Exams
                                        </span>
                                        <span className="font-medium">
                                            {module.exams_count || 0}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            Grade
                                        </span>
                                        <span className="font-medium">
                                            {module.grade_level}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            Year
                                        </span>
                                        <span className="font-medium">
                                            {module.curriculum_year}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </ScrollArea>
                </aside>

                {/* ═══════════ CENTER PANEL — Tabbed Content ═══════════ */}
                <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
                    <Tabs
                        value={activeTab}
                        onValueChange={setActiveTab}
                        className="flex flex-1 flex-col overflow-hidden"
                    >
                        <div className="overflow-x-auto border-b px-6 pt-4">
                            <TabsList className="h-auto gap-4 bg-transparent p-0">
                                {[
                                    ['tos', 'TOS'],
                                    ['questions', 'Questions'],
                                    ['exams', 'Exams'],
                                    ['topics', 'Topics'],
                                    ['sessions', 'Sessions'],
                                    ['tos-calculator', 'TOS Calc'],
                                    ['duplicates', 'Duplicates'],
                                    ['workflow', 'Workflow'],
                                ].map(([value, label]) => (
                                    <TabsTrigger
                                        key={value}
                                        value={value}
                                        className="rounded-none border-b-2 border-transparent px-1 pb-3 whitespace-nowrap data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                                    >
                                        {label}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </div>

                        {/* ── TOS Tab ── */}
                        <TabsContent
                            value="tos"
                            className="m-0 flex-1 overflow-auto"
                        >
                            <div className="p-6">
                                <div className="mb-6 flex items-center justify-between">
                                    <h2 className="text-lg font-semibold">
                                        Table of Specifications
                                    </h2>
                                    <Button asChild size="sm">
                                        <Link
                                            href={`/tos-generates/create?module=${module.id}`}
                                        >
                                            <Plus className="mr-2 size-4" />
                                            Generate TOS
                                        </Link>
                                    </Button>
                                </div>

                                {module.tos_generates &&
                                module.tos_generates.length > 0 ? (
                                    <div className="rounded-xl border">
                                        <div className="grid grid-cols-[1fr_80px_120px_100px_120px] gap-4 border-b px-6 py-3 text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                            <span>Subject</span>
                                            <span>Items</span>
                                            <span>Difficulty</span>
                                            <span>Status</span>
                                            <span>Created</span>
                                        </div>
                                        {module.tos_generates.map((tos) => (
                                            <Link
                                                key={tos.id}
                                                href={`/tos-generates/${tos.id}`}
                                                className="grid grid-cols-[1fr_80px_120px_100px_120px] items-center gap-4 border-b px-6 py-4 transition-colors last:border-0 hover:bg-accent/50"
                                            >
                                                <div className="flex min-w-0 items-center gap-2">
                                                    <FileText className="size-4 shrink-0 text-muted-foreground" />
                                                    <span className="truncate font-medium">
                                                        {tos.subject}
                                                    </span>
                                                </div>
                                                <span className="text-sm text-muted-foreground">
                                                    {tos.total_items}
                                                </span>
                                                <span className="text-sm text-muted-foreground capitalize">
                                                    {tos.difficulty_level}
                                                </span>
                                                <Badge
                                                    variant="outline"
                                                    className={
                                                        tos.status ===
                                                        'completed'
                                                            ? 'bg-success/10 text-success'
                                                            : 'bg-muted text-muted-foreground'
                                                    }
                                                >
                                                    {tos.status}
                                                </Badge>
                                                <span className="text-sm text-muted-foreground">
                                                    {formatDate(tos.created_at)}
                                                </span>
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-16 text-center">
                                        <div className="mb-4 rounded-2xl bg-muted/50 p-5">
                                            <FileText className="size-10 text-muted-foreground" />
                                        </div>
                                        <h3 className="mb-1 font-medium">
                                            No TOS generated yet
                                        </h3>
                                        <p className="mb-4 max-w-sm text-sm text-muted-foreground">
                                            Generate a Table of Specifications
                                            to define your assessment blueprint.
                                        </p>
                                        <Button asChild size="sm">
                                            <Link
                                                href={`/tos-generates/create?module=${module.id}`}
                                            >
                                                <Plus className="mr-2 size-4" />
                                                Generate TOS
                                            </Link>
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        {/* ── Questions Tab ── */}
                        <TabsContent
                            value="questions"
                            className="m-0 flex-1 overflow-auto"
                        >
                            <div className="p-6">
                                <div className="mb-6 flex items-center justify-between">
                                    <h2 className="text-lg font-semibold">
                                        Questions ({questions.total})
                                    </h2>
                                    <Button asChild size="sm">
                                        <Link
                                            href={`/question-bank/create?module=${module.id}`}
                                        >
                                            <Plus className="mr-2 size-4" />
                                            Create Question
                                        </Link>
                                    </Button>
                                </div>

                                {questions.data.length > 0 ? (
                                    <>
                                        <div className="rounded-xl border">
                                            <div className="grid grid-cols-[1fr_100px_100px_80px_80px] gap-4 border-b px-6 py-3 text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                                <span>Question</span>
                                                <span>Type</span>
                                                <span>Cognitive</span>
                                                <span>Difficulty</span>
                                                <span>Status</span>
                                            </div>
                                            {questions.data.map((q) => (
                                                <Link
                                                    key={q.id}
                                                    href={`/question-bank/${q.id}`}
                                                    className="grid grid-cols-[1fr_100px_100px_80px_80px] items-center gap-4 border-b px-6 py-4 transition-colors last:border-0 hover:bg-accent/50"
                                                >
                                                    <p className="truncate text-sm font-medium">
                                                        {q.question}
                                                    </p>
                                                    <Badge
                                                        variant="outline"
                                                        className="w-fit text-xs capitalize"
                                                    >
                                                        {q.question_type?.replace(
                                                            '_',
                                                            ' ',
                                                        )}
                                                    </Badge>
                                                    <span className="text-xs text-muted-foreground capitalize">
                                                        {q.cognitive_level}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground capitalize">
                                                        {q.difficulty}
                                                    </span>
                                                    {q.status === 'approved' ? (
                                                        <CheckCircle2 className="size-4 text-success" />
                                                    ) : (
                                                        <Clock className="size-4 text-warning" />
                                                    )}
                                                </Link>
                                            ))}
                                        </div>

                                        {questions.last_page > 1 && (
                                            <div className="mt-4 flex items-center justify-center gap-2">
                                                {Array.from(
                                                    {
                                                        length: questions.last_page,
                                                    },
                                                    (_, i) => (
                                                        <Button
                                                            key={i}
                                                            variant={
                                                                questions.current_page ===
                                                                i + 1
                                                                    ? 'default'
                                                                    : 'outline'
                                                            }
                                                            size="icon"
                                                            className="size-8"
                                                            onClick={() =>
                                                                router.get(
                                                                    `/modules/${module.id}`,
                                                                    {
                                                                        page:
                                                                            i +
                                                                            1,
                                                                    },
                                                                    {
                                                                        preserveState: true,
                                                                    },
                                                                )
                                                            }
                                                        >
                                                            {i + 1}
                                                        </Button>
                                                    ),
                                                )}
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-16 text-center">
                                        <div className="mb-4 rounded-2xl bg-muted/50 p-5">
                                            <BookOpen className="size-10 text-muted-foreground" />
                                        </div>
                                        <h3 className="mb-1 font-medium">
                                            No questions yet
                                        </h3>
                                        <p className="mb-4 max-w-sm text-sm text-muted-foreground">
                                            Create questions manually or use AI
                                            generation from your TOS.
                                        </p>
                                        <Button asChild size="sm">
                                            <Link
                                                href={`/question-bank/create?module=${module.id}`}
                                            >
                                                <Plus className="mr-2 size-4" />
                                                Create Question
                                            </Link>
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        {/* ── Exams Tab ── */}
                        <TabsContent
                            value="exams"
                            className="m-0 flex-1 overflow-auto"
                        >
                            <div className="p-6">
                                <div className="mb-6 flex items-center justify-between">
                                    <h2 className="text-lg font-semibold">
                                        Exams ({exams.length})
                                    </h2>
                                    <Button asChild size="sm">
                                        <Link href="/exam-builder/create">
                                            <Plus className="mr-2 size-4" />
                                            Create Exam
                                        </Link>
                                    </Button>
                                </div>

                                {exams.length > 0 ? (
                                    <div className="rounded-xl border">
                                        <div className="grid grid-cols-[1fr_100px_120px_100px] gap-4 border-b px-6 py-3 text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                            <span>Title</span>
                                            <span>Questions</span>
                                            <span>Created</span>
                                            <span>Status</span>
                                        </div>
                                        {exams.map((exam) => (
                                            <Link
                                                key={exam.id}
                                                href={`/exam-builder/${exam.id}`}
                                                className="grid grid-cols-[1fr_100px_120px_100px] items-center gap-4 border-b px-6 py-4 transition-colors last:border-0 hover:bg-accent/50"
                                            >
                                                <div className="flex min-w-0 items-center gap-2">
                                                    {getExamTypeIcon(
                                                        exam.exam_type,
                                                    )}
                                                    <span className="truncate font-medium">
                                                        {exam.title}
                                                    </span>
                                                </div>
                                                <span className="text-sm text-muted-foreground">
                                                    {exam.questions_count} Q
                                                </span>
                                                <span className="text-sm text-muted-foreground">
                                                    {formatDate(
                                                        exam.created_at,
                                                    )}
                                                </span>
                                                <Badge
                                                    variant="outline"
                                                    className={
                                                        exam.status ===
                                                        'published'
                                                            ? 'bg-success/10 text-success'
                                                            : exam.status ===
                                                                'draft'
                                                              ? 'bg-muted text-muted-foreground'
                                                              : 'bg-secondary/10 text-secondary'
                                                    }
                                                >
                                                    {exam.status
                                                        .charAt(0)
                                                        .toUpperCase() +
                                                        exam.status.slice(1)}
                                                </Badge>
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-16 text-center">
                                        <div className="mb-4 rounded-2xl bg-muted/50 p-5">
                                            <ClipboardList className="size-10 text-muted-foreground" />
                                        </div>
                                        <h3 className="mb-1 font-medium">
                                            No exams yet
                                        </h3>
                                        <p className="mb-4 max-w-sm text-sm text-muted-foreground">
                                            Create an exam to assemble questions
                                            into an assessment.
                                        </p>
                                        <Button asChild size="sm">
                                            <Link href="/exam-builder/create">
                                                <Plus className="mr-2 size-4" />
                                                Create Exam
                                            </Link>
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        {/* ── Topics Tab ── */}
                        <TabsContent
                            value="topics"
                            className="m-0 flex-1 overflow-auto"
                        >
                            <TopicsTabContent
                                module={module}
                                allTopics={allTopics}
                            />
                        </TabsContent>

                        {/* ── Sessions Tab ── */}
                        <TabsContent
                            value="sessions"
                            className="m-0 flex-1 overflow-auto"
                        >
                            <SessionsTabContent
                                sessions={sessions}
                                moduleId={module.id}
                            />
                        </TabsContent>

                        {/* ── TOS Calculator Tab ── */}
                        <TabsContent
                            value="tos-calculator"
                            className="m-0 flex-1 overflow-auto"
                        >
                            <TosCalculatorTabContent
                                matrix={tosMatrix}
                                distribution={tosDistribution}
                                statistics={tosStatistics}
                                balance={tosBalance}
                            />
                        </TabsContent>

                        {/* ── Duplicate Detection Tab ── */}
                        <TabsContent
                            value="duplicates"
                            className="m-0 flex-1 overflow-auto"
                        >
                            <DuplicateDetectionTabContent
                                duplicates={duplicates}
                                statistics={duplicateStats}
                            />
                        </TabsContent>

                        {/* ── Workflow Tab ── */}
                        <TabsContent
                            value="workflow"
                            className="m-0 flex-1 overflow-auto"
                        >
                            <div className="p-6">
                                <WorkflowStepper
                                    module={module}
                                    latestTos={latestTos}
                                    latestExam={latestExam}
                                    availableQuestions={availableQuestions}
                                />
                            </div>
                        </TabsContent>
                    </Tabs>
                </main>

                {/* ═══════════ RIGHT PANEL — Studio ═══════════ */}
                <aside className="flex w-72 shrink-0 flex-col border-l">
                    <div className="border-b p-4">
                        <h2 className="text-sm font-semibold">Studio</h2>
                    </div>

                    <ScrollArea className="flex-1">
                        <div className="space-y-5 p-4">
                            {/* Action Cards Grid */}
                            <div className="grid grid-cols-2 gap-2.5">
                                <StudioCard
                                    icon={
                                        <Sparkles className="size-5 text-purple-400" />
                                    }
                                    label="AI Generate"
                                    onClick={() => setActiveTab('workflow')}
                                    colorClass="bg-purple-500/10"
                                />
                                <StudioCard
                                    icon={
                                        <FileText className="size-5 text-blue-400" />
                                    }
                                    label="Export PDF"
                                    href={`/modules/${module.id}`}
                                    colorClass="bg-blue-500/10"
                                />
                                <StudioCard
                                    icon={
                                        <Calculator className="size-5 text-emerald-400" />
                                    }
                                    label="TOS Calculator"
                                    onClick={() =>
                                        setActiveTab('tos-calculator')
                                    }
                                    colorClass="bg-emerald-500/10"
                                />
                                <StudioCard
                                    icon={
                                        <Search className="size-5 text-orange-400" />
                                    }
                                    label="Dup Check"
                                    onClick={() => setActiveTab('duplicates')}
                                    colorClass="bg-orange-500/10"
                                />
                                <StudioCard
                                    icon={
                                        <Edit className="size-5 text-slate-400" />
                                    }
                                    label="Edit Module"
                                    href={`/modules/${module.id}/edit`}
                                    colorClass="bg-slate-500/10"
                                />
                                <StudioCard
                                    icon={
                                        <FolderTree className="size-5 text-teal-400" />
                                    }
                                    label="Topics"
                                    onClick={() => setActiveTab('topics')}
                                    colorClass="bg-teal-500/10"
                                />
                            </div>

                            {/* Module Info Summary */}
                            <div>
                                <h3 className="mb-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                    Module Info
                                </h3>
                                <div className="space-y-3 text-sm">
                                    <div>
                                        <p className="text-xs text-muted-foreground">
                                            Subject Area
                                        </p>
                                        <p className="font-medium">
                                            {module.subject_area}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">
                                            Grade Level
                                        </p>
                                        <p className="font-medium">
                                            {module.grade_level}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">
                                            Curriculum Year
                                        </p>
                                        <p className="font-medium">
                                            {module.curriculum_year}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">
                                            Created By
                                        </p>
                                        <p className="font-medium">
                                            {module.creator?.name || 'Unknown'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">
                                            Status
                                        </p>
                                        <Badge
                                            variant="outline"
                                            className={
                                                module.is_active
                                                    ? 'bg-success/10 text-success'
                                                    : 'bg-muted text-muted-foreground'
                                            }
                                        >
                                            {module.is_active
                                                ? 'Active'
                                                : 'Inactive'}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            {/* Danger Zone */}
                            <div>
                                <h3 className="mb-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                    Danger Zone
                                </h3>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full text-destructive hover:text-destructive"
                                    onClick={() => setDeletingModule(true)}
                                >
                                    <Trash2 className="mr-2 size-4" />
                                    Delete Module
                                </Button>
                            </div>
                        </div>
                    </ScrollArea>
                </aside>
            </div>

            {/* Delete Confirmation */}
            <AlertDialog open={deletingModule} onOpenChange={setDeletingModule}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Module</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete "{module.name}"?
                            This will also delete all associated topics,
                            questions, and exams. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
