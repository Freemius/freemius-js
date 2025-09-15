'use client';

import { useState } from 'react';
import { Paywall, usePaywall } from '@/react-starter/components/paywall';
import LoginModal from '@/components/login-modal';
import { AIChat } from '@/components/ai-chat';
import Link from 'next/link';

export default function AiApp(props: { examples: string[] }) {
    const { examples } = props;
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
        <>
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

            <AIChat examples={examples} onApiError={handleApiError} />
        </>
    );
}
