'use client';

import { Button } from '@/components/ui/button';
import { Paywall, usePaywall } from '@/react-starter/components/paywall';

export default function PaywallDemo() {
    const { state, showNoActivePurchase, showInsufficientCredits, hidePaywall } = usePaywall();

    return (
        <div>
            <Paywall state={state} hidePaywall={hidePaywall} />

            <div className="flex flex-wrap gap-4">
                <Button onClick={showNoActivePurchase}>Trigger No Active Purchase</Button>

                <Button onClick={showInsufficientCredits} variant="outline">
                    Trigger Insufficient Credits
                </Button>
            </div>
        </div>
    );
}
