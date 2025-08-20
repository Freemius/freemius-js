'use client';

import { useState } from 'react';
import type { CheckoutOptions } from '@freemius/checkout';
import Paywall, { PaywallState, PaywallRestriction } from '@/components/paywall';
import LoginModal from '@/components/login-modal';
import PurchaseProvider from '@/components/purchase-provider';
import { ChatContent } from '@/components/ai-chat';

export default function DummyAiGenerator(props: { checkoutOptions: CheckoutOptions; examples: string[] }) {
    const { checkoutOptions, examples } = props;
    const [errorState, setErrorState] = useState<PaywallState>(null);
    const [isShowingLogin, setIsShowingLogin] = useState<boolean>(false);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleApiError = (data: any) => {
        if (data.code === 'unauthenticated') {
            setIsShowingLogin(true);
        } else if (data.code === 'no_active_purchase') {
            setErrorState(PaywallRestriction.NO_ACTIVE_PURCHASE);
        } else if (data.code === 'insufficient_credits') {
            setErrorState(PaywallRestriction.INSUFFICIENT_CREDITS);
        }
    };

    return (
        <PurchaseProvider checkoutOptions={checkoutOptions}>
            <Paywall state={errorState} updateState={setErrorState} />

            <LoginModal isShowing={isShowingLogin} onClose={() => setIsShowingLogin(false)} />

            <ChatContent examples={examples} onApiError={handleApiError} />
        </PurchaseProvider>
    );
}
