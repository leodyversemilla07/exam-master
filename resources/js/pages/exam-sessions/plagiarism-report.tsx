import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    AlertCircle,
    User,
    FileText,
    ChevronRight,
} from 'lucide-react';
import {
    Card,
    CardContent,
    CardHeader,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import PageHeader from '@/components/page-header';
interface Match {
    student1: string;
    student2: string;
    similarity: number;
    answer1: string;
    answer2: string;
}

interface Report {
    question_id: number;
    question_text: string;
    matches: Match[];
}

interface PageProps {
    session: {
        id: number;
        title: string;
        access_code: string;
    };
    reports: Report[];
}

export default function PlagiarismReport({ session, reports }: PageProps) {
    const breadcrumbs = [
        { title: 'Exam Sessions', href: '/exam-sessions' },
        { title: 'Results', href: `/exam-sessions/${session.id}/results` },
        { title: 'Plagiarism Report', href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Plagiarism Report: ${session.title}`} />

            <div className="space-y-6 p-4 md:p-6">
                <div className="mb-6">
                    <Button variant="ghost" asChild>
                        <Link href={`/exam-sessions/${session.id}/results`}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Results
                        </Link>
                    </Button>
                </div>

                <PageHeader
                    title="Essay Plagiarism Detection"
                    description={`Analyzing similarities in essay answers for session: ${session.title} (${session.access_code})`}
                />

                {reports.length === 0 ? (
                    <Card className="border-success/20 bg-success/5">
                        <CardContent className="pt-6">
                            <div className="py-12 text-center">
                                <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-success" />
                                <h3 className="text-lg font-semibold text-foreground">
                                    No suspicious similarities found
                                </h3>
                                <p className="mt-1 text-muted-foreground">
                                    All essay answers appear to be sufficiently
                                    unique.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-8">
                        {reports.map((report) => (
                            <div key={report.question_id} className="space-y-4">
                                <div className="flex items-center gap-2 px-1">
                                    <FileText className="h-5 w-5 text-primary" />
                                    <h2 className="text-lg font-semibold">
                                        {report.question_text}
                                    </h2>
                                </div>

                                <div className="grid gap-4">
                                    {report.matches.map((match, index) => (
                                        <Card
                                            key={index}
                                            className="overflow-hidden border-orange-200"
                                        >
                                            <CardHeader className="bg-orange-50/50 py-3">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex items-center gap-2">
                                                            <User className="h-4 w-4 text-muted-foreground" />
                                                            <span className="font-medium">
                                                                {match.student1}
                                                            </span>
                                                        </div>
                                                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                                        <div className="flex items-center gap-2">
                                                            <User className="h-4 w-4 text-muted-foreground" />
                                                            <span className="font-medium">
                                                                {match.student2}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <Badge
                                                        variant={
                                                            match.similarity >
                                                            90
                                                                ? 'destructive'
                                                                : 'warning'
                                                        }
                                                        className="font-mono text-sm"
                                                    >
                                                        {match.similarity}%
                                                        Similarity
                                                    </Badge>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="grid gap-4 pt-4 md:grid-cols-2">
                                                <div className="space-y-2">
                                                    <p className="text-xs font-bold text-muted-foreground uppercase">
                                                        {match.student1}'s
                                                        Answer
                                                    </p>
                                                    <div className="min-h-24 rounded bg-muted p-3 text-sm whitespace-pre-wrap">
                                                        {match.answer1}
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <p className="text-xs font-bold text-muted-foreground uppercase">
                                                        {match.student2}'s
                                                        Answer
                                                    </p>
                                                    <div className="min-h-24 rounded bg-muted p-3 text-sm whitespace-pre-wrap">
                                                        {match.answer2}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="flex gap-3 rounded-lg border border-blue-100 bg-blue-50 p-4">
                    <AlertCircle className="mt-0.5 h-5 w-5 text-blue-600" />
                    <div className="text-sm text-blue-800">
                        <p className="mb-1 font-semibold">How it works</p>
                        <p>
                            This tool uses the Levenshtein distance algorithm to
                            compare essay answers longer than 20 characters. A
                            similarity score of 70% or higher is flagged for
                            manual review. High scores do not necessarily mean
                            plagiarism but indicate significant overlap in
                            phrasing and structure.
                        </p>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

// Mock icon because CheckCircle2 is not imported but used in empty state
function CheckCircle2(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
            <path d="m9 12 2 2 4-4" />
        </svg>
    );
}
