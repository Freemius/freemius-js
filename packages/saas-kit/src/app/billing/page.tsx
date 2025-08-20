import AppMain, { AppContent } from '@/components/app-main';
import Portal from './portal';
import { auth } from '@/lib/auth';
import { freemius } from '@/lib/freemius';
import { getLicense } from '@/lib/user-license';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { ErrorBoundary } from '@/components/error';
import { PortalData } from '@freemius/sdk';

export default async function Billing() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        redirect('/login');
    }

    const license = await getLicense(session.user.id);

    let fsPurchase: Promise<PortalData | null> = Promise.resolve(null);

    if (license) {
        fsPurchase = freemius.customerPortal.retrieveData(
            license.fsUserId,
            process.env.NEXT_PUBLIC_APP_URL! + '/api/portal',
            license.fsLicenseId,
            process.env.NODE_ENV === 'development'
        );
    }

    return (
        <AppMain title="Billing" isLoggedIn={true}>
            <AppContent>
                <ErrorBoundary>
                    <Suspense fallback={<div>Loading purchase data...</div>}>
                        <Portal portalData={fsPurchase} />
                    </Suspense>
                </ErrorBoundary>
            </AppContent>
        </AppMain>
    );
}
