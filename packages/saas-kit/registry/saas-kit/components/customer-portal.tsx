'use client';

import * as React from 'react';
import { PortalData } from '@freemius/sdk';
import PrimarySubscription from './primary-subscription';
import CheckoutProvider from './checkout-provider';
import { BillingSection } from './billing-section';
import { PaymentsSection } from './payments-section';
import { CheckoutContext, PurchaseSyncSuccess } from '../hooks/checkout';
import { useContext } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function CustomerPortal(props: { portalData: PortalData; afterPurchase?: PurchaseSyncSuccess }) {
    const { portalData: portalData, afterPurchase } = props;
    const hasCheckout = Boolean(useContext(CheckoutContext));

    const children = (
        <div className="fs-saas-starter-portal flex flex-col gap-16">
            {portalData.subscriptions.primary ? (
                <PrimarySubscription
                    subscription={portalData.subscriptions.primary}
                    plans={portalData.plans}
                    sellingUnit={portalData.sellingUnit}
                />
            ) : null}

            {portalData.billing ? <BillingSection billing={portalData.billing} user={portalData.user} /> : null}

            {portalData.payments && portalData.payments.length > 0 ? (
                <PaymentsSection payments={portalData.payments} unit={portalData.sellingUnit} />
            ) : null}
            {/* <pre>{JSON.stringify(portalData, null, 2)}</pre> */}
        </div>
    );

    return hasCheckout ? (
        children
    ) : (
        <CheckoutProvider options={portalData.checkoutOptions} onSuccess={afterPurchase}>
            {children}
        </CheckoutProvider>
    );
}

export function CustomerPortalSkeleton() {
    return (
        <div className="fs-saas-starter-portal flex flex-col gap-16">
            {/* Current Subscription Section */}
            <div className="flex flex-col gap-6">
                {/* "CURRENT SUBSCRIPTION" header */}
                <div className="border-b border-b-muted border-solid mb-4 pb-4 w-full">
                    <Skeleton className="h-6 w-48" />
                </div>
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col gap-2">
                            <Skeleton className="h-7 w-40" /> {/* Plan name */}
                            <Skeleton className="h-8 w-48" /> {/* Price */}
                            <Skeleton className="h-4 w-64" /> {/* Renewal date */}
                        </div>
                        <div className="flex flex-col gap-2">
                            <Skeleton className="h-8 w-40" /> {/* Update subscription button */}
                            <Skeleton className="h-8 w-40" /> {/* Cancel subscription button */}
                        </div>
                    </div>
                </div>
            </div>

            {/* Billing Information Section */}
            <div className="flex flex-col gap-6">
                {/* "BILLING INFORMATION" header */}
                <div className="border-b border-b-muted border-solid mb-4 pb-4 w-full">
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
