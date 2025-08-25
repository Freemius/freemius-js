'use client';

import { useState } from 'react';
import type { CheckoutOptions } from '@freemius/checkout';
import { Paywall, usePaywall } from '@freemius/saas-starter/components/paywall';
import LoginModal from '@/components/login-modal';
import PurchaseProvider from '@/components/purchase-provider';
import { ChatContent } from '@/components/ai-chat';
import Link from 'next/link';

export default function AiApp(props: { examples: string[]; checkoutOptions: CheckoutOptions }) {
    const { checkoutOptions, examples } = props;
    const [isShowingLogin, setIsShowingLogin] = useState<boolean>(false);
    const { hidePaywall, showInsufficientCredits, showNoActivePurchase, state } = usePaywall();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleApiError = (data: any) => {
        if (data.code === 'unauthenticated') {
            setIsShowingLogin(true);
        } else if (data.code === 'no_active_purchase') {
            showNoActivePurchase();
        } else if (data.code === 'insufficient_credits') {
            showInsufficientCredits();
        }
    };

    return (
        <PurchaseProvider checkoutOptions={checkoutOptions}>
            <Paywall
                state={state}
                hidePaywall={hidePaywall}
                portalNavigation={
                    <Link href="/billing" className="whitespace-nowrap">
                        Go to billing →
                    </Link>
                }
            />

            <LoginModal isShowing={isShowingLogin} onClose={() => setIsShowingLogin(false)} />

            <ChatContent examples={examples} onApiError={handleApiError} />
        </PurchaseProvider>
    );
}
