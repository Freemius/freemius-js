import AppMain, { AppContent } from '@/components/app-main';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { ErrorBoundary } from '@/components/error';
import { freemius } from '@/lib/freemius';
import { CheckoutProvider } from '@/react-starter/components/checkout-provider';
import { Subscribe } from '@/react-starter/components/subscribe';
import { SectionHeading } from '@/react-starter/components/section-heading';
import { Topup } from '@/react-starter/components/topup';

export default async function PurchasePage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        redirect('/login');
    }

    const checkout = await freemius.checkout.create({
        user: session?.user,
        isSandbox: process.env.NODE_ENV !== 'production',
    });

    return (
        <AppMain title="Subscribe" isLoggedIn={true}>
            <AppContent>
                <ErrorBoundary>
                    <CheckoutProvider
                        checkout={checkout.serialize()}
                        endpoint={process.env.NEXT_PUBLIC_APP_URL! + '/api/checkout'}
                    >
                        <SectionHeading>Subscribe to a Plan</SectionHeading>
                        <Subscribe />

                        <div className="mb-20" />

                        <SectionHeading>Make One-off Purchase</SectionHeading>
                        <Topup />
                    </CheckoutProvider>
                </ErrorBoundary>
            </AppContent>
        </AppMain>
    );
}
