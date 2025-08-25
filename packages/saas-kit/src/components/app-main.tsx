import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

export default async function AppMain({
    children,
    title,
    isLoggedIn,
}: {
    children: React.ReactNode;
    title: React.ReactNode;
    isLoggedIn: boolean;
}) {
    return (
        <SidebarProvider
            style={
                {
                    '--sidebar-width': 'calc(var(--spacing) * 72)',
                    '--header-height': 'calc(var(--spacing) * 12)',
                } as React.CSSProperties
            }
        >
            <AppSidebar variant="inset" isLoggedIn={isLoggedIn} />
            <SidebarInset>
                <SiteHeader title={title} />
                <div className="flex flex-1 flex-col">
                    <div className="@container/main flex flex-1 flex-col gap-2">
                        <div className="flex flex-col gap-4 md:gap-6">{children}</div>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}

export function AppContent({ children }: { children: React.ReactNode }) {
    return <div className="p-4 md:p-6 max-w-4xl">{children}</div>;
}
