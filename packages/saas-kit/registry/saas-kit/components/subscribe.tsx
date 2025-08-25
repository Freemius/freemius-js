'use client';

import * as React from 'react';
import { useLocale } from '../utils/locale';
import { usePricingData } from '../hooks/data';
import { PricingSkeleton } from './pricing-skeleton';
import { PricingTable } from './pricing-table';

export type SubscribeProps = {
    onCheckout?: () => void;
    children?: React.ReactNode;
};

export function Subscribe(props: SubscribeProps) {
    const locale = useLocale();
    const { data, error, isLoading } = usePricingData(null, true);
    const { onCheckout, children } = props;

    return (
        <div className="mb-4 max-w-4xl mx-auto">
            {children}
            {isLoading || !data ? (
                <PricingSkeleton />
            ) : error ? (
                <div className="text-center text-destructive">
                    {locale.pricing.error.fetchingData()}: {error.message}
                </div>
            ) : (
                <PricingTable plans={data?.plans ?? []} onCheckout={onCheckout} />
            )}
        </div>
    );
}
