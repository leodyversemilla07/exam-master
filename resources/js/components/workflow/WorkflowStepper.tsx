import { router } from '@inertiajs/react';
import { useState } from 'react';
import { Check } from 'lucide-react';
import type {
    Exam,
    ExamQuestion,
    ExamSession,
    Module,
    TosGenerate,
} from '@/types/models';
import Step1TosForm from '@/components/workflow/steps/Step1TosForm';
import Step2Generating from '@/components/workflow/steps/Step2Generating';
import Step3ReviewQuestions from '@/components/workflow/steps/Step3ReviewQuestions';
import Step4BuildExam from '@/components/workflow/steps/Step4BuildExam';
import Step5Schedule, {
    Step5Done,
} from '@/components/workflow/steps/Step5Schedule';

interface Props {
    module: Module;
    latestTos: (TosGenerate & { questions: ExamQuestion[] }) | null;
    latestExam: (Exam & { questions: ExamQuestion[] }) | null;
    availableQuestions: ExamQuestion[];
}

type Step = 1 | 2 | 3 | 4 | 5 | 'done';

const STEP_LABELS: Record<number, string> = {
    1: 'Create TOS',
    2: 'Generate',
    3: 'Review',
    4: 'Build Exam',
    5: 'Schedule',
};

function deriveStep(
    latestTos: Props['latestTos'],
    latestExam: Props['latestExam'],
): Step {
    if (latestTos === null) {
        return 1;
    }

    if (
        latestTos.status === 'draft' ||
        latestTos.status === 'generating' ||
        latestTos.status === 'failed'
    ) {
        return 2;
    }

    if (
        latestTos.status === 'completed' &&
        latestTos.questions.some((q) => q.status !== 'approved')
    ) {
        return 3;
    }

    if (latestTos.status === 'completed' && latestExam === null) {
        return 4;
    }

    if (latestExam?.status === 'draft') {
        return 4;
    }

    if (latestExam?.status === 'published') {
        return 'done';
    }

    return 1;
}

function StepIndicator({
    stepNumber,
    label,
    status,
}: {
    stepNumber: number;
    label: string;
    status: 'completed' | 'active' | 'upcoming';
}) {
    return (
        <div className="flex flex-col items-center gap-1.5">
            <div
                className={`flex size-8 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                    status === 'completed'
                        ? 'bg-success text-success-foreground'
                        : status === 'active'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                }`}
            >
                {status === 'completed' ? (
                    <Check className="size-4" />
                ) : (
                    stepNumber
                )}
            </div>
            <span
                className={`text-xs font-medium ${
                    status === 'active'
                        ? 'text-foreground'
                        : status === 'completed'
                          ? 'text-success'
                          : 'text-muted-foreground'
                }`}
            >
                {label}
            </span>
        </div>
    );
}

export default function WorkflowStepper({
    module,
    latestTos,
    latestExam,
    availableQuestions,
}: Props) {
    const derivedStep = deriveStep(latestTos, latestExam);
    const [createdSession, setCreatedSession] = useState<ExamSession | null>(
        null,
    );

    const reloadWorkflow = () => {
        router.reload({
            only: ['latestTos', 'latestExam', 'availableQuestions'],
        });
    };

    const currentStep = derivedStep;
    const numericStep = currentStep === 'done' ? 6 : (currentStep as number);

    const getStepStatus = (
        step: number,
    ): 'completed' | 'active' | 'upcoming' => {
        if (currentStep === 'done' || numericStep > step) {
            return 'completed';
        }

        if (numericStep === step) {
            return 'active';
        }

        return 'upcoming';
    };

    return (
        <div className="space-y-8">
            {/* ── Progress indicator ── */}
            {currentStep !== 'done' && (
                <div className="flex items-start justify-center gap-0">
                    {([1, 2, 3, 4, 5] as const).map((step, idx) => (
                        <div key={step} className="flex items-center">
                            <StepIndicator
                                stepNumber={step}
                                label={STEP_LABELS[step]}
                                status={getStepStatus(step)}
                            />
                            {idx < 4 && (
                                <div
                                    className={`mx-1 mb-5 h-px w-10 transition-colors ${
                                        numericStep > step
                                            ? 'bg-success'
                                            : 'bg-muted'
                                    }`}
                                />
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* ── Active step content ── */}
            <div>
                {currentStep === 1 && (
                    <Step1TosForm
                        module={module}
                        existingTos={latestTos}
                        onCreated={() => {
                            router.reload({ only: ['latestTos'] });
                        }}
                    />
                )}

                {currentStep === 2 && latestTos !== null && (
                    <Step2Generating
                        tos={latestTos}
                        onAdvance={reloadWorkflow}
                    />
                )}

                {currentStep === 3 && latestTos !== null && (
                    <Step3ReviewQuestions
                        tos={latestTos}
                        onAdvance={reloadWorkflow}
                    />
                )}

                {currentStep === 4 && latestTos !== null && (
                    <Step4BuildExam
                        module={module}
                        tos={latestTos}
                        exam={latestExam}
                        availableQuestions={availableQuestions}
                        onAdvance={reloadWorkflow}
                    />
                )}

                {currentStep === 5 && latestExam !== null && (
                    <Step5Schedule
                        exam={latestExam}
                        onAdvance={(session) => {
                            setCreatedSession(session);
                            reloadWorkflow();
                        }}
                    />
                )}

                {currentStep === 'done' && latestExam !== null && (
                    <Step5Done
                        exam={latestExam}
                        session={createdSession ?? ({} as ExamSession)}
                    />
                )}
            </div>
        </div>
    );
}
