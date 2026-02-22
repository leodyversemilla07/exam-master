import { Button } from '@/components/ui/button';
import { AlertCircle, Loader2, RefreshCw, Sparkles } from 'lucide-react';
import { router } from '@inertiajs/react';
import { TosGenerate } from '@/types/models';
import { useEffect, useRef } from 'react';
import { generateQuestions } from '@/actions/App/Http/Controllers/TosGenerateController';

interface Props {
    tos: TosGenerate & { questions?: { id: number }[] };
    onAdvance: () => void;
}

export default function Step2Generating({ tos, onAdvance }: Props) {
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Poll every 5s while generating; auto-advance when completed
    useEffect(() => {
        if (tos.status === 'completed') {
            onAdvance();
            return;
        }

        if (tos.status === 'generating') {
            intervalRef.current = setInterval(() => {
                router.reload({ only: ['latestTos'] });
            }, 5000);
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [tos.status]);

    const handleTriggerGeneration = () => {
        router.post(generateQuestions.url(tos.id), {}, { preserveScroll: true });
    };

    if (tos.status === 'draft') {
        return (
            <div className="flex flex-col items-center gap-6 py-10 text-center">
                <div className="rounded-2xl bg-primary/10 p-5">
                    <Sparkles className="size-10 text-primary" />
                </div>
                <div>
                    <h3 className="font-semibold text-lg mb-1">TOS Created — Ready to Generate</h3>
                    <p className="text-sm text-muted-foreground max-w-sm">
                        Your Table of Specifications is ready. Start AI question generation now.
                        This may take 2–5 minutes.
                    </p>
                </div>
                <Button onClick={handleTriggerGeneration}>
                    <Sparkles className="mr-2 size-4" />
                    Generate Questions
                </Button>
            </div>
        );
    }

    if (tos.status === 'failed') {
        return (
            <div className="flex flex-col items-center gap-6 py-10 text-center">
                <div className="rounded-2xl bg-destructive/10 p-5">
                    <AlertCircle className="size-10 text-destructive" />
                </div>
                <div>
                    <h3 className="font-semibold text-lg mb-1 text-destructive">
                        Generation Failed
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-sm">
                        {tos.error_message || 'An error occurred during AI question generation.'}
                    </p>
                </div>
                <Button variant="outline" onClick={handleTriggerGeneration}>
                    <RefreshCw className="mr-2 size-4" />
                    Retry Generation
                </Button>
            </div>
        );
    }

    // status === 'generating'
    return (
        <div className="flex flex-col items-center gap-6 py-10 text-center">
            <div className="rounded-2xl bg-info/10 p-5">
                <Loader2 className="size-10 text-info animate-spin" />
            </div>
            <div>
                <h3 className="font-semibold text-lg mb-1">Generating Questions…</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                    AI is creating {tos.total_items} questions based on your TOS. This usually takes
                    2–5 minutes. You can leave this tab and return — the workflow will resume
                    automatically.
                </p>
            </div>

            {/* Animated skeleton rows */}
            <div className="w-full max-w-md space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div
                        key={i}
                        className="rounded-lg border p-4 animate-pulse bg-muted/30"
                        style={{ animationDelay: `${i * 150}ms` }}
                    >
                        <div className="h-3 rounded bg-muted w-3/4 mb-2" />
                        <div className="h-3 rounded bg-muted w-1/2" />
                    </div>
                ))}
            </div>

            <p className="text-xs text-muted-foreground">Checking for updates every 5 seconds…</p>
        </div>
    );
}
