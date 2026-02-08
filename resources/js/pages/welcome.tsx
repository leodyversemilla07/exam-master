import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { dashboard, login, register, designSystem } from '@/routes';
import { cn } from '@/lib/utils';
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
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[500px] h-[500px] bg-primary/20 blur-[120px] rounded-full" />
                <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-secondary/20 blur-[120px] rounded-full" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:40px_40px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_20%,transparent_100%)] opacity-20 dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)]" />
            </div>

            {/* Navigation */}
            <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-7xl">
                <div className="glass flex h-16 items-center justify-between rounded-2xl px-6 shadow-2xl">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-xl overflow-hidden shadow-lg shadow-primary/20">
                            <img
                                src="/images/logo.png"
                                alt="ExamMaster Logo"
                                className="size-full object-cover scale-150"
                            />
                        </div>
                        <span className="text-xl font-bold tracking-tight bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
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
                                    className="hidden sm:inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-primary to-secondary px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
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
                <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden px-6">
                    <div className="mx-auto max-w-7xl">
                        <div className="grid lg:grid-cols-2 gap-16 items-center">
                            <div className="relative z-10 text-center lg:text-left">
                                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                    <Sparkles className="size-4" />
                                    <span>AI-Powered Assessments</span>
                                </div>
                                <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-foreground leading-[1.1] mb-8 animate-in fade-in slide-in-from-bottom-6 duration-1000">
                                    Master your <br />
                                    <span className="text-gradient leading-tight">
                                        Assessments
                                    </span>{' '}
                                    <br />
                                    with AI efficiency.
                                </h1>
                                <p className="text-lg lg:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                                    The most advanced platform for creating, managing, and analyzing
                                    academic exams. Save hours of manual work and ensure educational
                                    excellence.
                                </p>
                                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 animate-in fade-in slide-in-from-bottom-10 duration-1000">
                                    <Link
                                        href={auth.user ? dashboard() : register()}
                                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-8 py-4 text-lg font-bold text-white shadow-2xl shadow-primary/30 transition-all hover:scale-105 hover:bg-primary/90 active:scale-95"
                                    >
                                        Start Building Free
                                        <ArrowRight className="size-5" />
                                    </Link>
                                    <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-card/50 backdrop-blur-sm px-8 py-4 text-lg font-bold text-foreground transition-all hover:bg-accent hover:border-accent">
                                        <Monitor className="size-5" />
                                        Request Demo
                                    </button>
                                </div>

                                <div className="mt-12 flex items-center justify-center lg:justify-start gap-6 grayscale opacity-60">
                                    <span className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
                                        Trusted by over 500+ Educators
                                    </span>
                                </div>
                            </div>

                            <div className="relative lg:h-[600px] flex items-center justify-center grayscale-0 animate-in zoom-in fade-in duration-1000 delay-300">
                                <div className="absolute inset-0 bg-linear-to-tr from-primary/30 to-secondary/30 blur-3xl opacity-30 rounded-full scale-75" />
                                <div className="relative group p-4 lg:p-0">
                                    <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000" />
                                    <div className="relative glass-card rounded-2xl p-2 lg:p-4 overflow-hidden shadow-2xl">
                                        <img
                                            src="/images/hero.png"
                                            alt="AI-Powered Exam Generation"
                                            className="rounded-xl object-cover w-full h-full max-w-[500px] shadow-lg"
                                        />
                                        <div className="absolute top-6 left-6 glass px-4 py-2 rounded-lg flex items-center gap-2 shadow-xl border-white/20">
                                            <div className="size-2 bg-green-500 rounded-full animate-pulse" />
                                            <span className="text-xs font-bold text-foreground">
                                                AI Generator Active
                                            </span>
                                        </div>
                                        <div className="absolute bottom-6 right-6 glass px-4 py-2 rounded-lg flex items-center gap-2 shadow-xl border-white/20">
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
                <section className="py-24 px-6 relative overflow-hidden">
                    <div className="mx-auto max-w-7xl">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl lg:text-5xl font-bold tracking-tight mb-4">
                                Future-proof your <span className="text-gradient">workflow</span>
                            </h2>
                            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                                Everything you need to manage a modern educational assessment system
                                in one place.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6">
                            {features.map((feature, i) => (
                                <div
                                    key={i}
                                    className={cn(
                                        'group relative glass-card p-8 rounded-3xl transition-all duration-300 hover:border-primary/50 hover:shadow-primary/5 cursor-default overflow-hidden',
                                        feature.className,
                                    )}
                                >
                                    <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-48 h-48 bg-primary/5 blur-3xl rounded-full" />

                                    <div className="mb-8 p-3 rounded-2xl bg-card border border-border shadow-sm w-fit group-hover:scale-110 group-hover:shadow-lg transition-all duration-500">
                                        <feature.icon className="size-8 text-primary" />
                                    </div>

                                    <h3 className="text-2xl font-bold mb-4 group-hover:text-primary transition-colors">
                                        {feature.title}
                                    </h3>
                                    <p className="text-muted-foreground leading-relaxed text-lg">
                                        {feature.description}
                                    </p>

                                    <div className="mt-8 flex items-center gap-2 text-sm font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity translate-x-[-10px] group-hover:translate-x-0 duration-300">
                                        Learn more <ArrowRight className="size-4" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Stats / Numbers Section */}
                <section className="py-24 relative overflow-hidden border-y border-border/50 bg-secondary/5">
                    <div className="mx-auto max-w-7xl px-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
                            {[
                                { label: 'Time Saved', value: '90%', icon: Clock },
                                { label: 'Questions Generated', value: '1M+', icon: Cpu },
                                { label: 'Quality Score', value: '98.5%', icon: Star },
                                { label: 'Active Educators', value: '500+', icon: Users },
                            ].map((stat, i) => (
                                <div key={i} className="space-y-4">
                                    <div className="mx-auto size-12 flex items-center justify-center rounded-2xl glass mb-6">
                                        <stat.icon className="size-6 text-primary" />
                                    </div>
                                    <div className="text-4xl lg:text-5xl font-extrabold tracking-tighter text-foreground">
                                        {stat.value}
                                    </div>
                                    <div className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                                        {stat.label}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Pricing Section */}
                <section className="py-32 px-6 relative">
                    <div className="mx-auto max-w-7xl">
                        <div className="text-center mb-20">
                            <h2 className="text-3xl lg:text-5xl font-bold tracking-tight mb-4">
                                Simple <span className="text-gradient-accent">Pricing</span> for
                                every scale
                            </h2>
                            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                                Choose the plan that best fits your institution's needs. All plans
                                include 24/7 security.
                            </p>
                        </div>

                        <div className="grid lg:grid-cols-3 gap-8">
                            {pricing.map((tier, i) => (
                                <div
                                    key={i}
                                    className={cn(
                                        'relative flex flex-col p-8 rounded-3xl border border-border bg-card transition-all duration-300',
                                        tier.highlighted
                                            ? 'lg:scale-105 shadow-2xl border-primary ring-1 ring-primary/50'
                                            : 'hover:shadow-xl',
                                    )}
                                >
                                    {tier.highlighted && (
                                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary px-4 py-1 rounded-full text-xs font-black text-white uppercase tracking-widest">
                                            Most Popular
                                        </div>
                                    )}

                                    <div className="mb-8">
                                        <h3 className="text-xl font-bold mb-2">{tier.name}</h3>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-4xl font-extrabold">
                                                {tier.price === 'Custom' ? '' : '$'}
                                            </span>
                                            <span className="text-6xl font-extrabold tracking-tight">
                                                {tier.price}
                                            </span>
                                            {tier.price !== 'Custom' && (
                                                <span className="text-muted-foreground font-medium">
                                                    /month
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <ul className="space-y-4 mb-10 flex-grow">
                                        {tier.features.map((feature, j) => (
                                            <li key={j} className="flex items-start gap-3">
                                                <div className="size-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                                                    <CheckCircle2 className="size-3 text-primary" />
                                                </div>
                                                <span className="text-muted-foreground font-medium">
                                                    {feature}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>

                                    <Link
                                        href={auth.user ? dashboard() : register()}
                                        className={cn(
                                            'w-full py-4 px-6 rounded-2xl text-center font-bold transition-all',
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
                <section className="py-24 px-6">
                    <div className="mx-auto max-w-7xl">
                        <div className="relative overflow-hidden rounded-[3rem] bg-linear-to-br from-primary via-secondary to-primary/80 px-8 py-24 text-center shadow-2xl">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.1)_0,transparent_50%)]" />
                            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff12_1px,transparent_1px),linear-gradient(to_bottom,#ffffff12_1px,transparent_1px)] bg-size-[40px_40px] opacity-20" />

                            <div className="relative z-10">
                                <h2 className="text-4xl lg:text-6xl font-extrabold text-white tracking-tight mb-8">
                                    Ready to automate <br />
                                    your assessments?
                                </h2>
                                <p className="text-xl text-white/90 max-w-2xl mx-auto mb-12">
                                    Join hundreds of forward-thinking educators today. <br />
                                    No complex setup, no credit card required.
                                </p>
                                <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                                    <Link
                                        href={auth.user ? dashboard() : register()}
                                        className="w-full sm:w-auto inline-flex items-center justify-center gap-3 rounded-2xl bg-white px-10 py-5 text-xl font-black text-primary transition-all hover:scale-110 active:scale-95 shadow-2xl"
                                    >
                                        Start Free Now
                                        <ArrowUpRight className="size-6" />
                                    </Link>
                                    <button className="text-white font-bold hover:underline decoration-white/30 underline-offset-8">
                                        View Documentation
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-card pt-24 pb-12 px-6 border-t border-border">
                <div className="mx-auto max-w-7xl">
                    <div className="grid lg:grid-cols-4 gap-12 mb-16">
                        <div className="col-span-2">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="flex size-10 items-center justify-center rounded-xl overflow-hidden">
                                    <img
                                        src="/images/logo.png"
                                        alt="ExamMaster Logo"
                                        className="size-full object-cover scale-150"
                                    />
                                </div>
                                <span className="text-2xl font-bold tracking-tight text-foreground">
                                    ExamMaster
                                </span>
                            </div>
                            <p className="text-muted-foreground text-lg max-w-sm mb-8 leading-relaxed">
                                Empowering educators with AI-driven tools to create, manage, and
                                analyze high-quality academic exams with ease.
                            </p>
                            <div className="flex gap-4">
                                {[1, 2, 3, 4].map((i) => (
                                    <div
                                        key={i}
                                        className="size-10 rounded-xl bg-muted flex items-center justify-center cursor-pointer hover:bg-accent transition-colors"
                                    >
                                        <div className="size-5 bg-muted-foreground/30 rounded-sm" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h4 className="font-bold text-lg mb-6">Product</h4>
                            <ul className="space-y-4 text-muted-foreground font-medium">
                                <li className="hover:text-primary transition-colors cursor-pointer text-lg">
                                    Features
                                </li>
                                <li className="hover:text-primary transition-colors cursor-pointer text-lg">
                                    AI Generation
                                </li>
                                <li className="hover:text-primary transition-colors cursor-pointer text-lg">
                                    TOS Builder
                                </li>
                                <li className="hover:text-primary transition-colors cursor-pointer text-lg">
                                    Pricing
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold text-lg mb-6">Support</h4>
                            <ul className="space-y-4 text-muted-foreground font-medium">
                                <li className="hover:text-primary transition-colors cursor-pointer text-lg">
                                    Documentation
                                </li>
                                <li className="hover:text-primary transition-colors cursor-pointer text-lg">
                                    API Reference
                                </li>
                                <li className="hover:text-primary transition-colors cursor-pointer text-lg">
                                    Community
                                </li>
                                <li className="hover:text-primary transition-colors cursor-pointer text-lg">
                                    Privacy Policy
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="pt-12 border-t border-border flex flex-col md:flex-row items-center justify-between gap-6 text-muted-foreground font-medium">
                        <div className="flex items-center gap-2">
                            <span>
                                © {new Date().getFullYear()} ExamMaster. All rights reserved.
                            </span>
                            <span className="hidden md:inline">•</span>
                            <span>Built with AI by Antigravity</span>
                        </div>
                        <div className="flex items-center gap-8">
                            <Link
                                href={designSystem()}
                                className="hover:text-primary transition-colors cursor-pointer"
                            >
                                Design System
                            </Link>
                            <span className="hover:text-foreground transition-colors cursor-pointer">
                                Status
                            </span>
                            <span className="hover:text-foreground transition-colors cursor-pointer">
                                Terms
                            </span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
