'use client';

import { useEffect, useState, useCallback } from 'react';
import { useCheckoutEndpoint } from './checkout';
import type { PortalData, PricingData, PurchaseData } from '@freemius/sdk';
import { getSanitizedUrl } from '../utils/fetch';

/**
 * Low-level hook that abstracts away the state management for data fetching
 */
export function useFetchData<T>(fetchFunction: () => Promise<T>, options: { autoFetch?: boolean } = {}) {
    const { autoFetch = true } = options;
    const [data, setData] = useState<T | undefined>(undefined);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);

    const execute = useCallback(
        async (callback?: (response: T) => void) => {
            setIsLoading(true);
            setError(null);

            try {
                const result = await fetchFunction();
                setData(result);
                callback?.(result);
            } catch (err) {
                setError(err as Error);
            } finally {
                setIsLoading(false);
            }
        },
        [fetchFunction]
    );

    useEffect(() => {
        if (autoFetch) {
            execute();
        }
    }, [execute, autoFetch]);

    return { data, isLoading, error, refetch: execute } as const;
}

export function usePricingData(topupPlanId?: number | string | null, autoFetch = false) {
    const endpoint = useCheckoutEndpoint();

    const fetchPricing = useCallback(async (): Promise<PricingData> => {
        const url = getSanitizedUrl(endpoint);
        if (!url) {
            throw new Error('Checkout endpoint is not of right format');
        }

        url.searchParams.set('action', 'pricing_data');

        if (topupPlanId) {
            url.searchParams.set('topupPlanId', String(topupPlanId));
        }

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Error fetching pricing data: ${response.statusText}`);
        }

        return await response.json();
    }, [endpoint, topupPlanId]);

    return useFetchData(fetchPricing, { autoFetch });
}

export function usePortalData(endpoint: string, autoFetch = true) {
    const fetchPortalData = useCallback(async (): Promise<PortalData | null> => {
        const url = getSanitizedUrl(endpoint);
        if (!url) {
            throw new Error('Portal endpoint is not of right format');
        }

        url.searchParams.set('action', 'portal_data');

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Error fetching portal data: ${response.statusText}`);
        }

        return await response.json();
    }, [endpoint]);

    return useFetchData(fetchPortalData, { autoFetch });
}

export function useRestorePurchase(endpoint: string) {
    const fetchRestorePurchase = useCallback(async (): Promise<null | PurchaseData[]> => {
        const url = getSanitizedUrl(endpoint);
        if (!url) {
            throw new Error('Restore purchase endpoint is not of right format');
        }

        url.searchParams.set('action', 'restore_purchase');

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Error restoring purchase: ${response.statusText}`);
        }

        return await response.json();
    }, [endpoint]);

    return useFetchData(fetchRestorePurchase, { autoFetch: false });
}

export function usePortalAction<Payload extends Record<string, unknown>, Result = void>(authenticatedUrl: string) {
    const [loading, setLoading] = useState<boolean>(false);

    const execute = useCallback(
        async (body?: Payload): Promise<Result> => {
            setLoading(true);

            try {
                const url = getSanitizedUrl(authenticatedUrl);
                if (!url) {
                    throw new Error('Authenticated endpoint is not of right format');
                }

                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(body),
                });

                if (!response.ok) {
                    throw new Error(`Error performing action: ${response.statusText}`);
                }

                return await response.json();
            } finally {
                setLoading(false);
            }
        },
        [authenticatedUrl]
    );

    return { execute, loading } as const;
}
