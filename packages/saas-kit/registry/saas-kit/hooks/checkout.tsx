import { Checkout, CheckoutOptions, CheckoutPopupEvents } from '@freemius/checkout';
import { useContext, createContext, ReactNode } from 'react';

export type PurchaseData = Parameters<NonNullable<CheckoutPopupEvents['success']>>[0];

export type PurchaseSyncSuccess = (purchaseData: PurchaseData) => Promise<void>;

export type CheckoutProviderProps = {
    children: ReactNode;
    options: CheckoutOptions;
    // Optional properties to use the built in purchase sync functionality
    processingMessage?: ReactNode;
    onSuccess?: PurchaseSyncSuccess;
    onError?: (error: unknown) => void;
};

export const CheckoutContext = createContext<Checkout | null>(null);

/**
 * Custom hook to access the Freemius Checkout instance from context.
 * Must be used within a CheckoutProvider to ensure the context is available.
 * @throws Error if used outside of CheckoutProvider.
 */
export function useCheckout(): Checkout {
    const context = useContext(CheckoutContext);
    if (!context) {
        throw new Error('useFSCheckout must be used within a CheckoutProvider');
    }

    return context;
}
