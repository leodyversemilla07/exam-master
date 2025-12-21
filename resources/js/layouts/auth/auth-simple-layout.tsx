import AppLogoIcon from "@/components/app-logo-icon";
import { Link } from "@inertiajs/react";
import { type PropsWithChildren } from "react";

interface AuthLayoutProps {
    name?: string;
    title?: string;
    description?: string;
}

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: PropsWithChildren<AuthLayoutProps>) {
    return (
        <div className="relative flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
            {/* Background Pattern */}
            <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px]"></div>
            
            {/* Gradient Orbs */}
            <div className="absolute top-0 right-0 -z-10 h-96 w-96 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full blur-3xl opacity-50"></div>
            <div className="absolute bottom-0 left-0 -z-10 h-96 w-96 bg-gradient-to-tr from-secondary/20 to-primary/20 rounded-full blur-3xl opacity-50"></div>

            <div className="w-full max-w-sm">
                <div className="flex flex-col gap-8 glass-card p-8 rounded-2xl">
                    <div className="flex flex-col items-center gap-4">
                        <Link
                            href="/"
                            className="flex flex-col items-center gap-2 font-medium group"
                        >
                            <div className="mb-1 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary shadow-primary transition-transform group-hover:scale-110">
                                <AppLogoIcon className="size-7 fill-current text-primary-foreground" />
                            </div>
                            <span className="sr-only">{title}</span>
                        </Link>

                        <div className="space-y-2 text-center">
                            <h1 className="text-2xl font-bold">{title}</h1>
                            <p className="text-center text-sm text-muted-foreground">
                                {description}
                            </p>
                        </div>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
