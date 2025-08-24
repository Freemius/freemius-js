import * as React from 'react';
import { PortalPayment } from '@freemius/sdk';
import { Badge } from '@/components/ui/badge';
import { ComponentProps, useMemo } from 'react';
import { useLocale } from '../utils/locale';
import SubscriptionInitialIcon from '../icons/subscription-initial';
import SubscriptionRenewalIcon from '../icons/subscription-renewal';
import OneOffPurchaseIcon from '../icons/oneoff-purchase';
import RefundIcon from '../icons/refund';

export function PaymentBadge(props: { type: PortalPayment['type']; occurance: 'first' | 'renewal' | 'oneoff' }) {
    const { type, occurance } = props;
    const locale = useLocale();

    const variant = useMemo<ComponentProps<typeof Badge>['variant']>(() => {
        switch (type) {
            case 'chargeback':
            case 'lost_dispute':
            case 'won_dispute':
            case 'disputed':
                return 'destructive';
                break;
            case 'refund':
                return 'outline';
            default: // case 'payment':
                return 'secondary';
        }
    }, [type]);

    return (
        <Badge
            variant={variant}
            className="fs-saas-starter-payment-badge"
            title={'payment' === type ? locale.portal.payments.type[occurance]() : undefined}
        >
            {(function () {
                if (type === 'refund') {
                    return <RefundIcon />;
                }

                if (type !== 'payment') {
                    return null;
                }

                return occurance === 'first' ? (
                    <SubscriptionInitialIcon />
                ) : occurance === 'renewal' ? (
                    <SubscriptionRenewalIcon />
                ) : (
                    <OneOffPurchaseIcon />
                );
            })()}
            {locale.paymentBadge(type)}
        </Badge>
    );
}
