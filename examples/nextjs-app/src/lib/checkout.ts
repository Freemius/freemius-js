'use client';

import { Checkout } from '@freemius/checkout';
import { useEffect, useState } from 'react';

export function useFSCheckout() {
    // create a Checkout instance once
    const [fsCheckout] = useState<Checkout>(
        () => new Checkout({ product_id: process.env.NEXT_PUBLIC_FS__PRODUCT_ID! })
    );

    useEffect(() => {
        // close and destroy the DOM related stuff on unmount
        return () => {
            fsCheckout.destroy();
        };
    }, [fsCheckout]);

    return fsCheckout;
}
