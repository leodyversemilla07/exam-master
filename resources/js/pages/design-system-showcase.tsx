import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

/**
 * Example component showcasing the ExamMaster Design System
 *
 * This demonstrates:
 * - Color palette usage (primary, secondary, semantic colors)
 * - Typography hierarchy
 * - Component composition
 * - Glass morphism effects
 * - Text gradients
 * - Shadow utilities
 */
export default function DesignSystemShowcase() {
    return (
        <div className="min-h-screen bg-background p-8 space-y-8">
            {/* Hero Section with Gradient Text */}
            <section className="text-center space-y-4">
                <h1 className="text-gradient text-5xl font-bold">ExamMaster Design System</h1>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                    A modern, professional design system crafted for AI-powered exam generation
                </p>
            </section>

            {/* Color Palette Demo */}
            <section className="space-y-4">
                <h2 className="text-3xl font-semibold">Color Palette</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Primary */}
                    <Card className="shadow-primary">
                        <CardHeader>
                            <CardTitle className="text-primary">Primary</CardTitle>
                            <CardDescription>Academic Blue - Main brand color</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button className="w-full">Call to Action</Button>
                        </CardContent>
                    </Card>

                    {/* Secondary */}
                    <Card className="shadow-secondary">
                        <CardHeader>
                            <CardTitle className="text-secondary">Secondary</CardTitle>
                            <CardDescription>AI Purple - Innovation & creativity</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button variant="secondary" className="w-full">
                                <Brain className="mr-2 h-4 w-4" />
                                AI Feature
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Success */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-success">Success</CardTitle>
                            <CardDescription>Educational Green - Completed tasks</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Badge
                                variant="outline"
                                className="bg-success/10 text-success border-success/20"
                            >
                                <CheckCircle2 className="mr-1 h-3 w-3" />
                                Completed
                            </Badge>
                        </CardContent>
                    </Card>

                    {/* Destructive */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-destructive">Destructive</CardTitle>
                            <CardDescription>Alert Red - Errors & warnings</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Badge variant="destructive">
                                <AlertCircle className="mr-1 h-3 w-3" />
                                Error
                            </Badge>
                        </CardContent>
                    </Card>
                </div>
            </section>

            {/* Glass Morphism Effects */}
            <section className="space-y-4">
                <h2 className="text-3xl font-semibold">Glass Morphism</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="glass">
                        <CardHeader>
                            <CardTitle>Subtle Glass Effect</CardTitle>
                            <CardDescription>
                                Semi-transparent background with backdrop blur
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Perfect for overlays and modern UI elements that need depth
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="glass-card">
                        <CardHeader>
                            <CardTitle>Enhanced Glass Card</CardTitle>
                            <CardDescription>
                                Higher opacity with stronger blur for emphasis
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Ideal for important content cards and featured sections
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </section>

            {/* Border Gradient */}
            <section className="space-y-4">
                <h2 className="text-3xl font-semibold">Special Effects</h2>
                <Card className="border-gradient">
                    <CardHeader>
                        <CardTitle className="text-gradient-accent">Premium Feature Card</CardTitle>
                        <CardDescription>With gradient border and gradient text</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            Use gradient borders and text to highlight premium or special features
                        </p>
                        <Button className="shadow-primary">
                            <Sparkles className="mr-2 h-4 w-4" />
                            Unlock Premium
                        </Button>
                    </CardContent>
                </Card>
            </section>

            {/* Typography Hierarchy */}
            <section className="space-y-4">
                <h2 className="text-3xl font-semibold">Typography</h2>
                <Card>
                    <CardContent className="pt-6 space-y-4">
                        <div>
                            <h1 className="mb-2">Heading 1 - Page Title</h1>
                            <p className="text-sm text-muted-foreground">
                                text-4xl lg:text-5xl, semibold, tight tracking
                            </p>
                        </div>
                        <div>
                            <h2 className="mb-2">Heading 2 - Section Header</h2>
                            <p className="text-sm text-muted-foreground">
                                text-3xl lg:text-4xl, semibold, tight tracking
                            </p>
                        </div>
                        <div>
                            <h3 className="mb-2">Heading 3 - Subsection</h3>
                            <p className="text-sm text-muted-foreground">
                                text-2xl lg:text-3xl, semibold, tight tracking
                            </p>
                        </div>
                        <div>
                            <h4 className="mb-2">Heading 4 - Card Title</h4>
                            <p className="text-sm text-muted-foreground">
                                text-xl lg:text-2xl, semibold, tight tracking
                            </p>
                        </div>
                        <div>
                            <p className="mb-2">Body text - Default paragraph</p>
                            <p className="text-sm text-muted-foreground">
                                text-base, regular weight, standard line height
                            </p>
                        </div>
                        <div>
                            <p className="text-sm mb-2">Small text - Secondary information</p>
                            <p className="text-xs text-muted-foreground">
                                text-sm, for less important content
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </section>

            {/* Exam Content Styling */}
            <section className="space-y-4">
                <h2 className="text-3xl font-semibold">Educational Content (Prose)</h2>
                <Card className="prose-exam p-8">
                    <h1>Sample Exam Question</h1>
                    <p>
                        Which of the following best describes the purpose of a Table of
                        Specifications (TOS)?
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>To ensure balanced cognitive level distribution.</li>
                        <li>To automate the grading process.</li>
                        <li>To provide a summary of student attendance.</li>
                        <li>To calculate terminal velocity of educational progress.</li>
                    </ul>
                    <p className="mt-4 text-sm italic text-muted-foreground">
                        Note: The <code>.prose-exam</code> utility ensures questions are highly
                        legible and professional.
                    </p>
                </Card>
            </section>

            {/* Glow Effects */}
            <section className="space-y-4">
                <h2 className="text-3xl font-semibold">Elevation & Glow</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="glow-primary p-12 bg-card rounded-3xl text-center border border-primary/20">
                        <h3 className="text-primary font-bold">Primary Glow</h3>
                        <p className="text-sm text-muted-foreground">
                            Soft atmospheric depth for primary focus
                        </p>
                    </div>
                    <div className="glow-secondary p-12 bg-card rounded-3xl text-center border border-secondary/20">
                        <h3 className="text-secondary font-bold">Secondary Glow</h3>
                        <p className="text-sm text-muted-foreground">
                            Modern highlight for innovative features
                        </p>
                    </div>
                </div>
            </section>

            {/* Button Variants */}
            <section className="space-y-4 pb-12">
                <h2 className="text-3xl font-semibold">Button Variants</h2>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-wrap gap-4">
                            <Button className="shadow-primary">Primary Action</Button>
                            <Button variant="secondary" className="shadow-secondary">
                                Secondary Action
                            </Button>
                            <Button variant="destructive">Destructive</Button>
                            <Button variant="outline">Outline</Button>
                            <Button variant="ghost">Ghost</Button>
                            <Button className="rounded-full px-8">Rounded Full</Button>
                        </div>
                    </CardContent>
                </Card>
            </section>
        </div>
    );
}
