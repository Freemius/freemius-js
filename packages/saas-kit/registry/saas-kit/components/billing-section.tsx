import * as React from 'react';
import { PortalData } from '@freemius/sdk';
import { SectionHeading } from './section-heading';
import { useLocale } from '../utils/locale';
import { BillingForm } from './billing-form';
import { BillingInfo } from './billing-info';
import { BillingUpdatePayload } from '@freemius/sdk';

export function BillingSection(props: {
    billing: NonNullable<PortalData['billing']>;
    user: NonNullable<PortalData['user']>;
}) {
    const [isUpdating, setIsUpdating] = React.useState<boolean>(false);
    const locale = useLocale();
    const [billing, setBilling] = React.useState<NonNullable<PortalData['billing']>>({
        ...props.billing,
    });

    const updateBilling = async (billing: BillingUpdatePayload) => {
        const response = await fetch(props.billing.updateUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(billing),
        });

        if (!response.ok) {
            throw new Error('Update of billing information failed!');
        }

        const updatedBilling = await response.json();
        setBilling(updatedBilling);
    };

    return (
        <div className="fs-saas-starter-billing-section">
            <SectionHeading>{locale.portal.billing.title()}</SectionHeading>

            {isUpdating ? (
                <BillingForm billing={billing} setIsUpdating={setIsUpdating} updateBilling={updateBilling} />
            ) : (
                <BillingInfo billing={billing} user={props.user} setIsUpdating={setIsUpdating} />
            )}
        </div>
    );
}
