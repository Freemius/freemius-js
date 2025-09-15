import AppMain, { AppContent } from '@/components/app-main';
import { auth } from '@/lib/auth';
import { getCredits, getUserLicense } from '@/lib/user-license';
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

    const license = await getUserLicense(session.user.id);
    const credits = await getCredits(session.user.id);

    const checkout = freemius.checkout.create({
        user: session?.user,
        isSandbox: process.env.NODE_ENV !== 'production',
    });

    return (
        <AppMain title="Credits & Topups" isLoggedIn={true}>
            <AppContent>
                <ErrorBoundary>
                    <CheckoutWithConfettiProvider checkout={await checkout.serialize()}>
                        <Credits credits={credits} hasLicense={!!license} />
                    </CheckoutWithConfettiProvider>
                </ErrorBoundary>
            </AppContent>
        </AppMain>
    );
}
