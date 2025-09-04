'use client';

import { ComponentProps, useCallback, useState } from 'react';
import {
    IconSparkles,
    IconLogout,
    IconCoins,
    IconUserPlus,
    IconLogin2,
    IconReceipt,
    IconShoppingBagPlus,
    IconShieldHeart,
} from '@tabler/icons-react';
import Link from 'next/link';
import { Loader2, SparkleIcon } from 'lucide-react';

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
import { useRouter } from 'next/navigation';
import { signOut } from '@/lib/auth-client';

const data = {
    navMain: [
        {
            title: 'New Chat',
            url: '/chat',
            icon: IconSparkles,
        },
    ],
    navFooterLoggedIn: [
        {
            title: 'Billing & Payments',
            url: '/billing',
            icon: IconReceipt,
        },
        {
            title: 'Credits & Topups',
            url: '/credits',
            icon: IconCoins,
        },
        {
            title: 'Purchase Demo',
            url: '/purchase',
            icon: IconShoppingBagPlus,
        },
        {
            title: 'Paywall Demo',
            url: '/paywall',
            icon: IconShieldHeart,
        },
    ],
    navFooterLoggedOut: [
        {
            title: 'Login',
            url: '/login',
            icon: IconLogin2,
        },
        {
            title: 'Register',
            url: '/register',
            icon: IconUserPlus,
        },
    ],
};

export function AppSidebar({ isLoggedIn, ...props }: ComponentProps<typeof Sidebar> & { isLoggedIn?: boolean }) {
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
                            <Link href="/chat">
                                <span className="w-8 h-8 flex items-center justify-center rounded-md bg-primary text-primary-foreground">
                                    <SparkleIcon className="!size-5" />
                                </span>
                                <span className="text-base font-semibold">Awesome AI</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={data.navMain} />
            </SidebarContent>
            <SidebarFooter>
                {isLoggedIn ? (
                    <>
                        <NavMain items={data.navFooterLoggedIn}>
                            <SidebarMenuItem>
                                <SidebarMenuButton onClick={logout}>
                                    {isLoggingOut ? (
                                        <Loader2 size={16} className="animate-spin" />
                                    ) : (
                                        <IconLogout size={16} />
                                    )}
                                    Log out
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </NavMain>
                    </>
                ) : (
                    <NavMain items={data.navFooterLoggedOut} />
                )}
            </SidebarFooter>
        </Sidebar>
    );
}
