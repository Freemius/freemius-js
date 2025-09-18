import AppMain, { AppContent } from '@/components/app-main';
import { auth } from '@/lib/auth';
import { getCredits, getUserEntitlement } from '@/lib/user-entitlement';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { ErrorBoundary } from '@/components/error';
import { freemius } from '@/lib/freemius';
import CheckoutWithConfettiProvider from '@/components/checkout-with-confetti-provider';
import Credits from './credits';

export default async function CreditsPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        redirect('/login');
    }

    const entitlement = await getUserEntitlement(session.user.id);
    const credits = await getCredits(session.user.id);

    const checkout = await freemius.checkout.create({
        user: session?.user,
        isSandbox: process.env.NODE_ENV !== 'production',
    });

    return (
        <AppMain title="Credits & Topups" isLoggedIn={true}>
            <AppContent>
                <ErrorBoundary>
                    <CheckoutWithConfettiProvider checkout={checkout.serialize()}>
                        <Credits credits={credits} hasSubscription={!!entitlement} />
                    </CheckoutWithConfettiProvider>
                </ErrorBoundary>
            </AppContent>
        </AppMain>
    );
}
