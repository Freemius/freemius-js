'use client';

import * as React from 'react';
import { PortalData } from '@freemius/sdk';
import { useLocale } from '../utils/locale';
import { BillingItem } from './billing-item';
import { Button } from '@/components/ui/button';

export function BillingInfo(props: {
    billing: NonNullable<PortalData['billing']>;
    user: NonNullable<PortalData['user']>;
    setIsUpdating: (isUpdating: boolean) => void;
}) {
    const { billing, user, setIsUpdating } = props;
    const locale = useLocale();

    const address: string[] = [];

    if (billing.address_street) {
        address.push(billing.address_street);
    }
    if (billing.address_apt) {
        address.push(billing.address_apt);
    }

    address.push(
        `${billing.address_city ? `${billing.address_city}, ` : ''}${billing.address_state ?? ''} ${billing.address_zip ?? ''}`,
        billing.address_country ? billing.address_country : ''
    );

    return (
        <>
            <div className="fs-saas-starter-billing-section__details flex flex-col gap-4">
                <BillingItem label={locale.portal.billing.label.businessName()} value={billing.business_name ?? ''} />
                <BillingItem
                    label={locale.portal.billing.label.phone()}
                    value={<code className="font-mono tracking-wide">{billing.phone ?? ''}</code>}
                />
                <BillingItem
                    label={locale.portal.billing.label.tax()}
                    value={<code className="font-mono tracking-widest">{billing.tax_id ?? ''}</code>}
                />
                <BillingItem
                    label={locale.portal.billing.label.address()}
                    value={
                        <div className="flex flex-col gap-1">
                            {address.map((item) => (
                                <p key={item}>{item}</p>
                            ))}
                        </div>
                    }
                />

                <BillingItem
                    label={locale.portal.billing.label.account()}
                    value={<strong className="font-mono tracking-widest">#{user.id}</strong>}
                />
            </div>

            <div className="mt-4">
                <Button variant="outline" onClick={() => setIsUpdating(true)}>
                    {locale.portal.billing.action.update()}
                </Button>
            </div>
        </>
    );
}
