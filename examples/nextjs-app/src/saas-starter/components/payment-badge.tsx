import { PortalPayment } from '@freemius/sdk';
import { Badge } from '@/components/ui/badge';
import { ComponentProps, useMemo } from 'react';
import { useLocale } from '../locale';

export function PaymentBadge(props: { type: PortalPayment['type'] }) {
    const { type } = props;
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
        <Badge variant={variant} className="fs-saas-starter-payment-badge">
            {locale.paymentBadge(type)}
        </Badge>
    );
}
