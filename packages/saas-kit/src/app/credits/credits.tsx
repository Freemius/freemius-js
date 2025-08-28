'use client';

import { Subscribe } from '@freemius/saas-starter/components/subscribe';
import { Topup } from '@freemius/saas-starter/components/topup';
import { formatNumber } from '@freemius/saas-starter/utils/formatter';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

export default function Credits(props: { credits?: number; hasLicense?: boolean }) {
    const { credits, hasLicense } = props;
    const router = useRouter();
    const refresh = useCallback(() => router.refresh(), [router]);

    if (!hasLicense) {
        return (
            <Subscribe onCheckout={refresh}>
                <div className="text-center">
                    <h2 className="text-lg font-medium">Please subscribe below</h2>
                    <p className="mb-10 text-muted-foreground">
                        Every plan comes with an <strong>one-time</strong> credit for your utilization.
                    </p>
                </div>
            </Subscribe>
        );
    }

    return (
        <Topup onCheckout={refresh}>
            <div className="text-center">
                <h2 className="text-lg font-medium">You have {formatNumber(credits ?? 0)} credits</h2>
                <p className="mb-10 text-muted-foreground">You can purchase more credits below.</p>
            </div>
        </Topup>
    );
}
