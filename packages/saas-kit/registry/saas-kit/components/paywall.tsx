'use client';

import * as React from 'react';
import { PricingTable } from './pricing-table';
import { Button } from '@/components/ui/button';
import { useLocale } from '../utils/locale';
import { TopupTable } from './topup-table';
import { usePricingData } from '../hooks/data';
import { PricingSkeleton } from './pricing-skeleton';

export enum PaywallRestriction {
    NO_ACTIVE_PURCHASE = 'no_active_purchase',
    INSUFFICIENT_CREDITS = 'insufficient_credits',
}

export type PaywallState = PaywallRestriction | null;

export function usePaywall(initialState: PaywallState = null) {
    const [state, setState] = React.useState<PaywallState>(initialState);

    const showNoActivePurchase = () => setState(PaywallRestriction.NO_ACTIVE_PURCHASE);
    const showInsufficientCredits = () => setState(PaywallRestriction.INSUFFICIENT_CREDITS);
    const hidePaywall = () => setState(null);

    return {
        state,
        showNoActivePurchase,
        showInsufficientCredits,
        hidePaywall,
    };
}

export type PaywallProps = {
    state: PaywallState;
    hidePaywall: () => void;
    topupPlanId?: number | string;
    portalNavigation?: React.ReactNode;
};

export function Paywall(props: PaywallProps) {
    const { state, hidePaywall, topupPlanId, portalNavigation } = props;
    const { data, error, isLoading, refetch } = usePricingData(topupPlanId);

    const locale = useLocale();

    if (null === state) {
        return null;
    }

    if (!data && !isLoading && !error) {
        // Initial state, trigger data fetch
        refetch();
    }

    return (
        <div className="fixed inset-0 z-5000 flex items-center justify-center bg-accent/70 backdrop-blur-md">
            <div className="h-screen overflow-y-auto w-full">
                <div className="flex flex-col flex-nowrap items-center justify-center min-h-screen p-6">
                    <div className="max-w-4xl w-full">
                        <h1 className="text-2xl font-bold mb-4 text-center">
                            {state === PaywallRestriction.NO_ACTIVE_PURCHASE
                                ? locale.paywall.noActivePurchase.title()
                                : locale.paywall.insufficientCredits.title()}
                        </h1>
                        <p className="text-center max-w-[65ch] mx-auto mb-10">
                            {state === PaywallRestriction.NO_ACTIVE_PURCHASE
                                ? locale.paywall.noActivePurchase.message()
                                : locale.paywall.insufficientCredits.message()}
                        </p>

                        {error ? (
                            <div className="text-center text-destructive">
                                {locale.pricing.error.fetchingData()}: {error.message}
                            </div>
                        ) : isLoading || !data ? (
                            <PricingSkeleton
                                type={state === PaywallRestriction.NO_ACTIVE_PURCHASE ? 'subscription' : 'topup'}
                            />
                        ) : state === PaywallRestriction.NO_ACTIVE_PURCHASE ? (
                            <PricingTable plans={data.plans} onCheckout={hidePaywall} />
                        ) : (
                            <TopupTable plan={data.topupPlan} sellingUnit={data.sellingUnit} onCheckout={hidePaywall} />
                        )}

                        <div className="text-center mt-6">
                            <Button
                                variant="ghost"
                                className="underline"
                                onClick={() => {
                                    hidePaywall();
                                }}
                            >
                                {locale.pricing.action.cancel()}
                            </Button>
                            {portalNavigation ? (
                                <p className="mt-2 text-sm text-muted-foreground">
                                    {locale.paywall.portalNavigation(portalNavigation)}
                                </p>
                            ) : null}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
