import { NavFooter } from "@/components/nav-footer";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import { dashboard } from "@/routes";
import { index as usermanagements } from "@/routes/usermanagements";
import { index as modmanagements } from "@/routes/modmanagements";
import { index as tosgenerates } from "@/routes/tosgenerates";
import { type NavItem } from "@/types";
import { Link } from "@inertiajs/react";
import {
    LayoutGrid,
    FileText,
    BookOpen,
    TableProperties,
    BookMarked,
    Folder,
} from "lucide-react";
import AppLogo from "./app-logo";

const mainNavItems: NavItem[] = [
    {
        title: "Dashboard",
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: "Exam",
        href: usermanagements(),
        icon: FileText,
    },
    {
        title: "Module",
        href: modmanagements(),
        icon: BookOpen,
    },
    {
        title: "Table of Specification",
        href: tosgenerates(),
        icon: TableProperties,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: "Repository",
        href: "https://github.com/hisangge/ExamMaster",
        icon: Folder,
    },
    {
        title: "Documentation",
        href: "https://laravel.com/docs",
        icon: BookMarked,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()}>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
