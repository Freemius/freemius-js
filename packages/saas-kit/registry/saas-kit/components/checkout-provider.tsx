import { Checkout, CheckoutOptions } from '@freemius/checkout';
import { useEffect, useState, useRef, useCallback } from 'react';
import { CheckoutContext, PurchaseData, CheckoutProviderProps, PurchaseSyncSuccess } from '../hooks/checkout';
import Processing from './processing';
import { useLocale } from '../utils/locale';

function useCreateCheckout(options: CheckoutOptions, success?: PurchaseSyncSuccess) {
    const [fsCheckout, setFSCheckout] = useState<Checkout>(() => new Checkout(options));
    const prevCheckoutRef = useRef<Checkout | null>(fsCheckout);

    useEffect(() => {
        // Create a new Checkout instance when productId changes
        const checkout = new Checkout({ ...options, success: options.success ?? success });
        setFSCheckout(checkout);

        // Cleanup previous instance
        return () => {
            if (prevCheckoutRef.current) {
                prevCheckoutRef.current.destroy();
            }

            prevCheckoutRef.current = checkout;
        };
    }, [options, success]);

    return fsCheckout;
}

export default function CheckoutProvider({
    children,
    options,
    onSuccess,
    processingMessage: message,
    onError,
}: CheckoutProviderProps) {
    const [isSyncing, setIsSyncing] = useState<boolean>(false);

    const syncPurchase = useCallback(
        async (purchaseData: PurchaseData) => {
            setIsSyncing(true);

            try {
                await onSuccess?.(purchaseData);
            } catch (e) {
                onError?.(e);
            } finally {
                setIsSyncing(false);
            }
        },
        [onSuccess, onError, setIsSyncing]
    );

    const fsCheckout = useCreateCheckout(options, onSuccess ? syncPurchase : undefined);

    const locale = useLocale();

    return (
        <CheckoutContext.Provider value={fsCheckout}>
            {isSyncing && onSuccess ? <Processing>{message ?? locale.checkout.processing()}</Processing> : null}
            {children}
        </CheckoutContext.Provider>
    );
}
