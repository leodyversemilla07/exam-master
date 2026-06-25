import { usePage } from '@inertiajs/react';
import { useState } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import type { SharedData } from '@/types';

interface AppShellProps {
    children: React.ReactNode;
    variant?: 'header' | 'sidebar';
}

function getInitialSidebarState(serverSidebarOpen: boolean): boolean {
    const value = `; ${document.cookie}`;
    const name = 'sidebar_state';
    const parts = value.split(`; ${name}=`);

    if (parts.length === 2) {
        const cookieValue = parts.pop()?.split(';').shift() || null;

        if (cookieValue !== null) {
            return cookieValue === 'true';
        }
    }

    return serverSidebarOpen ?? true;
}

export function AppShell({ children, variant = 'header' }: AppShellProps) {
    const serverSidebarOpen = usePage<SharedData>().props.sidebarOpen;
    const [sidebarOpen] = useState<boolean>(() =>
        getInitialSidebarState(serverSidebarOpen ?? true),
    );

    if (variant === 'header') {
        return (
            <div className="flex min-h-screen w-full flex-col">{children}</div>
        );
    }

    return (
        <SidebarProvider defaultOpen={sidebarOpen}>{children}</SidebarProvider>
    );
}
