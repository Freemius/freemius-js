'use client';

import * as React from 'react';
import type { CheckoutOptions } from '@freemius/checkout';
import { toast } from 'sonner';
import ConfettiExplosion from 'react-confetti-explosion';
import { IconCircleCheck, IconAlertCircle } from '@tabler/icons-react';
import { CheckoutProvider } from '@freemius/saas-starter/components/checkout-provider';
import type { PurchaseData } from '@freemius/sdk';
import { useRouter } from 'next/navigation';

export function useConfirmPurchase() {
    const [isExploding, setIsExploding] = React.useState<boolean>(false);
    const router = useRouter();

    const handlePurchase = React.useCallback(
        async (data: PurchaseData) => {
            const credits = data.quota ?? 0;

            console.log('purchaseData', data);
            toast.success(`Purchase successful with ${credits} credits!`, {
                icon: <IconCircleCheck className="w-6 h-6 text-grow" />,
                description: 'You can now use the feature you just purchased.',
            });
            setIsExploding(true);
            router.refresh();
        },
        [setIsExploding, router]
    );

    const handleError = React.useCallback((error: unknown) => {
        console.error('Error syncing purchase:', error);
        toast.error(`Could not finalize your purchase!`, {
            description: `Please contact support. Any money spent will be refunded.`,
            icon: <IconAlertCircle className="w-6 h-6 text-destructive" />,
        });
    }, []);

    return { isExploding, setIsExploding, handlePurchase, handleError };
}

export default function PurchaseProvider(props: { checkoutOptions: CheckoutOptions; children: React.ReactNode }) {
    const { checkoutOptions, children } = props;
    const { isExploding, setIsExploding, handleError, handlePurchase } = useConfirmPurchase();

    return (
        <CheckoutProvider
            endpoint={process.env.NEXT_PUBLIC_APP_URL! + '/api/checkout'}
            options={checkoutOptions}
            onError={handleError}
            onAfterSync={handlePurchase}
        >
            {children}
            {isExploding ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
                    <ConfettiExplosion
                        force={0.8}
                        duration={3000}
                        particleCount={250}
                        width={1600}
                        onComplete={() => setIsExploding(false)}
                        zIndex={1000}
                    />
                </div>
            ) : null}
        </CheckoutProvider>
    );
}
