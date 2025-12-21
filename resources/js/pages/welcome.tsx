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
            <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
                {/* Navigation */}
                <nav className="sticky top-0 z-50 border-b border-slate-200/50 bg-white/80 backdrop-blur-lg dark:border-slate-800/50 dark:bg-slate-950/80">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex h-16 items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="flex size-10 items-center justify-center rounded-lg bg-linear-to-br from-emerald-500 to-teal-600">
                                    <Sparkles className="size-6 text-white" />
                                </div>
                                <span className="text-xl font-bold bg-linear-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent dark:from-emerald-400 dark:to-teal-400">
                                    ExamMaster
                                </span>
                            </div>
                            <div className="flex items-center gap-4">
                                {auth.user ? (
                                    <Link
                                        href={dashboard()}
                                        className="inline-flex items-center gap-2 rounded-lg bg-linear-to-r from-emerald-600 to-teal-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-emerald-500/30 transition hover:shadow-xl hover:shadow-emerald-500/40 dark:shadow-emerald-500/20"
                                    >
                                        Dashboard
                                        <ArrowRight className="size-4" />
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={login()}
                                            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                                        >
                                            Sign In
                                        </Link>
                                        <Link
                                            href={register()}
                                            className="inline-flex items-center gap-2 rounded-lg bg-linear-to-r from-emerald-600 to-teal-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-emerald-500/30 transition hover:shadow-xl hover:shadow-emerald-500/40 dark:shadow-emerald-500/20"
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
                    <div className="absolute inset-0 -z-10 bg-linear-to-t from-white via-transparent dark:from-slate-950"></div>

                    <div className="mx-auto max-w-7xl text-center">
                        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-sm font-medium text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300">
                            <Sparkles className="size-4" />
                            AI-Powered Exam Generation
                        </div>

                        <h1 className="mt-8 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl md:text-6xl lg:text-7xl dark:text-white">
                            Create Perfect Exams
                            <br />
                            <span className="bg-linear-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent dark:from-emerald-400 dark:via-teal-400 dark:to-cyan-400">
                                In Seconds
                            </span>
                        </h1>

                        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600 dark:text-slate-400">
                            ExamMaster leverages AI to generate comprehensive
                            exam questions with Table of Specifications
                            alignment, ensuring educational standards and
                            balanced cognitive level distribution.
                        </p>

                        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                            <Link
                                href={auth.user ? dashboard() : register()}
                                className="group inline-flex items-center gap-2 rounded-lg bg-linear-to-r from-emerald-600 to-teal-600 px-8 py-4 text-base font-semibold text-white shadow-xl shadow-emerald-500/30 transition hover:shadow-2xl hover:shadow-emerald-500/40 dark:shadow-emerald-500/20"
                            >
                                {auth.user ? "Go to Dashboard" : "Start Free Trial"}
                                <ArrowRight className="size-5 transition group-hover:translate-x-1" />
                            </Link>
                            <button className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-8 py-4 text-base font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">
                                <Users className="size-5" />
                                Request Demo
                            </button>
                        </div>

                        <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-slate-600 dark:text-slate-400">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400" />
                                No credit card required
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400" />
                                Free 14-day trial
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400" />
                                Cancel anytime
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Grid */}
                <section className="px-4 py-20 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-7xl">
                        <div className="text-center">
                            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
                                Everything you need
                            </h2>
                            <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
                                Powerful features to streamline your exam
                                creation workflow
                            </p>
                        </div>

                        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                            {features.map((feature) => (
                                <div
                                    key={feature.title}
                                    className="group relative rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition hover:shadow-xl hover:shadow-emerald-500/10 dark:border-slate-800 dark:bg-slate-900"
                                >
                                    <div className="flex size-12 items-center justify-center rounded-lg bg-linear-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30">
                                        <feature.icon className="size-6" />
                                    </div>
                                    <h3 className="mt-6 text-xl font-semibold text-slate-900 dark:text-white">
                                        {feature.title}
                                    </h3>
                                    <p className="mt-2 text-slate-600 dark:text-slate-400">
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
                                <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-4 py-1.5 text-sm font-medium text-teal-700 dark:border-teal-900 dark:bg-teal-950 dark:text-teal-300">
                                    <Target className="size-4" />
                                    Built for Educators
                                </div>
                                <h2 className="mt-6 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
                                    Transform Your Assessment Process
                                </h2>
                                <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
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
                                            <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950">
                                                <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
                                            </div>
                                            <span className="text-slate-700 dark:text-slate-300">
                                                {benefit}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-10">
                                    <Link
                                        href={auth.user ? dashboard() : register()}
                                        className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                                    >
                                        Get Started Now
                                        <ArrowRight className="size-4" />
                                    </Link>
                                </div>
                            </div>

                            <div className="relative">
                                <div className="absolute inset-0 rounded-3xl bg-linear-to-br from-emerald-500 to-teal-600 opacity-20 blur-3xl"></div>
                                <div className="relative space-y-4 rounded-2xl border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900">
                                    <div className="flex items-center justify-between rounded-lg bg-slate-50 p-4 dark:bg-slate-800">
                                        <div className="flex items-center gap-3">
                                            <Clock className="size-5 text-emerald-600 dark:text-emerald-400" />
                                            <span className="font-medium text-slate-900 dark:text-white">
                                                Time Saved
                                            </span>
                                        </div>
                                        <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                            90%
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between rounded-lg bg-slate-50 p-4 dark:bg-slate-800">
                                        <div className="flex items-center gap-3">
                                            <FileCheck2 className="size-5 text-teal-600 dark:text-teal-400" />
                                            <span className="font-medium text-slate-900 dark:text-white">
                                                Questions Generated
                                            </span>
                                        </div>
                                        <span className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                                            10K+
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between rounded-lg bg-slate-50 p-4 dark:bg-slate-800">
                                        <div className="flex items-center gap-3">
                                            <Users className="size-5 text-cyan-600 dark:text-cyan-400" />
                                            <span className="font-medium text-slate-900 dark:text-white">
                                                Active Users
                                            </span>
                                        </div>
                                        <span className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">
                                            500+
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between rounded-lg bg-slate-50 p-4 dark:bg-slate-800">
                                        <div className="flex items-center gap-3">
                                            <BarChart3 className="size-5 text-indigo-600 dark:text-indigo-400" />
                                            <span className="font-medium text-slate-900 dark:text-white">
                                                Quality Score
                                            </span>
                                        </div>
                                        <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
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
                        <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-emerald-600 via-teal-600 to-cyan-600 px-8 py-16 text-center shadow-2xl sm:px-16">
                            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff12_1px,transparent_1px),linear-gradient(to_bottom,#ffffff12_1px,transparent_1px)] bg-size-[24px_24px]"></div>

                            <div className="relative">
                                <h2 className="text-3xl font-bold text-white sm:text-4xl">
                                    Ready to revolutionize your exam creation?
                                </h2>
                                <p className="mx-auto mt-4 max-w-2xl text-lg text-emerald-50">
                                    Join hundreds of educators who are already
                                    saving time and improving assessment quality
                                    with ExamMaster.
                                </p>

                                <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                                    <Link
                                        href={auth.user ? dashboard() : register()}
                                        className="inline-flex items-center gap-2 rounded-lg bg-white px-8 py-4 text-base font-semibold text-emerald-600 shadow-xl transition hover:bg-slate-50"
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
                <footer className="border-t border-slate-200 bg-white px-4 py-12 dark:border-slate-800 dark:bg-slate-950">
                    <div className="mx-auto max-w-7xl">
                        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                            <div className="flex items-center gap-2">
                                <div className="flex size-8 items-center justify-center rounded-lg bg-linear-to-br from-emerald-500 to-teal-600">
                                    <Sparkles className="size-5 text-white" />
                                </div>
                                <span className="font-bold text-slate-900 dark:text-white">
                                    ExamMaster
                                </span>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
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
