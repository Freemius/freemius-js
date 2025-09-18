import AppMain, { AppContent } from '@/components/app-main';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { ErrorBoundary } from '@/components/error';
import { freemius } from '@/lib/freemius';
import { CheckoutProvider } from '@/react-starter/components/checkout-provider';
import PaywallDemo from './paywall-demo';

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
        <AppMain title="Paywall" isLoggedIn={true}>
            <AppContent>
                <ErrorBoundary>
                    <CheckoutProvider
                        checkout={checkout.serialize()}
                        endpoint={process.env.NEXT_PUBLIC_APP_URL! + '/api/checkout'}
                    >
                        <PaywallDemo />
                    </CheckoutProvider>
                </ErrorBoundary>
            </AppContent>
        </AppMain>
    );
}
