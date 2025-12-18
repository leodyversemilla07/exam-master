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
import { index as modules } from "@/routes/modules";
import { index as tosgenerates } from "@/routes/tos-generates";
import { index as exams } from "@/routes/exams";
import { index as users } from "@/routes/users";
import { type NavItem, type SharedData } from "@/types";
import { Link, usePage } from "@inertiajs/react";
import {
    LayoutGrid,
    FileText,
    BookOpen,
    TableProperties,
    BookMarked,
    Folder,
    Users,
} from "lucide-react";
import AppLogo from "./app-logo";

const mainNavItems: NavItem[] = [
    {
        title: "Dashboard",
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: "Modules",
        href: modules(),
        icon: BookOpen,
        permission: "view modules",
    },
    {
        title: "Table of Specification",
        href: tosgenerates(),
        icon: TableProperties,
        permission: "view tos",
    },
    {
        title: "Exams",
        href: exams(),
        icon: FileText,
        permission: "view exams",
    },
    {
        title: "Users",
        href: users(),
        icon: Users,
        permission: "view users",
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
    const { auth } = usePage<SharedData>().props;
    const userPermissions = auth.user?.permissions || [];

    const filteredNavItems = mainNavItems.filter((item) => {
        if (!item.permission) {
            return true;
        }
        return userPermissions.includes(item.permission);
    });

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
                <NavMain items={filteredNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
