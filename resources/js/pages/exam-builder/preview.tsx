import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Printer } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Question {
    id: number;
    question: string;
    question_type: string;
    points: number;
    options?: any;
    correct_answer?: string;
    pivot: {
        order: number;
        points: number;
    };
}

interface PageProps {
    exam: {
        id: number;
        title: string;
        description: string;
        instructions: string;
        total_points: number;
        module: {
            code: string;
            name: string;
        };
        questions: Question[];
    };
    template?: {
        header: string;
        footer: string;
        styles: string;
    } | null;
}

export default function Preview({ exam, template }: PageProps) {
    const handlePrint = () => {
        window.print();
    };

    return (
        <>
            <Head title={`Preview: ${exam.title}`} />

            <div className="px-4 py-6 md:px-6 md:py-8 print:p-0">
                <div className="mx-auto max-w-5xl space-y-8">
                    {/* Controls */}
                    <div className="flex items-center justify-between print:hidden">
                        <Button variant="ghost" render={<Link href={`/exam-builder/${exam.id}`} />} nativeButton={false}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Details
                        </Button>
                        <Button onClick={handlePrint} variant="outline">
                            <Printer className="mr-2 h-4 w-4" />
                            Print / Save as PDF
                        </Button>
                    </div>

                    {/* Paper Preview */}
                    <Card className="border-2 shadow-lg print:border-none print:shadow-none">
                        <CardContent className="flex min-h-264 flex-col space-y-8 p-8 md:p-12">
                            {/* Custom Styles */}
                            {template?.styles && (
                                <style
                                    dangerouslySetInnerHTML={{
                                        __html: template.styles,
                                    }}
                                />
                            )}

                            {/* Header */}
                            {template?.header ? (
                                <div
                                    className="custom-header mb-8"
                                    dangerouslySetInnerHTML={{
                                        __html: template.header,
                                    }}
                                />
                            ) : (
                                <div className="space-y-2 border-b-2 border-primary pb-6 text-center">
                                    <h1 className="text-3xl font-bold tracking-tight uppercase">
                                        {exam.title}
                                    </h1>
                                    <div className="text-lg font-medium text-muted-foreground uppercase">
                                        {exam.module.code} - {exam.module.name}
                                    </div>

                                    {/* Default Student Info (only if no template) */}
                                    <div className="mt-6 grid grid-cols-2 gap-8 rounded-lg border bg-muted/30 p-6 text-left">
                                        <div className="space-y-4">
                                            <div className="flex items-end gap-2">
                                                <span className="font-bold whitespace-nowrap text-foreground">
                                                    NAME:
                                                </span>
                                                <div className="h-6 flex-1 border-b border-dashed border-foreground"></div>
                                            </div>
                                            <div className="flex items-end gap-2">
                                                <span className="font-bold whitespace-nowrap text-foreground">
                                                    SECTION:
                                                </span>
                                                <div className="h-6 flex-1 border-b border-dashed border-foreground"></div>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex items-end gap-2">
                                                <span className="font-bold whitespace-nowrap text-foreground">
                                                    DATE:
                                                </span>
                                                <div className="h-6 flex-1 border-b border-dashed border-foreground"></div>
                                            </div>
                                            <div className="flex items-end gap-2">
                                                <span className="font-bold whitespace-nowrap text-foreground">
                                                    SCORE:
                                                </span>
                                                <div className="h-6 flex-1 border-b border-dashed border-foreground"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Instructions */}
                            {exam.instructions && (
                                <div className="space-y-2 border-l-4 border-primary bg-primary/5 p-6">
                                    <h3 className="text-lg font-bold uppercase">
                                        General Instructions:
                                    </h3>
                                    <p className="whitespace-pre-wrap">
                                        {exam.instructions}
                                    </p>
                                </div>
                            )}

                            {/* Questions */}
                            <div className="flex-1 space-y-10 pt-4">
                                {exam.questions.map((question, index) => (
                                    <div
                                        key={question.id}
                                        className="break-inside-avoid space-y-4"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex gap-3">
                                                <span className="text-lg font-bold">
                                                    {index + 1}.
                                                </span>
                                                <div className="space-y-4">
                                                    <p className="text-lg leading-relaxed">
                                                        {question.question}
                                                    </p>

                                                    {/* Options for Multiple Choice */}
                                                    {question.question_type ===
                                                        'multiple_choice' && (
                                                        <div className="ml-2 grid grid-cols-1 gap-4 md:grid-cols-2">
                                                            {question.options &&
                                                                (Array.isArray(
                                                                    question.options,
                                                                )
                                                                    ? question.options
                                                                    : []
                                                                ).map(
                                                                    (
                                                                        option: any,
                                                                        optIndex: number,
                                                                    ) => (
                                                                        <div
                                                                            key={
                                                                                optIndex
                                                                            }
                                                                            className="flex gap-2"
                                                                        >
                                                                            <span className="font-bold">
                                                                                {String.fromCharCode(
                                                                                    65 +
                                                                                        optIndex,
                                                                                )}

                                                                                .
                                                                            </span>
                                                                            <span>
                                                                                {option.text ||
                                                                                    option}
                                                                            </span>
                                                                        </div>
                                                                    ),
                                                                )}
                                                        </div>
                                                    )}

                                                    {/* Options for True/False */}
                                                    {question.question_type ===
                                                        'true_false' && (
                                                        <div className="ml-2 flex gap-8">
                                                            <div className="flex gap-2 font-medium">
                                                                <div className="mt-0.5 h-5 w-5 rounded-full border border-foreground"></div>
                                                                <span>
                                                                    TRUE
                                                                </span>
                                                            </div>
                                                            <div className="flex gap-2 font-medium">
                                                                <div className="mt-0.5 h-5 w-5 rounded-full border border-foreground"></div>
                                                                <span>
                                                                    FALSE
                                                                </span>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Identification / Essay Space */}
                                                    {(question.question_type ===
                                                        'identification' ||
                                                        question.question_type ===
                                                            'essay') && (
                                                        <div className="pt-2">
                                                            <div className="h-8 w-full border-b-2 border-dashed border-muted-foreground/30 md:h-12"></div>
                                                            {question.question_type ===
                                                                'essay' && (
                                                                <div className="space-y-4 pt-4">
                                                                    <div className="h-8 w-full border-b-2 border-dashed border-muted-foreground/30"></div>
                                                                    <div className="h-8 w-full border-b-2 border-dashed border-muted-foreground/30"></div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <Badge
                                                variant="outline"
                                                className="shrink-0 font-mono"
                                            >
                                                {question.pivot.points} pt
                                                {question.pivot.points !== 1
                                                    ? 's'
                                                    : ''}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Footer */}
                            {template?.footer ? (
                                <div
                                    className="custom-footer mt-12 pt-8"
                                    dangerouslySetInnerHTML={{
                                        __html: template.footer,
                                    }}
                                />
                            ) : (
                                <div className="mt-12 border-t border-dashed pt-8 text-center text-sm text-muted-foreground">
                                    End of Exam. Review your answers before
                                    submitting.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            <style
                dangerouslySetInnerHTML={{
                    __html: `
                @media print {
                    @page { 
                        margin: 0.5in; 
                        size: letter portrait;
                    }
                    body { 
                        -webkit-print-color-adjust: exact; 
                        background-color: white !important;
                    }
                    .print\\:hidden { display: none !important; }
                    .print\\:p-0 { padding: 0 !important; }
                    .print\\:shadow-none { box-shadow: none !important; }
                    .print\\:border-none { border: none !important; }
                    
                    /* Reset layout for print */
                    main { padding: 0 !important; margin: 0 !important; width: 100% !important; }
                    .mx-auto { max-width: 100% !important; margin: 0 !important; }
                    .shadow-lg { box-shadow: none !important; }
                    .border-2 { border: none !important; }
                    
                    /* Ensure Tiptap content looks okay */
                    .custom-header, .custom-footer {
                        width: 100%;
                    }
                }
                
                /* Preview styles for Tiptap content */
                .custom-header table, .custom-footer table {
                    width: 100% !important;
                    border-collapse: collapse;
                }
                .custom-header td, .custom-footer td {
                    border: 1px solid #ddd;
                    padding: 8px;
                }
                .custom-header img, .custom-footer img {
                    max-width: 100%;
                    height: auto;
                }
            `,
                }}
            />
        </>
    );
}

Preview.layout = {
    breadcrumbs: [
        { title: 'Exam Builder', href: '/exam-builder' },
        { title: 'Exam Preview', href: '' },
    ],
};
