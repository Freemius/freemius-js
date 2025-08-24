import * as React from 'react';
import { PaymentMethod } from '@freemius/sdk';
import PayPalIcon from '../icons/paypal';
import CardIcon from '../icons/card';

export default function PaymentIcon(props: { method: PaymentMethod }) {
    return (
        <span className="inline-flex items-center bg-muted text-muted-foreground rounded-sm h-8 w-8 justify-center mr-2">
            {props.method === 'paypal' ? <PayPalIcon /> : <CardIcon />}
        </span>
    );
}
