import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { index as modules } from '@/routes/modules';
import { index as tosgenerates } from '@/routes/tos-generates';
import { index as questionBank } from '@/routes/question-bank';
import { index as examBuilder } from '@/routes/exam-builder';
import { index as examSessions } from '@/routes/exam-sessions';
import { index as users } from '@/routes/users';
import { index as analytics } from '@/routes/analytics';
import { index as systemLogs } from '@/routes/system-logs';
import { index as queueMonitor } from '@/routes/queue-monitor';
import { dashboard as studentDashboard } from '@/routes/student';
import { history as examHistory } from '@/routes/student/exam';
import { type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    LayoutGrid,
    BookOpen,
    TableProperties,
    BookMarked,
    Folder,
    Users,
    ClipboardList,
    MessageSquare,
    BarChart3,
    ScrollText,
    Activity,
    PlayCircle,
    GraduationCap,
    Clock,
} from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Modules',
        href: modules(),
        icon: BookOpen,
        permission: 'view modules',
    },
    {
        title: 'Table of Specification',
        href: tosgenerates(),
        icon: TableProperties,
        permission: 'view tos',
    },
    {
        title: 'Question Bank',
        href: questionBank(),
        icon: MessageSquare,
        permission: 'view exams',
    },
    {
        title: 'Exam Builder',
        href: examBuilder(),
        icon: ClipboardList,
        permission: 'create exams',
    },
    {
        title: 'Exam Sessions',
        href: examSessions(),
        icon: PlayCircle,
        permission: 'create exam sessions',
    },
    {
        title: 'Analytics',
        href: analytics(),
        icon: BarChart3,
        permission: 'view analytics',
    },
    {
        title: 'Users',
        href: users(),
        icon: Users,
        permission: 'view users',
    },
    {
        title: 'System Logs',
        href: systemLogs(),
        icon: ScrollText,
        permission: 'view users',
    },
    {
        title: 'Queue Monitor',
        href: queueMonitor(),
        icon: Activity,
        permission: 'view users',
    },
];

const studentNavItems: NavItem[] = [
    {
        title: 'Student Dashboard',
        href: studentDashboard(),
        icon: GraduationCap,
        permission: 'take exams',
    },
    {
        title: 'Exam History',
        href: examHistory(),
        icon: Clock,
        permission: 'view own results',
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/hisangge/ExamMaster',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs',
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

    const filteredStudentNavItems = studentNavItems.filter((item) => {
        if (!item.permission) {
            return true;
        }
        return userPermissions.includes(item.permission);
    });

    const allNavItems = [...filteredNavItems, ...filteredStudentNavItems];

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
                <NavMain items={allNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
