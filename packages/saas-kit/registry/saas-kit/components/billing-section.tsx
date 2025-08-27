import * as React from 'react';
import { PortalData } from '@freemius/sdk';
import { SectionHeading } from './section-heading';
import { useLocale } from '../utils/locale';
import { BillingForm } from './billing-form';
import { BillingInfo } from './billing-info';
import { BillingUpdatePayload } from '@freemius/sdk';
import { usePortalAction } from '../hooks/data';

export function BillingSection(props: {
    billing: NonNullable<PortalData['billing']>;
    user: NonNullable<PortalData['user']>;
}) {
    const [isUpdating, setIsUpdating] = React.useState<boolean>(false);
    const locale = useLocale();
    const [billing, setBilling] = React.useState<NonNullable<PortalData['billing']>>({
        ...props.billing,
    });

    const { execute } = usePortalAction<BillingUpdatePayload, PortalData['billing']>(props.billing.updateUrl);

    const updateBilling = async (billing: BillingUpdatePayload) => {
        const updatedBilling = await execute(billing);
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
