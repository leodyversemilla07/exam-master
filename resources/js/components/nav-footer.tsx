import type { ComponentPropsWithoutRef } from 'react';
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { resolveUrl } from '@/lib/utils';
import type { NavItem } from '@/types';

interface NavFooterProps extends ComponentPropsWithoutRef<typeof SidebarGroup> {
    items: NavItem[];
}

export function NavFooter({ items, className, ...props }: NavFooterProps) {
    return (
        <SidebarGroup
            {...props}
            className={`group-data-[collapsible=icon]:p-0 ${className || ''}`}
        >
            <SidebarGroupContent>
                <SidebarMenu>
                    {items.map((item) => (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                render={<a href={resolveUrl(item.href)} target="_blank" rel="noopener noreferrer" />}
                                className="text-muted-foreground hover:text-foreground"
                            >
                                {item.icon && (
                                    <item.icon className="h-5 w-5" />
                                )}
                                <span>{item.title}</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}
