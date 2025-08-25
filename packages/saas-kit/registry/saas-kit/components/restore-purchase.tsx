'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { PurchaseData } from '@freemius/sdk';
import { useRestorePurchase } from '../hooks/data';
import Spinner from '../icons/spinner';
import RefreshIcon from '../icons/refresh';
import { useLocale } from '../utils/locale';

export type RestorePurchaseProps = {
    portalEndpoint: string;
    onRestored?: (data: PurchaseData[] | null) => void;
    onError?: (error: unknown) => void;
};

export function RestorePurchase(props: RestorePurchaseProps) {
    const { portalEndpoint, onRestored, onError } = props;
    const { isLoading, refetch } = useRestorePurchase(portalEndpoint);
    const locale = useLocale();

    const handleRestore = async () => {
        try {
            await refetch(onRestored);
        } catch (error) {
            onError?.(error);
        }
    };

    return (
        <Button onClick={handleRestore} disabled={isLoading} variant="outline">
            {isLoading ? (
                <>
                    <Spinner className="w-4 h-4 mr-2" />
                    {locale.refreshPurchase.action.restoring()}
                </>
            ) : (
                <>
                    <RefreshIcon className="w-4 h-4 mr-2" />
                    {locale.refreshPurchase.action.restore()}
                </>
            )}
        </Button>
    );
}
