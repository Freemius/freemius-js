'use client';

import * as React from 'react';
import { useLocale } from '../utils/locale';
import { usePricingData } from '../hooks/data';
import { PricingSkeleton } from './pricing-skeleton';
import { TopupTable } from './topup-table';
import { CURRENCY } from '@freemius/sdk';

export type TopupProps = {
    onCheckout?: () => void;
    currency?: CURRENCY;
    children?: React.ReactNode;
    topupPlanId?: number | string | null;
};

export function Topup(props: TopupProps) {
    const locale = useLocale();
    const { onCheckout, currency, children, topupPlanId } = props;
    const { data, error, isLoading } = usePricingData(topupPlanId, true);

    return (
        <div className="mb-4 max-w-4xl mx-auto">
            {children}
            {isLoading || !data ? (
                <PricingSkeleton type="topup" />
            ) : error ? (
                <div className="text-center text-destructive">
                    {locale.pricing.error.fetchingData()}: {error.message}
                </div>
            ) : !data.topupPlan ? (
                <div className="text-center text-muted-foreground">{locale.pricing.error.noTopupPlan()}</div>
            ) : (
                <TopupTable
                    plan={data?.topupPlan}
                    onCheckout={onCheckout}
                    sellingUnit={data.sellingUnit}
                    currency={currency}
                />
            )}
        </div>
    );
}
