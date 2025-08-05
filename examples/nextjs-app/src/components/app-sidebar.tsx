'use client';

import { ComponentProps, useCallback, useState } from 'react';
import { IconDashboard, IconLogout, IconCoins, IconUser, IconShoppingCart } from '@tabler/icons-react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

import { NavMain } from '@/components/nav-main';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import FSSymbol from '@/components/fs-symbol';
import { Button } from './ui/button';
import { useRouter } from 'next/navigation';
import { signOut } from '@/lib/auth-client';

const data = {
    navMain: [
        {
            title: 'Dashboard',
            url: '/dashboard',
            icon: IconDashboard,
        },
        {
            title: 'Billing & Credits',
            url: '/billing',
            icon: IconCoins,
        },
        {
            title: 'Checkout Testing',
            url: '/checkout-testing',
            icon: IconShoppingCart,
        },
    ],
};

export function AppSidebar({ ...props }: ComponentProps<typeof Sidebar>) {
    const router = useRouter();
    const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);

    const logout = useCallback(async () => {
        setIsLoggingOut(true);

        await signOut();
        setIsLoggingOut(false);

        router.push('/login');
    }, [router, setIsLoggingOut]);

    return (
        <Sidebar collapsible="offcanvas" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
                            <Link href="/dashboard">
                                <span className="w-8 h-8 flex items-center justify-center rounded-md bg-primary text-primary-foreground">
                                    <FSSymbol className="!size-5" />
                                </span>
                                <span className="text-base font-semibold">Node SDK</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={data.navMain} />
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                            <Button variant="ghost" className="w-full justify-start" onClick={logout}>
                                {isLoggingOut ? (
                                    <span className="animate-spin">
                                        <Loader2 size={16} className="animate-spin" />
                                    </span>
                                ) : (
                                    <IconLogout size={16} />
                                )}
                                Log out
                            </Button>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}
