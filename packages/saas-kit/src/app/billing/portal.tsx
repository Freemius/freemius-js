'use client';

import { PortalData } from '@freemius/sdk';
import { use } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { RestorePurchase } from '@/components/restore-purchase';
import CustomerPortal from '@freemius/saas-starter/components/customer-portal';
import PurchaseProvider, { useConfirmPurchase } from '@/components/purchase-provider';

export default function Purchase(props: { portalData: Promise<PortalData | null> }) {
    const portalData = use(props.portalData) as PortalData | null;
    const { confirmPurchase: syncPurchase } = useConfirmPurchase();

    if (!portalData) {
        return (
            <Alert className="text-xl">
                <AlertTitle className="mb-4">Please subscribe to use our product</AlertTitle>
                <AlertDescription>
                    <p>
                        It looks like you don&apos;t have any active susbcription with us. Please subscribe to use our
                        awesome AI app. In case you have already purchased and do not see it here, please click the
                        button below to try and restore your purchase.
                    </p>
                    <p className="mt-2">
                        <RestorePurchase />
                    </p>
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <PurchaseProvider checkoutOptions={portalData.checkoutOptions}>
            <CustomerPortal portalData={portalData} afterPurchase={syncPurchase} />
        </PurchaseProvider>
    );
}
