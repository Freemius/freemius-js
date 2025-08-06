'use client';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useFSCheckout } from '@/lib/checkout';
import type { CheckoutOptions } from '@freemius/checkout';
import { useState } from 'react';
import ConfettiExplosion from 'react-confetti-explosion';
import { toast } from 'sonner';
import { IconLoader2, IconCircleCheck, IconAlertCircle } from '@tabler/icons-react';

export enum PaywallRestriction {
    NO_ACTIVE_LICENSE = 'no_active_license',
    INSUFFICIENT_CREDITS = 'insufficient_credits',
}

export type PaywallState = PaywallRestriction | null;

export default function Paywall(props: {
    state: PaywallState;
    updateState: (state: PaywallState) => void;
    checkoutOptions: Partial<CheckoutOptions>;
}) {
    const { state, updateState } = props;
    const checkout = useFSCheckout();
    const [isExploding, setIsExploding] = useState<boolean>(false);
    const [isSyncing, setIsSyncing] = useState<boolean>(false);

    const syncPurchase = async (licenseId: string) => {
        setIsSyncing(true);

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
                const data = await response.json();
                const credits = data.credits ?? 0;

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
        } finally {
            setIsSyncing(false);
        }
    };

    const openCheckout = () => {
        checkout.open({
            ...props.checkoutOptions,
            plan_id:
                state === 'no_active_license'
                    ? process.env.NEXT_PUBLIC_FS__PLAN_SUBSCRIPTION
                    : process.env.NEXT_PUBLIC_FS__PLAN_TOPUP,
            success: (data) => {
                updateState(null);

                if (data?.purchase?.license_id) {
                    syncPurchase(data.purchase?.license_id);
                } else {
                    toast.error('Something went wrong while processing your purchase. Please contact support.');
                }
            },
        });
    };

    return (
        <>
            <AlertDialog
                open={null !== state}
                onOpenChange={(open) => {
                    if (!open) {
                        updateState(null);
                    }
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {state === 'no_active_license' ? 'You need to upgrade' : 'Insufficient Credits'}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {state === 'no_active_license'
                                ? 'You need to have an active subscription to use this feature. Click the button below to upgrade your account.'
                                : 'You do not have enough credits to perform this action. Please purchase more credits by clicking the button below.'}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={openCheckout}>Purchase</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            {isSyncing ? (
                <div className="fixed inset-0 z-5000 flex items-center justify-center bg-foreground/50 backdrop-blur-md">
                    <div className="flex flex-col gap-4 w-sm max-w-[80vw] p-8 bg-card rounded-md shadow-lg items-center justify-center">
                        <IconLoader2 className="w-16 h-16 animate-spin text-primary" />
                        <p className="text-lg font-semibold text-muted-foreground">Finalizing your purchase...</p>
                    </div>
                </div>
            ) : null}
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
        </>
    );
}
