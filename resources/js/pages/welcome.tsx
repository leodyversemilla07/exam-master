import { Head, Link } from '@inertiajs/react';
import {
    Sparkles,
    Brain,
    FileCheck2,
    Shield,
    BarChart3,
    ArrowRight,
    CheckCircle2,
    Users,
    Clock,
    ArrowUpRight,
    Star,
    Monitor,
    ShieldCheck,
    Cpu,
} from 'lucide-react';
import type { PageProps } from '@/types';
import { dashboard, login, register, designSystem } from '@/routes';
import { cn } from '@/lib/utils';

export default function Welcome({
    auth,
}: PageProps<{ laravelVersion: string; phpVersion: string }>) {
    const features = [
        {
            icon: Brain,
            title: 'AI-Powered Generation',
            description:
                "Leverage cutting-edge AI to generate high-quality exam questions aligned with learning objectives and Bloom's taxonomy.",
            className: 'md:col-span-2',
        },
        {
            icon: FileCheck2,
            title: 'Smart TOS',
            description:
                'Automatically create and calculate Table of Specifications to ensure balanced exam distribution.',
            className: 'md:col-span-1',
        },
        {
            icon: Shield,
            title: 'Anti-Duplicate',
            description:
                'Advanced algorithms prevent duplicate questions, maintaining exam integrity.',
            className: 'md:col-span-1',
        },
        {
            icon: BarChart3,
            title: 'Deep Analytics',
            description:
                'Track exam performance, analyze difficulty, and gain insights to improve assessment quality.',
            className: 'md:col-span-2',
        },
    ];

    const pricing = [
        {
            name: 'Free',
            price: '0',
            features: [
                '10 questions per exam',
                'Basic TOS generation',
                'PDF Export',
                'Self-managed hosting',
            ],
            cta: 'Get Started',
            highlighted: false,
        },
        {
            name: 'Pro',
            price: '29',
            features: [
                'Unlimited AI questions',
                'Advanced TOS analytics',
                'DOCX & PDF Export',
                'Priority AI processing',
                'Duplicate detection',
            ],
            cta: 'Start Free Trial',
            highlighted: true,
        },
        {
            name: 'Enterprise',
            price: 'Custom',
            features: [
                'Department-wide access',
                'Custom AI fine-tuning',
                'SLA & Dedicated support',
                'Bulk user management',
                'API Access',
            ],
            cta: 'Contact Sales',
            highlighted: false,
        },
    ];

    return (
        <div className="min-h-screen bg-background selection:bg-primary/30 selection:text-primary">
            <Head title="ExamMaster | AI-Powered Assessment Platform" />

            {/* Background elements */}
            <div className="fixed inset-0 -z-10 overflow-hidden">
                <div className="absolute top-0 right-0 h-[500px] w-[500px] translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-[120px]" />
                <div className="absolute bottom-0 left-0 h-[500px] w-[500px] -translate-x-1/2 translate-y-1/2 rounded-full bg-secondary/20 blur-[120px]" />
                <div className="absolute top-1/2 left-1/2 h-full w-full -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_20%,transparent_100%)] [background-size:40px_40px] opacity-20 dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)]" />
            </div>

            {/* Navigation */}
            <nav className="fixed top-4 left-1/2 z-50 w-[95%] max-w-7xl -translate-x-1/2">
                <div className="glass flex h-16 items-center justify-between rounded-2xl px-6 shadow-2xl">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center overflow-hidden rounded-xl shadow-lg shadow-primary/20">
                            <img
                                src="/images/logo.png"
                                alt="ExamMaster Logo"
                                className="size-full scale-150 object-cover"
                            />
                        </div>
                        <span className="bg-linear-to-r from-primary to-secondary bg-clip-text text-xl font-bold tracking-tight text-transparent">
                            ExamMaster
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        {auth.user ? (
                            <Link
                                href={dashboard()}
                                className="group relative overflow-hidden rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-white transition-all hover:shadow-xl hover:shadow-primary/30"
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    Dashboard
                                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                                </span>
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={login()}
                                    className="px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                                >
                                    Log in
                                </Link>
                                <Link
                                    href={register()}
                                    className="hidden items-center gap-2 rounded-xl bg-linear-to-r from-primary to-secondary px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] sm:inline-flex"
                                >
                                    Get Started
                                    <ArrowUpRight className="size-4" />
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            <main>
                {/* Hero Section */}
                <section className="relative overflow-hidden px-6 pt-32 pb-20 lg:pt-48 lg:pb-32">
                    <div className="mx-auto max-w-7xl">
                        <div className="grid items-center gap-16 lg:grid-cols-2">
                            <div className="relative z-10 text-center lg:text-left">
                                <div className="mb-8 inline-flex animate-in items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary duration-700 fade-in slide-in-from-bottom-4">
                                    <Sparkles className="size-4" />
                                    <span>AI-Powered Assessments</span>
                                </div>
                                <h1 className="mb-8 animate-in text-5xl leading-[1.1] font-extrabold tracking-tight text-foreground duration-1000 fade-in slide-in-from-bottom-6 lg:text-7xl">
                                    Master your <br />
                                    <span className="text-gradient leading-tight">
                                        Assessments
                                    </span>{' '}
                                    <br />
                                    with AI efficiency.
                                </h1>
                                <p className="mx-auto mb-10 max-w-xl animate-in text-lg text-muted-foreground duration-1000 fade-in slide-in-from-bottom-8 lg:mx-0 lg:text-xl">
                                    The most advanced platform for creating,
                                    managing, and analyzing academic exams. Save
                                    hours of manual work and ensure educational
                                    excellence.
                                </p>
                                <div className="flex animate-in flex-col items-center justify-center gap-4 duration-1000 slide-in-from-bottom-10 fade-in sm:flex-row lg:justify-start">
                                    <Link
                                        href={
                                            auth.user ? dashboard() : register()
                                        }
                                        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-8 py-4 text-lg font-bold text-white shadow-2xl shadow-primary/30 transition-all hover:scale-105 hover:bg-primary/90 active:scale-95 sm:w-auto"
                                    >
                                        Start Building Free
                                        <ArrowRight className="size-5" />
                                    </Link>
                                    <button className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-card/50 px-8 py-4 text-lg font-bold text-foreground backdrop-blur-sm transition-all hover:border-accent hover:bg-accent sm:w-auto">
                                        <Monitor className="size-5" />
                                        Request Demo
                                    </button>
                                </div>

                                <div className="mt-12 flex items-center justify-center gap-6 opacity-60 grayscale lg:justify-start">
                                    <span className="text-sm font-medium tracking-widest text-muted-foreground uppercase">
                                        Trusted by over 500+ Educators
                                    </span>
                                </div>
                            </div>

                            <div className="relative flex animate-in items-center justify-center grayscale-0 delay-300 duration-1000 fade-in zoom-in lg:h-[600px]">
                                <div className="absolute inset-0 scale-75 rounded-full bg-linear-to-tr from-primary/30 to-secondary/30 opacity-30 blur-3xl" />
                                <div className="group relative p-4 lg:p-0">
                                    <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-primary to-secondary opacity-25 blur transition duration-1000 group-hover:opacity-50" />
                                    <div className="glass-card relative overflow-hidden rounded-2xl p-2 shadow-2xl lg:p-4">
                                        <img
                                            src="/images/hero.png"
                                            alt="AI-Powered Exam Generation"
                                            className="h-full w-full max-w-[500px] rounded-xl object-cover shadow-lg"
                                        />
                                        <div className="glass absolute top-6 left-6 flex items-center gap-2 rounded-lg border-white/20 px-4 py-2 shadow-xl">
                                            <div className="size-2 animate-pulse rounded-full bg-green-500" />
                                            <span className="text-xs font-bold text-foreground">
                                                AI Generator Active
                                            </span>
                                        </div>
                                        <div className="glass absolute right-6 bottom-6 flex items-center gap-2 rounded-lg border-white/20 px-4 py-2 shadow-xl">
                                            <ShieldCheck className="size-4 text-primary" />
                                            <span className="text-xs font-bold text-foreground">
                                                98.5% Quality Score
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Bento Grid */}
                <section className="relative overflow-hidden px-6 py-24">
                    <div className="mx-auto max-w-7xl">
                        <div className="mb-16 text-center">
                            <h2 className="mb-4 text-3xl font-bold tracking-tight lg:text-5xl">
                                Future-proof your{' '}
                                <span className="text-gradient">workflow</span>
                            </h2>
                            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                                Everything you need to manage a modern
                                educational assessment system in one place.
                            </p>
                        </div>

                        <div className="grid gap-6 md:grid-cols-3">
                            {features.map((feature, i) => (
                                <div
                                    key={i}
                                    className={cn(
                                        'group glass-card relative cursor-default overflow-hidden rounded-3xl p-8 transition-all duration-300 hover:border-primary/50 hover:shadow-primary/5',
                                        feature.className,
                                    )}
                                >
                                    <div className="absolute top-0 right-0 h-48 w-48 translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl" />

                                    <div className="mb-8 w-fit rounded-2xl border border-border bg-card p-3 shadow-sm transition-all duration-500 group-hover:scale-110 group-hover:shadow-lg">
                                        <feature.icon className="size-8 text-primary" />
                                    </div>

                                    <h3 className="mb-4 text-2xl font-bold transition-colors group-hover:text-primary">
                                        {feature.title}
                                    </h3>
                                    <p className="text-lg leading-relaxed text-muted-foreground">
                                        {feature.description}
                                    </p>

                                    <div className="mt-8 flex translate-x-[-10px] items-center gap-2 text-sm font-bold text-primary opacity-0 transition-opacity duration-300 group-hover:translate-x-0 group-hover:opacity-100">
                                        Learn more{' '}
                                        <ArrowRight className="size-4" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Stats / Numbers Section */}
                <section className="relative overflow-hidden border-y border-border/50 bg-secondary/5 py-24">
                    <div className="mx-auto max-w-7xl px-6">
                        <div className="grid grid-cols-2 gap-12 text-center md:grid-cols-4">
                            {[
                                {
                                    label: 'Time Saved',
                                    value: '90%',
                                    icon: Clock,
                                },
                                {
                                    label: 'Questions Generated',
                                    value: '1M+',
                                    icon: Cpu,
                                },
                                {
                                    label: 'Quality Score',
                                    value: '98.5%',
                                    icon: Star,
                                },
                                {
                                    label: 'Active Educators',
                                    value: '500+',
                                    icon: Users,
                                },
                            ].map((stat, i) => (
                                <div key={i} className="space-y-4">
                                    <div className="glass mx-auto mb-6 flex size-12 items-center justify-center rounded-2xl">
                                        <stat.icon className="size-6 text-primary" />
                                    </div>
                                    <div className="text-4xl font-extrabold tracking-tighter text-foreground lg:text-5xl">
                                        {stat.value}
                                    </div>
                                    <div className="text-sm font-bold tracking-widest text-muted-foreground uppercase">
                                        {stat.label}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Pricing Section */}
                <section className="relative px-6 py-32">
                    <div className="mx-auto max-w-7xl">
                        <div className="mb-20 text-center">
                            <h2 className="mb-4 text-3xl font-bold tracking-tight lg:text-5xl">
                                Simple{' '}
                                <span className="text-gradient-accent">
                                    Pricing
                                </span>{' '}
                                for every scale
                            </h2>
                            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                                Choose the plan that best fits your
                                institution's needs. All plans include 24/7
                                security.
                            </p>
                        </div>

                        <div className="grid gap-8 lg:grid-cols-3">
                            {pricing.map((tier, i) => (
                                <div
                                    key={i}
                                    className={cn(
                                        'relative flex flex-col rounded-3xl border border-border bg-card p-8 transition-all duration-300',
                                        tier.highlighted
                                            ? 'border-primary shadow-2xl ring-1 ring-primary/50 lg:scale-105'
                                            : 'hover:shadow-xl',
                                    )}
                                >
                                    {tier.highlighted && (
                                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary px-4 py-1 text-xs font-black tracking-widest text-white uppercase">
                                            Most Popular
                                        </div>
                                    )}

                                    <div className="mb-8">
                                        <h3 className="mb-2 text-xl font-bold">
                                            {tier.name}
                                        </h3>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-4xl font-extrabold">
                                                {tier.price === 'Custom'
                                                    ? ''
                                                    : '$'}
                                            </span>
                                            <span className="text-6xl font-extrabold tracking-tight">
                                                {tier.price}
                                            </span>
                                            {tier.price !== 'Custom' && (
                                                <span className="font-medium text-muted-foreground">
                                                    /month
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <ul className="mb-10 flex-grow space-y-4">
                                        {tier.features.map((feature, j) => (
                                            <li
                                                key={j}
                                                className="flex items-start gap-3"
                                            >
                                                <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                                                    <CheckCircle2 className="size-3 text-primary" />
                                                </div>
                                                <span className="font-medium text-muted-foreground">
                                                    {feature}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>

                                    <Link
                                        href={
                                            auth.user ? dashboard() : register()
                                        }
                                        className={cn(
                                            'w-full rounded-2xl px-6 py-4 text-center font-bold transition-all',
                                            tier.highlighted
                                                ? 'bg-primary text-white shadow-lg shadow-primary/30 hover:scale-105'
                                                : 'bg-muted text-foreground hover:bg-accent',
                                        )}
                                    >
                                        {tier.cta}
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Final CTA */}
                <section className="px-6 py-24">
                    <div className="mx-auto max-w-7xl">
                        <div className="relative overflow-hidden rounded-[3rem] bg-linear-to-br from-primary via-secondary to-primary/80 px-8 py-24 text-center shadow-2xl">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.1)_0,transparent_50%)]" />
                            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff12_1px,transparent_1px),linear-gradient(to_bottom,#ffffff12_1px,transparent_1px)] bg-size-[40px_40px] opacity-20" />

                            <div className="relative z-10">
                                <h2 className="mb-8 text-4xl font-extrabold tracking-tight text-white lg:text-6xl">
                                    Ready to automate <br />
                                    your assessments?
                                </h2>
                                <p className="mx-auto mb-12 max-w-2xl text-xl text-white/90">
                                    Join hundreds of forward-thinking educators
                                    today. <br />
                                    No complex setup, no credit card required.
                                </p>
                                <div className="flex flex-col items-center justify-center gap-6 sm:flex-row">
                                    <Link
                                        href={
                                            auth.user ? dashboard() : register()
                                        }
                                        className="inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-white px-10 py-5 text-xl font-black text-primary shadow-2xl transition-all hover:scale-110 active:scale-95 sm:w-auto"
                                    >
                                        Start Free Now
                                        <ArrowUpRight className="size-6" />
                                    </Link>
                                    <button className="font-bold text-white decoration-white/30 underline-offset-8 hover:underline">
                                        View Documentation
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="border-t border-border bg-card px-6 pt-24 pb-12">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-16 grid gap-12 lg:grid-cols-4">
                        <div className="col-span-2">
                            <div className="mb-8 flex items-center gap-3">
                                <div className="flex size-10 items-center justify-center overflow-hidden rounded-xl">
                                    <img
                                        src="/images/logo.png"
                                        alt="ExamMaster Logo"
                                        className="size-full scale-150 object-cover"
                                    />
                                </div>
                                <span className="text-2xl font-bold tracking-tight text-foreground">
                                    ExamMaster
                                </span>
                            </div>
                            <p className="mb-8 max-w-sm text-lg leading-relaxed text-muted-foreground">
                                Empowering educators with AI-driven tools to
                                create, manage, and analyze high-quality
                                academic exams with ease.
                            </p>
                            <div className="flex gap-4">
                                {[1, 2, 3, 4].map((i) => (
                                    <div
                                        key={i}
                                        className="flex size-10 cursor-pointer items-center justify-center rounded-xl bg-muted transition-colors hover:bg-accent"
                                    >
                                        <div className="size-5 rounded-sm bg-muted-foreground/30" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h4 className="mb-6 text-lg font-bold">Product</h4>
                            <ul className="space-y-4 font-medium text-muted-foreground">
                                <li className="cursor-pointer text-lg transition-colors hover:text-primary">
                                    Features
                                </li>
                                <li className="cursor-pointer text-lg transition-colors hover:text-primary">
                                    AI Generation
                                </li>
                                <li className="cursor-pointer text-lg transition-colors hover:text-primary">
                                    TOS Builder
                                </li>
                                <li className="cursor-pointer text-lg transition-colors hover:text-primary">
                                    Pricing
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="mb-6 text-lg font-bold">Support</h4>
                            <ul className="space-y-4 font-medium text-muted-foreground">
                                <li className="cursor-pointer text-lg transition-colors hover:text-primary">
                                    Documentation
                                </li>
                                <li className="cursor-pointer text-lg transition-colors hover:text-primary">
                                    API Reference
                                </li>
                                <li className="cursor-pointer text-lg transition-colors hover:text-primary">
                                    Community
                                </li>
                                <li className="cursor-pointer text-lg transition-colors hover:text-primary">
                                    Privacy Policy
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="flex flex-col items-center justify-between gap-6 border-t border-border pt-12 font-medium text-muted-foreground md:flex-row">
                        <div className="flex items-center gap-2">
                            <span>
                                © {new Date().getFullYear()} ExamMaster. All
                                rights reserved.
                            </span>
                            <span className="hidden md:inline">•</span>
                            <span>Built with AI by Antigravity</span>
                        </div>
                        <div className="flex items-center gap-8">
                            <Link
                                href={designSystem()}
                                className="cursor-pointer transition-colors hover:text-primary"
                            >
                                Design System
                            </Link>
                            <span className="cursor-pointer transition-colors hover:text-foreground">
                                Status
                            </span>
                            <span className="cursor-pointer transition-colors hover:text-foreground">
                                Terms
                            </span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
