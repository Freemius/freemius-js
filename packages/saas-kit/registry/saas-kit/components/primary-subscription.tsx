'use client';

import * as React from 'react';
import type { PortalData } from '@freemius/sdk';
import { SectionHeading } from './section-heading';
import { useLocale } from '../utils/locale';
import { CancelSubscription } from './cancel-subscription';
import { SubscriptionInfo } from './subscription-info';

export function PrimarySubscription(props: {
    subscription: NonNullable<PortalData['subscriptions']['primary']>;
    plans: PortalData['plans'];
    sellingUnit: PortalData['sellingUnit'];
    cancellationCoupons?: PortalData['cancellationCoupons'];
    afterCancel?: () => void;
    afterCouponApplied?: () => void;
}) {
    const { subscription, plans, sellingUnit, cancellationCoupons, afterCancel, afterCouponApplied } = props;
    const [isCancelling, setIsCancelling] = React.useState<boolean>(false);
    const locale = useLocale();

    return (
        <div className="fs-saas-starter-portal__primary-subscription">
            <SectionHeading>{locale.portal.primary.title()}</SectionHeading>
            {isCancelling ? (
                <CancelSubscription
                    subscription={subscription}
                    onClose={() => setIsCancelling(false)}
                    cancellationCoupons={cancellationCoupons}
                    afterCancel={afterCancel}
                    afterCouponApplied={afterCouponApplied}
                />
            ) : (
                <SubscriptionInfo
                    onCancel={() => setIsCancelling(true)}
                    subscription={subscription}
                    plans={plans}
                    sellingUnit={sellingUnit}
                />
            )}
        </div>
    );
}
