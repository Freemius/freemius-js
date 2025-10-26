'use client';

import * as React from 'react';
import { Checkout, CheckoutOptions } from '@freemius/checkout';
import { useEffect, useState, useRef, useCallback, useContext } from 'react';
import { CheckoutContext, CheckoutPurchaseData, PurchaseSyncSuccess } from '../hooks/checkout';
import Processing from './processing';
import { useLocale } from '../utils/locale';
import { getSanitizedUrl } from '../utils/fetch';
import type { PurchaseData, CheckoutSerialized } from '@freemius/sdk';

function useCreateCheckout(
    options: CheckoutOptions,
    success?: (purchaseData: CheckoutPurchaseData) => void,
    baseUrl?: string
) {
    const [fsCheckout, setFSCheckout] = useState<Checkout>(() => new Checkout(options));
    const prevCheckoutRef = useRef<Checkout | null>(fsCheckout);

    useEffect(() => {
        // Create a new Checkout instance when productId changes
        const checkout = new Checkout({ ...options, success: options.success ?? success }, true, baseUrl);
        setFSCheckout(checkout);

        // Cleanup previous instance
        return () => {
            if (prevCheckoutRef.current) {
                prevCheckoutRef.current.destroy();
            }

            prevCheckoutRef.current = checkout;
        };
    }, [options, success, baseUrl]);

    return fsCheckout;
}

export type CheckoutProviderProps = {
    children: React.ReactNode;
    checkout: CheckoutSerialized;
    endpoint: string;
    // Optional properties to use the built in purchase sync functionality
    processingMessage?: React.ReactNode;
    onSync?: PurchaseSyncSuccess;
    onBeforeSync?: (purchaseData: CheckoutPurchaseData) => void;
    onAfterSync?: (serverData: PurchaseData) => void;
    onError?: (error: unknown) => void;
};

export function CheckoutProvider({
    children,
    checkout,
    onSync,
    processingMessage: message,
    onError,
    endpoint,
    onAfterSync,
    onBeforeSync,
}: CheckoutProviderProps) {
    const [isSyncing, setIsSyncing] = useState<boolean>(false);
    const nestedContext = useContext(CheckoutContext);

    const syncPurchase = useCallback(
        async (purchaseData: CheckoutPurchaseData) => {
            const defaultSync: PurchaseSyncSuccess = async (purchaseData: CheckoutPurchaseData) => {
                const url = getSanitizedUrl(endpoint);
                if (!url || (!purchaseData?.purchase?.license_id && !purchaseData?.trial?.license_id)) {
                    return;
                }

                url.searchParams.set('action', 'process_purchase');

                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(purchaseData),
                });

                if (!response.ok) {
                    throw new Error('Failed to sync purchase');
                }

                return await response.json();
            };

            setIsSyncing(true);
            onBeforeSync?.(purchaseData);

            try {
                const result = await (nestedContext?.success ?? onSync ?? defaultSync)(purchaseData);
                onAfterSync?.(result as PurchaseData);
                return result;
            } catch (e) {
                onError?.(e);
            } finally {
                setIsSyncing(false);
            }
        },
        [onSync, onError, setIsSyncing, endpoint, onBeforeSync, onAfterSync, nestedContext?.success]
    );

    const fsCheckout = useCreateCheckout(checkout.options, syncPurchase, checkout.baseUrl);

    const locale = useLocale();

    const checkoutContext = React.useMemo(
        () => ({
            checkout: fsCheckout,
            endpoint: endpoint,
            success: syncPurchase,
            serializedData: checkout,
        }),
        [fsCheckout, endpoint, syncPurchase, checkout]
    );

    return (
        <CheckoutContext.Provider value={checkoutContext}>
            {isSyncing ? <Processing>{message ?? locale.checkout.processing()}</Processing> : null}
            {children}
        </CheckoutContext.Provider>
    );
}
