'use client';

import { type Icon } from '@tabler/icons-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';

export function NavMain({
    items,
    children,
}: {
    items: {
        title: string;
        url: string;
        icon?: Icon;
    }[];
    children?: React.ReactNode;
}) {
    const pathname = usePathname();

    return (
        <SidebarGroup>
            <SidebarGroupContent className="flex flex-col gap-2">
                <SidebarMenu>
                    {items.map((item) => {
                        const isActive = pathname === item.url;

                        return (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton tooltip={item.title} isActive={isActive} asChild>
                                    <Link href={item.url}>
                                        {item.icon && <item.icon />}
                                        <span>{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        );
                    })}
                    {children}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}
