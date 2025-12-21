import { PageProps } from "@/types";
import { Head, Link } from "@inertiajs/react";
import { dashboard, login, register } from "@/routes";
import {
    Sparkles,
    Brain,
    FileCheck2,
    Zap,
    Shield,
    BarChart3,
    ArrowRight,
    CheckCircle2,
    BookOpen,
    Users,
    Clock,
    Target,
} from "lucide-react";

export default function Welcome({
    auth,
}: PageProps<{ laravelVersion: string; phpVersion: string }>) {
    const features = [
        {
            icon: Brain,
            title: "AI-Powered Generation",
            description:
                "Leverage cutting-edge AI to generate high-quality exam questions aligned with learning objectives and Bloom's taxonomy.",
        },
        {
            icon: FileCheck2,
            title: "Table of Specifications",
            description:
                "Automatically create and calculate TOS to ensure balanced exam distribution across topics and cognitive levels.",
        },
        {
            icon: Shield,
            title: "Duplicate Detection",
            description:
                "Advanced algorithms prevent duplicate questions, maintaining exam integrity and quality.",
        },
        {
            icon: BarChart3,
            title: "Smart Analytics",
            description:
                "Track exam performance, analyze question difficulty, and gain insights to improve assessment quality.",
        },
        {
            icon: BookOpen,
            title: "Hierarchical Topics",
            description:
                "Organize content with nested topics and modules for structured curriculum management.",
        },
        {
            icon: Zap,
            title: "Lightning Fast",
            description:
                "Generate complete exams in seconds with our optimized AI infrastructure and queue system.",
        },
    ];

    const benefits = [
        "Save 90% of time creating exams",
        "Ensure educational standards compliance",
        "Reduce question duplication",
        "Maintain cognitive level balance",
        "Collaborate with your team",
        "Access from anywhere",
    ];

    return (
        <>
            <Head title="ExamMaster - AI-Powered Exam Generation" />
            <div className="min-h-screen bg-background">
                {/* Navigation */}
                <nav className="sticky top-0 z-50 glass border-b">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex h-16 items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="flex size-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary shadow-primary">
                                    <Sparkles className="size-6 text-primary-foreground" />
                                </div>
                                <span className="text-xl font-bold text-gradient">
                                    ExamMaster
                                </span>
                            </div>
                            <div className="flex items-center gap-4">
                                {auth.user ? (
                                    <Link
                                        href={dashboard()}
                                        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-primary transition hover:opacity-90"
                                    >
                                        Dashboard
                                        <ArrowRight className="size-4" />
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={login()}
                                            className="rounded-lg px-4 py-2 text-sm font-medium text-foreground transition hover:bg-accent hover:text-accent-foreground"
                                        >
                                            Sign In
                                        </Link>
                                        <Link
                                            href={register()}
                                            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-primary transition hover:opacity-90"
                                        >
                                            Get Started
                                            <ArrowRight className="size-4" />
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Hero Section */}
                <section className="relative overflow-hidden px-4 py-20 sm:px-6 sm:py-32 lg:px-8">
                    <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px]"></div>

                    <div className="mx-auto max-w-7xl text-center">
                        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                            <Sparkles className="size-4" />
                            AI-Powered Exam Generation
                        </div>

                        <h1 className="mt-8 text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                            Create Perfect Exams
                            <br />
                            <span className="text-gradient">
                                In Seconds
                            </span>
                        </h1>

                        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
                            ExamMaster leverages AI to generate comprehensive
                            exam questions with Table of Specifications
                            alignment, ensuring educational standards and
                            balanced cognitive level distribution.
                        </p>

                        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                            <Link
                                href={auth.user ? dashboard() : register()}
                                className="group inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-4 text-base font-semibold text-primary-foreground shadow-primary transition hover:opacity-90"
                            >
                                {auth.user ? "Go to Dashboard" : "Start Free Trial"}
                                <ArrowRight className="size-5 transition group-hover:translate-x-1" />
                            </Link>
                            <button className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-8 py-4 text-base font-semibold text-card-foreground shadow-sm transition hover:bg-accent hover:text-accent-foreground">
                                <Users className="size-5" />
                                Request Demo
                            </button>
                        </div>

                        <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="size-5 text-success" />
                                No credit card required
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="size-5 text-success" />
                                Free 14-day trial
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="size-5 text-success" />
                                Cancel anytime
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Grid */}
                <section className="px-4 py-20 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-7xl">
                        <div className="text-center">
                            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                                Everything you need
                            </h2>
                            <p className="mt-4 text-lg text-muted-foreground">
                                Powerful features to streamline your exam
                                creation workflow
                            </p>
                        </div>

                        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                            {features.map((feature) => (
                                <div
                                    key={feature.title}
                                    className="group relative rounded-2xl border border-border bg-card p-8 shadow-sm transition hover:shadow-lg hover:shadow-primary/10"
                                >
                                    <div className="flex size-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary text-primary-foreground shadow-primary">
                                        <feature.icon className="size-6" />
                                    </div>
                                    <h3 className="mt-6 text-xl font-semibold">
                                        {feature.title}
                                    </h3>
                                    <p className="mt-2 text-muted-foreground">
                                        {feature.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Benefits Section */}
                <section className="px-4 py-20 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-7xl">
                        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
                            <div>
                                <div className="inline-flex items-center gap-2 rounded-full border border-secondary/20 bg-secondary/10 px-4 py-1.5 text-sm font-medium text-secondary">
                                    <Target className="size-4" />
                                    Built for Educators
                                </div>
                                <h2 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">
                                    Transform Your Assessment Process
                                </h2>
                                <p className="mt-4 text-lg text-muted-foreground">
                                    ExamMaster combines cutting-edge AI
                                    technology with educational best practices
                                    to deliver unmatched exam creation
                                    efficiency.
                                </p>

                                <div className="mt-8 space-y-4">
                                    {benefits.map((benefit) => (
                                        <div
                                            key={benefit}
                                            className="flex items-start gap-3"
                                        >
                                            <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-success/10">
                                                <CheckCircle2 className="size-4 text-success" />
                                            </div>
                                            <span className="text-foreground">
                                                {benefit}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-10">
                                    <Link
                                        href={auth.user ? dashboard() : register()}
                                        className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-primary transition hover:opacity-90"
                                    >
                                        Get Started Now
                                        <ArrowRight className="size-4" />
                                    </Link>
                                </div>
                            </div>

                            <div className="relative">
                                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary to-secondary opacity-20 blur-3xl"></div>
                                <div className="relative space-y-4 rounded-2xl glass-card p-8">
                                    <div className="flex items-center justify-between rounded-lg bg-muted p-4">
                                        <div className="flex items-center gap-3">
                                            <Clock className="size-5 text-success" />
                                            <span className="font-medium">
                                                Time Saved
                                            </span>
                                        </div>
                                        <span className="text-2xl font-bold text-success">
                                            90%
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between rounded-lg bg-muted p-4">
                                        <div className="flex items-center gap-3">
                                            <FileCheck2 className="size-5 text-primary" />
                                            <span className="font-medium">
                                                Questions Generated
                                            </span>
                                        </div>
                                        <span className="text-2xl font-bold text-primary">
                                            10K+
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between rounded-lg bg-muted p-4">
                                        <div className="flex items-center gap-3">
                                            <Users className="size-5 text-secondary" />
                                            <span className="font-medium">
                                                Active Users
                                            </span>
                                        </div>
                                        <span className="text-2xl font-bold text-secondary">
                                            500+
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between rounded-lg bg-muted p-4">
                                        <div className="flex items-center gap-3">
                                            <BarChart3 className="size-5 text-info" />
                                            <span className="font-medium">
                                                Quality Score
                                            </span>
                                        </div>
                                        <span className="text-2xl font-bold text-info">
                                            98%
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="px-4 py-20 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-7xl">
                        <div className="relative overflow-hidden rounded-3xl gradient-animated px-8 py-16 text-center shadow-2xl sm:px-16">
                            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff12_1px,transparent_1px),linear-gradient(to_bottom,#ffffff12_1px,transparent_1px)] bg-size-[24px_24px]"></div>

                            <div className="relative">
                                <h2 className="text-3xl font-bold text-white sm:text-4xl">
                                    Ready to revolutionize your exam creation?
                                </h2>
                                <p className="mx-auto mt-4 max-w-2xl text-lg text-white/90">
                                    Join hundreds of educators who are already
                                    saving time and improving assessment quality
                                    with ExamMaster.
                                </p>

                                <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                                    <Link
                                        href={auth.user ? dashboard() : register()}
                                        className="inline-flex items-center gap-2 rounded-lg bg-white px-8 py-4 text-base font-semibold text-primary shadow-xl transition hover:bg-white/90"
                                    >
                                        {auth.user ? "Go to Dashboard" : "Start Free Trial"}
                                        <ArrowRight className="size-5" />
                                    </Link>
                                    <button className="inline-flex items-center gap-2 rounded-lg border-2 border-white px-8 py-4 text-base font-semibold text-white transition hover:bg-white/10">
                                        Learn More
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="border-t border-border bg-card px-4 py-12">
                    <div className="mx-auto max-w-7xl">
                        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                            <div className="flex items-center gap-2">
                                <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary shadow-primary">
                                    <Sparkles className="size-5 text-primary-foreground" />
                                </div>
                                <span className="font-bold">
                                    ExamMaster
                                </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                © {new Date().getFullYear()} ExamMaster. All
                                rights reserved.
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
