import AppMain, { AppContent } from '@/components/app-main';
import { auth } from '@/lib/auth';
import { getCredits, getLicense } from '@/lib/user-license';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { ErrorBoundary } from '@/components/error';
import { freemius } from '@/lib/freemius';
import PurchaseProvider from '@/components/purchase-provider';
import Credits from '../billing/credits';

export default async function CreditsPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        redirect('/login');
    }

    const license = await getLicense(session.user.id);
    const credits = await getCredits(session.user.id);

    const options = await freemius.checkout.createOptions({
        user: session?.user,
        isSandbox: process.env.NODE_ENV !== 'production',
    });

    return (
        <AppMain title="Credits & Topups" isLoggedIn={true}>
            <AppContent>
                <ErrorBoundary>
                    <PurchaseProvider checkoutOptions={options}>
                        <Credits credits={credits} hasLicense={!!license} />
                    </PurchaseProvider>
                </ErrorBoundary>
            </AppContent>
        </AppMain>
    );
}
