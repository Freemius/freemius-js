import AppMain, { AppContent } from '@/components/app-main';
import { auth } from '@/lib/auth';
import { freemius } from '@/lib/freemius';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { ErrorBoundary } from '@/components/error';
import { CustomerPortal } from '@/react-starter/components/customer-portal';
import CheckoutWithConfettiProvider from '@/components/checkout-with-confetti-provider';

export default async function Billing() {
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
        <AppMain title="Billing" isLoggedIn={true}>
            <AppContent>
                <ErrorBoundary>
                    <CheckoutWithConfettiProvider checkout={checkout.serialize()}>
                        <CustomerPortal endpoint={process.env.NEXT_PUBLIC_APP_URL! + '/api/portal'} />
                    </CheckoutWithConfettiProvider>
                </ErrorBoundary>
            </AppContent>
        </AppMain>
    );
}
