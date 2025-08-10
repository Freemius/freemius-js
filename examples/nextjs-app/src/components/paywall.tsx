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
import { useCheckout } from '@freemius/saas-starter/hooks/checkout';

export enum PaywallRestriction {
    NO_ACTIVE_PURCHASE = 'no_active_purchase',
    INSUFFICIENT_CREDITS = 'insufficient_credits',
}

export type PaywallState = PaywallRestriction | null;

export default function Paywall(props: { state: PaywallState; updateState: (state: PaywallState) => void }) {
    const { state, updateState } = props;
    const checkout = useCheckout();

    const openCheckout = () => {
        checkout.open({
            plan_id:
                state === PaywallRestriction.NO_ACTIVE_PURCHASE
                    ? process.env.NEXT_PUBLIC_FS__PLAN_SUBSCRIPTION
                    : process.env.NEXT_PUBLIC_FS__PLAN_TOPUP,
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
                            {state === PaywallRestriction.NO_ACTIVE_PURCHASE
                                ? 'You need to upgrade'
                                : 'Insufficient Credits'}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {state === PaywallRestriction.NO_ACTIVE_PURCHASE
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
        </>
    );
}
