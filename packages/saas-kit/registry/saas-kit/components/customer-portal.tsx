'use client';

import * as React from 'react';
import { PortalData, PurchaseData } from '@freemius/sdk';
import { PrimarySubscription } from './primary-subscription';
import { BillingSection } from './billing-section';
import { PaymentsSection } from './payments-section';
import { CheckoutContext } from '../hooks/checkout';
import { useContext } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { usePortalData } from '../hooks/data';
import { useLocale } from '../utils/locale';
import { Subscribe } from './subscribe';
import { RestorePurchase } from './restore-purchase';
import { CheckoutProvider } from './checkout-provider';
import { PortalContext } from '../hooks/portal';
import { SectionHeading } from './section-heading';
import { PricingTable } from './pricing-table';

export function CustomerPortal(props: { endpoint: string }) {
    const { endpoint } = props;
    const checkoutContext = useContext(CheckoutContext);
    const { data, error, isLoading, refetch } = usePortalData(endpoint);
    const locale = useLocale();

    const onRestored = React.useCallback(
        (data: PurchaseData[] | null) => {
            if (data && data.length > 0) {
                if (typeof window !== 'undefined') {
                    window.alert(locale.refreshPurchase.alert.restored(data.length));
                }
                // Refetch portal data after restoring purchases
                refetch();
            } else {
                if (typeof window !== 'undefined') {
                    window.alert(locale.refreshPurchase.alert.nothingToRestore());
                }
            }
        },
        [refetch, locale]
    );

    const refresh = React.useCallback(() => {
        refetch();
    }, [refetch]);

    const portalContextValue = React.useMemo(() => ({ endpoint }), [endpoint]);

    if (!checkoutContext) {
        throw new Error('CustomerPortal must be used within a CheckoutProvider');
    }

    if (error) {
        return (
            <div className="text-center text-destructive">
                {locale.portal.error.fetchingData()}: {error.message}
            </div>
        );
    }

    return (
        <PortalContext.Provider value={portalContextValue}>
            <CheckoutProvider
                onAfterSync={refresh}
                endpoint={checkoutContext.endpoint}
                checkout={checkoutContext.serializedData}
            >
                {isLoading || undefined === data ? (
                    <CustomerPortalSkeleton />
                ) : !data ? (
                    <CustomerPortalEmpty endpoint={endpoint} onSubscribe={refetch} onRestore={onRestored} />
                ) : (
                    <CustomerPortalUi portalData={data} refresh={refetch} />
                )}
            </CheckoutProvider>
        </PortalContext.Provider>
    );
}

export function CustomerPortalEmpty(props: {
    endpoint: string;
    onSubscribe: () => void;
    onRestore?: (data: PurchaseData[] | null) => void;
}) {
    const { endpoint, onSubscribe, onRestore } = props;
    const locale = useLocale();

    return (
        <>
            <div className="max-w-[65ch] text-center mx-auto">
                <h2 className="mb-2 text-lg font-semibold">{locale.portal.subscribe.title()}</h2>
                <p className="mb-10">{locale.portal.subscribe.message()}</p>
            </div>
            <Subscribe onCheckout={onSubscribe} />
            <div className="mt-10 max-w-[65ch] mx-auto text-center">
                <p className="text-muted-foreground mb-5">{locale.portal.empty.message.restore()}</p>

                <RestorePurchase portalEndpoint={endpoint} onRestored={onRestore} />
            </div>
        </>
    );
}

export function CustomerPortalUi(props: { portalData: PortalData; refresh: () => void }) {
    const { portalData, refresh } = props;
    const locale = useLocale();

    return (
        <div className="fs-saas-starter-portal flex flex-col gap-16">
            {portalData.subscriptions.primary ? (
                <PrimarySubscription
                    subscription={portalData.subscriptions.primary}
                    plans={portalData.plans}
                    sellingUnit={portalData.sellingUnit}
                    cancellationCoupons={portalData.cancellationCoupons}
                    afterCancel={refresh}
                    afterCouponApplied={refresh}
                />
            ) : null}

            {portalData.subscriptions.primary && !portalData.subscriptions.primary.isActive ? (
                <div>
                    <SectionHeading>{locale.portal.subscribe.title()}</SectionHeading>
                    <PricingTable plans={portalData.plans} />
                </div>
            ) : null}

            {portalData.billing ? <BillingSection billing={portalData.billing} user={portalData.user} /> : null}

            {portalData.payments && portalData.payments.length > 0 ? (
                <PaymentsSection payments={portalData.payments} unit={portalData.sellingUnit} />
            ) : null}
            {/* <pre>{JSON.stringify(portalData, null, 2)}</pre> */}
        </div>
    );
}

export function CustomerPortalSkeleton() {
    return (
        <div className="fs-saas-starter-portal flex flex-col gap-16">
            {/* Current Subscription Section */}
            <div className="flex flex-col gap-6">
                {/* "CURRENT SUBSCRIPTION" header */}
                <div className="border-b border-b-muted border-solid mb-2 pb-4 w-full">
                    <Skeleton className="h-6 w-50 max-w-full" />
                </div>
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col gap-2">
                            <Skeleton className="h-7 w-50 max-w-full" /> {/* Plan name */}
                            <Skeleton className="h-10 w-70 max-w-full" /> {/* Price */}
                        </div>
                        <div className="flex flex-col gap-2">
                            <Skeleton className="h-8 w-40 max-w-full" /> {/* Update subscription button */}
                            <Skeleton className="h-8 w-40 max-w-full" /> {/* Cancel subscription button */}
                        </div>
                    </div>
                    <div className="flex flex-col gap-2 mt-4">
                        <Skeleton className="h-4 w-70 max-w-full" /> {/* Renewal date */}
                        <Skeleton className="h-7 w-150 mt-4 max-w-full" /> {/* Payment method */}
                    </div>
                </div>
            </div>

            {/* Billing Information Section */}
            <div className="flex flex-col gap-6">
                {/* "BILLING INFORMATION" header */}
                <div className="border-b border-b-muted border-solid mb-2 pb-4 w-full">
                    <Skeleton className="h-6 w-48" />
                </div>
                <div className="flex flex-col md:flex-row gap-20">
                    <div className="flex flex-col gap-4">
                        <Skeleton className="h-7 w-32" />
                        <Skeleton className="h-7 w-32" />
                    </div>

                    <div className="flex flex-col gap-4">
                        <Skeleton className="h-7 w-40" />
                        <Skeleton className="h-40 w-40" /> {/* Phone value */}
                    </div>
                </div>
                <Skeleton className="h-8 w-40" /> {/* Update information button */}
            </div>

            {/* Payments Section */}
            <div className="flex flex-col gap-6">
                {/* "PAYMENTS" header */}
                <div className="border-b border-b-muted border-solid mb-4 pb-4 w-full">
                    <Skeleton className="h-6 w-48" />
                </div>
                <div className="flex flex-col gap-2">
                    {/* Payment rows */}
                    {[...Array(9)].map((_, i) => (
                        <div key={i} className="flex items-center gap-4 py-1">
                            <Skeleton className="h-4 w-4" /> {/* Payment icon */}
                            <Skeleton className="h-4 w-24" /> {/* Date */}
                            <Skeleton className="h-4 w-16" /> {/* Amount */}
                            <Skeleton className="h-6 w-16" /> {/* Status badge */}
                            <Skeleton className="h-4 w-32" /> {/* Plan name */}
                            <Skeleton className="h-4 w-20" /> {/* Units */}
                            <Skeleton className="h-8 w-16 ml-auto" /> {/* Invoice button */}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
