import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Module, TosGenerate, ExamQuestion, Exam } from '@/types/models';
import { BreadcrumbItem } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
} from 'lucide-react';
import { useState } from 'react';

interface Topic {
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
    topics: Topic[];
}

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

/* ─── Topic Tree Item ─── */
function TopicItem({ topic }: { topic: Topic }) {
    const [expanded, setExpanded] = useState(false);
    const hasChildren = topic.children && topic.children.length > 0;

    return (
        <div>
            <button
                onClick={() => hasChildren && setExpanded(!expanded)}
                className="flex items-center gap-2 w-full rounded-md px-2 py-1.5 text-sm hover:bg-accent/50 transition-colors text-left"
            >
                {hasChildren ? (
                    expanded ? (
                        <ChevronDown className="size-3.5 text-muted-foreground shrink-0" />
                    ) : (
                        <ChevronRight className="size-3.5 text-muted-foreground shrink-0" />
                    )
                ) : (
                    <span className="size-3.5 shrink-0" />
                )}
                <span className="truncate flex-1">{topic.title}</span>
                {topic.learning_objectives_count > 0 && (
                    <span className="text-xs text-muted-foreground">
                        {topic.learning_objectives_count}
                    </span>
                )}
            </button>
            {expanded && hasChildren && (
                <div className="ml-4 border-l pl-2 space-y-0.5">
                    {topic.children.map((child) => (
                        <div
                            key={child.id}
                            className="flex items-center gap-2 rounded-md px-2 py-1 text-sm text-muted-foreground hover:bg-accent/50 transition-colors"
                        >
                            <span className="size-3.5 shrink-0" />
                            <span className="truncate flex-1">{child.title}</span>
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
}: {
    icon: React.ReactNode;
    label: string;
    href: string;
    colorClass: string;
}) {
    return (
        <Link
            href={href}
            className="flex flex-col items-center gap-2 rounded-xl border p-3 hover:bg-accent/50 transition-colors text-center group"
        >
            <div className={`rounded-lg p-2 ${colorClass}`}>{icon}</div>
            <span className="text-xs font-medium">{label}</span>
        </Link>
    );
}

export default function ModuleShow({ module, questions, exams, topics }: PageProps) {
    const [deletingModule, setDeletingModule] = useState(false);

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
                <aside className="w-64 shrink-0 border-r flex flex-col">
                    <div className="p-4 border-b">
                        <h2 className="font-semibold text-sm truncate">{module.name}</h2>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            {module.code} · {module.subject_area}
                        </p>
                    </div>

                    <ScrollArea className="flex-1">
                        <div className="p-3 space-y-5">
                            {/* Sources / PDFs */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        Sources
                                    </h3>
                                </div>
                                {module.pdf_file ? (
                                    <a
                                        href={`/storage/${module.pdf_file}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-accent/50 transition-colors"
                                    >
                                        <FileText className="size-4 text-primary shrink-0" />
                                        <span className="truncate flex-1">
                                            {module.pdf_file.split('/').pop()}
                                        </span>
                                        <Download className="size-3.5 text-muted-foreground opacity-0 group-hover:opacity-100" />
                                    </a>
                                ) : (
                                    <p className="text-xs text-muted-foreground px-2 py-2">
                                        No PDF uploaded
                                    </p>
                                )}
                            </div>

                            {/* Topics Tree */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        Topics
                                    </h3>
                                    <Link href={`/modules/${module.id}/topics`}>
                                        <Button variant="ghost" size="icon" className="size-6">
                                            <Plus className="size-3" />
                                        </Button>
                                    </Link>
                                </div>
                                {topics.length > 0 ? (
                                    <div className="space-y-0.5">
                                        {topics.map((topic) => (
                                            <TopicItem key={topic.id} topic={topic} />
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-muted-foreground px-2 py-2">
                                        No topics yet
                                    </p>
                                )}
                            </div>

                            {/* Module Stats */}
                            <div>
                                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                                    Stats
                                </h3>
                                <div className="space-y-1.5 px-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Questions</span>
                                        <span className="font-medium">
                                            {module.questions_count || 0}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Exams</span>
                                        <span className="font-medium">
                                            {module.exams_count || 0}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Grade</span>
                                        <span className="font-medium">{module.grade_level}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Year</span>
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
                <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                    <Tabs defaultValue="tos" className="flex flex-col flex-1 overflow-hidden">
                        <div className="border-b px-6 pt-4">
                            <TabsList className="bg-transparent p-0 h-auto gap-4">
                                <TabsTrigger
                                    value="tos"
                                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none pb-3 px-1"
                                >
                                    TOS
                                </TabsTrigger>
                                <TabsTrigger
                                    value="questions"
                                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none pb-3 px-1"
                                >
                                    Questions
                                </TabsTrigger>
                                <TabsTrigger
                                    value="exams"
                                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none pb-3 px-1"
                                >
                                    Exams
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        {/* ── TOS Tab ── */}
                        <TabsContent value="tos" className="flex-1 overflow-auto m-0">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-6">
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

                                {module.tos_generates && module.tos_generates.length > 0 ? (
                                    <div className="rounded-xl border">
                                        <div className="grid grid-cols-[1fr_80px_120px_100px_120px] gap-4 px-6 py-3 border-b text-xs font-medium text-muted-foreground uppercase tracking-wider">
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
                                                className="grid grid-cols-[1fr_80px_120px_100px_120px] gap-4 px-6 py-4 items-center border-b last:border-0 hover:bg-accent/50 transition-colors"
                                            >
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <FileText className="size-4 text-muted-foreground shrink-0" />
                                                    <span className="font-medium truncate">
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
                                                        tos.status === 'completed'
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
                                        <div className="rounded-2xl bg-muted/50 p-5 mb-4">
                                            <FileText className="size-10 text-muted-foreground" />
                                        </div>
                                        <h3 className="font-medium mb-1">
                                            No TOS generated yet
                                        </h3>
                                        <p className="text-sm text-muted-foreground mb-4 max-w-sm">
                                            Generate a Table of Specifications to define your
                                            assessment blueprint.
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
                        <TabsContent value="questions" className="flex-1 overflow-auto m-0">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-lg font-semibold">
                                        Questions ({questions.total})
                                    </h2>
                                    <Button asChild size="sm">
                                        <Link href={`/question-bank/create?module=${module.id}`}>
                                            <Plus className="mr-2 size-4" />
                                            Create Question
                                        </Link>
                                    </Button>
                                </div>

                                {questions.data.length > 0 ? (
                                    <>
                                        <div className="rounded-xl border">
                                            <div className="grid grid-cols-[1fr_100px_100px_80px_80px] gap-4 px-6 py-3 border-b text-xs font-medium text-muted-foreground uppercase tracking-wider">
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
                                                    className="grid grid-cols-[1fr_100px_100px_80px_80px] gap-4 px-6 py-4 items-center border-b last:border-0 hover:bg-accent/50 transition-colors"
                                                >
                                                    <p className="text-sm font-medium truncate">
                                                        {q.question}
                                                    </p>
                                                    <Badge variant="outline" className="text-xs w-fit capitalize">
                                                        {q.question_type?.replace('_', ' ')}
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

                                        {/* Pagination */}
                                        {questions.last_page > 1 && (
                                            <div className="flex items-center justify-center gap-2 mt-4">
                                                {Array.from(
                                                    { length: questions.last_page },
                                                    (_, i) => (
                                                        <Button
                                                            key={i}
                                                            variant={
                                                                questions.current_page === i + 1
                                                                    ? 'default'
                                                                    : 'outline'
                                                            }
                                                            size="icon"
                                                            className="size-8"
                                                            onClick={() =>
                                                                router.get(
                                                                    `/modules/${module.id}`,
                                                                    { page: i + 1 },
                                                                    { preserveState: true },
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
                                        <div className="rounded-2xl bg-muted/50 p-5 mb-4">
                                            <BookOpen className="size-10 text-muted-foreground" />
                                        </div>
                                        <h3 className="font-medium mb-1">No questions yet</h3>
                                        <p className="text-sm text-muted-foreground mb-4 max-w-sm">
                                            Create questions manually or use AI generation from
                                            your TOS.
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
                        <TabsContent value="exams" className="flex-1 overflow-auto m-0">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-6">
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
                                        <div className="grid grid-cols-[1fr_100px_120px_100px] gap-4 px-6 py-3 border-b text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                            <span>Title</span>
                                            <span>Questions</span>
                                            <span>Created</span>
                                            <span>Status</span>
                                        </div>
                                        {exams.map((exam) => (
                                            <Link
                                                key={exam.id}
                                                href={`/exam-builder/${exam.id}`}
                                                className="grid grid-cols-[1fr_100px_120px_100px] gap-4 px-6 py-4 items-center border-b last:border-0 hover:bg-accent/50 transition-colors"
                                            >
                                                <div className="flex items-center gap-2 min-w-0">
                                                    {getExamTypeIcon(exam.exam_type)}
                                                    <span className="font-medium truncate">
                                                        {exam.title}
                                                    </span>
                                                </div>
                                                <span className="text-sm text-muted-foreground">
                                                    {exam.questions_count} Q
                                                </span>
                                                <span className="text-sm text-muted-foreground">
                                                    {formatDate(exam.created_at)}
                                                </span>
                                                <Badge
                                                    variant="outline"
                                                    className={
                                                        exam.status === 'published'
                                                            ? 'bg-success/10 text-success'
                                                            : exam.status === 'draft'
                                                                ? 'bg-muted text-muted-foreground'
                                                                : 'bg-secondary/10 text-secondary'
                                                    }
                                                >
                                                    {exam.status.charAt(0).toUpperCase() +
                                                        exam.status.slice(1)}
                                                </Badge>
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-16 text-center">
                                        <div className="rounded-2xl bg-muted/50 p-5 mb-4">
                                            <ClipboardList className="size-10 text-muted-foreground" />
                                        </div>
                                        <h3 className="font-medium mb-1">No exams yet</h3>
                                        <p className="text-sm text-muted-foreground mb-4 max-w-sm">
                                            Create an exam to assemble questions into an
                                            assessment.
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
                    </Tabs>
                </main>

                {/* ═══════════ RIGHT PANEL — Studio ═══════════ */}
                <aside className="w-72 shrink-0 border-l flex flex-col">
                    <div className="p-4 border-b">
                        <h2 className="font-semibold text-sm">Studio</h2>
                    </div>

                    <ScrollArea className="flex-1">
                        <div className="p-4 space-y-5">
                            {/* Action Cards Grid */}
                            <div className="grid grid-cols-2 gap-2.5">
                                <StudioCard
                                    icon={<Sparkles className="size-5 text-purple-400" />}
                                    label="AI Generate"
                                    href={`/tos-generates/create?module=${module.id}`}
                                    colorClass="bg-purple-500/10"
                                />
                                <StudioCard
                                    icon={<FileText className="size-5 text-blue-400" />}
                                    label="Export PDF"
                                    href={`/modules/${module.id}`}
                                    colorClass="bg-blue-500/10"
                                />
                                <StudioCard
                                    icon={<Calculator className="size-5 text-emerald-400" />}
                                    label="TOS Calculator"
                                    href={`/modules/${module.id}/tos-calculator`}
                                    colorClass="bg-emerald-500/10"
                                />
                                <StudioCard
                                    icon={<Search className="size-5 text-orange-400" />}
                                    label="Dup Check"
                                    href={`/modules/${module.id}/duplicate-detection`}
                                    colorClass="bg-orange-500/10"
                                />
                                <StudioCard
                                    icon={<Edit className="size-5 text-slate-400" />}
                                    label="Edit Module"
                                    href={`/modules/${module.id}/edit`}
                                    colorClass="bg-slate-500/10"
                                />
                                <StudioCard
                                    icon={<FolderTree className="size-5 text-teal-400" />}
                                    label="Topics"
                                    href={`/modules/${module.id}/topics`}
                                    colorClass="bg-teal-500/10"
                                />
                            </div>

                            {/* Module Info Summary */}
                            <div>
                                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                                    Module Info
                                </h3>
                                <div className="space-y-3 text-sm">
                                    <div>
                                        <p className="text-xs text-muted-foreground">Subject Area</p>
                                        <p className="font-medium">{module.subject_area}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Grade Level</p>
                                        <p className="font-medium">{module.grade_level}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">
                                            Curriculum Year
                                        </p>
                                        <p className="font-medium">{module.curriculum_year}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Created By</p>
                                        <p className="font-medium">
                                            {module.creator?.name || 'Unknown'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Status</p>
                                        <Badge
                                            variant="outline"
                                            className={
                                                module.is_active
                                                    ? 'bg-success/10 text-success'
                                                    : 'bg-muted text-muted-foreground'
                                            }
                                        >
                                            {module.is_active ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            {/* Danger Zone */}
                            <div>
                                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
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
                            Are you sure you want to delete "{module.name}"? This will also delete
                            all associated topics, questions, and exams. This action cannot be
                            undone.
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
