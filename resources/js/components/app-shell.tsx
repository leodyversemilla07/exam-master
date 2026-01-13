import { SidebarProvider } from "@/components/ui/sidebar";
import { type SharedData } from "@/types";
import { usePage } from "@inertiajs/react";
import { useEffect, useState } from "react";

interface AppShellProps {
    children: React.ReactNode;
    variant?: "header" | "sidebar";
}

// Helper function to get cookie value
function getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
        return parts.pop()?.split(';').shift() || null;
    }
    return null;
}

export function AppShell({ children, variant = "header" }: AppShellProps) {
    const serverSidebarOpen = usePage<SharedData>().props.sidebarOpen;
    const [sidebarOpen, setSidebarOpen] = useState<boolean | undefined>(undefined);

    useEffect(() => {
        // Read the sidebar state from the cookie
        const cookieValue = getCookie("sidebar_state");

        if (cookieValue !== null) {
            // Cookie exists, use its value
            setSidebarOpen(cookieValue === "true");
        } else {
            // No cookie, use server-side value or default to true
            setSidebarOpen(serverSidebarOpen ?? true);
        }
    }, [serverSidebarOpen]);

    if (variant === "header") {
        return (
            <div className="flex min-h-screen w-full flex-col">{children}</div>
        );
    }

    // Show loading state while checking cookie to avoid flash of white
    if (sidebarOpen === undefined) {
        return (
            <div className="flex min-h-screen w-full items-center justify-center bg-background">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    return <SidebarProvider defaultOpen={sidebarOpen}>{children}</SidebarProvider>;
}
