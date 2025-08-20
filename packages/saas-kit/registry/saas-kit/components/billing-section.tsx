import { PortalData } from '@freemius/sdk';
import { SectionHeading } from './section-heading';
import { ReactNode } from 'react';
import { useLocale } from '../utils/locale';
import { fullName } from '../utils/formatter';
import { Button } from '@/components/ui/button';

export function BillingSection(props: {
    billing: NonNullable<PortalData['billing']>;
    user: NonNullable<PortalData['user']>;
}) {
    const { billing, user } = props;
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
        <div className="fs-saas-starter-billing-section">
            <SectionHeading>{locale.portal.billing.title()}</SectionHeading>
            <div className="fs-saas-starter-billing-section__details flex flex-col gap-4">
                {billing.business_name ? (
                    <BillingItem label={locale.portal.billing.label.businessName()} value={billing.business_name} />
                ) : null}
                <BillingItem label={locale.portal.billing.label.name()} value={fullName(user.first, user.last)} />
                {address.length ? (
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
                ) : null}
                {billing.tax_id ? (
                    <BillingItem
                        label={locale.portal.billing.label.tax()}
                        value={<code className="font-mono tracking-widest">{billing.tax_id}</code>}
                    />
                ) : null}

                <BillingItem
                    label={locale.portal.billing.label.account()}
                    value={<strong className="font-mono tracking-widest">#{user.id}</strong>}
                />
                <BillingItem
                    label={locale.portal.billing.label.email()}
                    value={<span className="underline">{billing.email ?? user.email}</span>}
                />
                {billing.phone ? (
                    <BillingItem
                        label={locale.portal.billing.label.phone()}
                        value={<code className="font-mono tracking-wide">{billing.phone}</code>}
                    />
                ) : null}
            </div>
            <div className="mt-4">
                {/** @todo - Make the update actually work with the backend SDK and some API call */}
                <Button variant="outline">{locale.portal.billing.action.update()}</Button>
            </div>
        </div>
    );
}

function BillingItem(props: { label: ReactNode; value: ReactNode }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-1 md:gap-2 items-start">
            <div className="text-muted-foreground text-sm font-semibold">{props.label}</div>
            <div>{props.value}</div>
        </div>
    );
}
