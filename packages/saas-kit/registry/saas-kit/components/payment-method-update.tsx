import * as React from 'react';
import { PortalSubscription } from '@freemius/sdk';
import { useCheckout } from '../hooks/checkout';
import { Button } from '@/components/ui/button';
import { useLocale } from '../utils/locale';
import PaymentIcon from './payment-icon';

export function PaymentMethodUpdate(props: { subscription: PortalSubscription }) {
    const { subscription } = props;
    const checkout = useCheckout();
    const locale = useLocale();

    return (
        <p className="flex flex-wrap justify-between items-center gap-4">
            <span className="grow-0 shrink-0 flex items-center text-muted-foreground text-sm ">
                <PaymentIcon method={subscription.paymentMethod!} />
                {/* @todo - When backend sends card info show it here */}
                <span className="font-semibold uppercase text-xs">
                    {locale.portal.payment.info(subscription.paymentMethod!)}
                </span>
            </span>
            <Button
                variant="outline"
                onClick={() =>
                    checkout.open({
                        is_payment_method_update: true,
                        plan_id: subscription.planId,
                        pricing_id: subscription.pricingId,
                        license_id: subscription.licenseId,
                        authorization: subscription.checkoutUpgradeAuthorization,
                    })
                }
            >
                {locale.portal.payment.update()}
            </Button>
        </p>
    );
}
