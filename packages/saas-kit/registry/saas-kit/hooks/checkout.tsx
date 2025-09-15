import { Checkout, CheckoutPopupEvents } from '@freemius/checkout';
import { useContext, createContext } from 'react';
import type { PurchaseData, CheckoutSerialized } from '@freemius/sdk';

export type CheckoutPurchaseData = Parameters<NonNullable<CheckoutPopupEvents['success']>>[0];
export type PurchaseSyncSuccess = (purchaseData: CheckoutPurchaseData) => Promise<PurchaseData | undefined>;

export const CheckoutContext = createContext<{
    checkout: Checkout;
    endpoint: string;
    success: PurchaseSyncSuccess;
    serializedData: CheckoutSerialized;
} | null>(null);

/**
 * Custom hook to access the Freemius Checkout instance from context.
 * Must be used within a CheckoutProvider to ensure the context is available.
 * @throws Error if used outside of CheckoutProvider.
 */
export function useCheckout(): Checkout {
    const context = useContext(CheckoutContext);

    if (!context) {
        throw new Error('useCheckout must be used within a CheckoutProvider');
    }

    return context.checkout;
}

export function useCheckoutEndpoint(): string | null {
    const context = useContext(CheckoutContext);

    if (!context) {
        throw new Error('useCheckoutEndpoint must be used within a CheckoutProvider');
    }

    return context.endpoint;
}

export function useCheckoutLink(): string {
    const context = useContext(CheckoutContext);

    if (!context) {
        throw new Error('useCheckoutLink must be used within a CheckoutProvider');
    }

    return context.serializedData.link;
}
