import type { CheckoutOptions } from '@freemius/checkout';
import { PurchaseData } from '@freemius/saas-starter/hooks/checkout';
import { ReactNode, useCallback, useState } from 'react';
import { toast } from 'sonner';
import ConfettiExplosion from 'react-confetti-explosion';
import { IconCircleCheck, IconAlertCircle } from '@tabler/icons-react';
import CheckoutProvider from '@freemius/saas-starter/components/checkout-provider';

export function useConfirmPurchase() {
    const [isExploding, setIsExploding] = useState<boolean>(false);

    const confirmPurchase = useCallback(
        async (data: PurchaseData) => {
            const licenseId = data?.purchase?.license_id;

            try {
                const response = await fetch('/api/confirm-purchase', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ fsLicenseId: licenseId }),
                });

                if (!response.ok) {
                    throw new Error('Failed to sync purchase');
                } else {
                    const purchaseData = await response.json();
                    const credits = purchaseData.credits ?? 0;

                    console.log(purchaseData, data);
                    toast.success(`Purchase successful with ${credits} credits!`, {
                        icon: <IconCircleCheck className="w-6 h-6 text-grow" />,
                        description: 'You can now use the feature you just purchased.',
                    });
                    setIsExploding(true);
                }
            } catch (error) {
                console.error('Error syncing purchase:', error);
                toast.error(`Could not finalize your purchase!`, {
                    description: `Please contact support. Any money spent will be refunded.`,
                    icon: <IconAlertCircle className="w-6 h-6 text-destructive" />,
                });
            }
        },
        [setIsExploding]
    );

    return { isExploding, setIsExploding, confirmPurchase };
}

export default function PurchaseProvider(props: { checkoutOptions: CheckoutOptions; children: ReactNode }) {
    const { checkoutOptions, children } = props;
    const { isExploding, setIsExploding, confirmPurchase } = useConfirmPurchase();

    return (
        <CheckoutProvider options={checkoutOptions} onSuccess={confirmPurchase}>
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
