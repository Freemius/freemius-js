import type { PortalData } from '@freemius/sdk';
import { SectionHeading } from './section-heading';
import { useLocale } from '../utils/locale';
import { formatCurrency, formatDate } from '../utils/formatter';
import SubscriptionAction from './subscription-action';
import PaymentMethodUpdate from './payment-method-update';

export default function PrimarySubscription(props: {
    subscription: NonNullable<PortalData['subscriptions']['primary']>;
    plans: PortalData['plans'];
    sellingUnit: PortalData['sellingUnit'];
}) {
    const { subscription, plans, sellingUnit } = props;
    const locale = useLocale();

    const isActive = subscription.isActive;

    return (
        <div className="fs-saas-starter-portal__primary-subscription">
            <SectionHeading>{locale.portal.primary.title()}</SectionHeading>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="">
                    <h3 className="text-lg mb-0">{locale.portal.primary.planTitle(subscription.planTitle)}</h3>
                    <p className="text-2xl font-bold">
                        {subscription.billingCycle
                            ? locale.portal.primary.renewal.amount(
                                  formatCurrency(subscription.renewalAmount, subscription.currency, locale.code),
                                  locale.billingCycle(subscription.billingCycle).toLocaleLowerCase()
                              )
                            : formatCurrency(subscription.renewalAmount, subscription.currency, locale.code)}
                    </p>
                    <p className="text-sm mt-5">
                        {isActive
                            ? locale.portal.primary.renewal.active(formatDate(subscription.renewalDate, locale.code))
                            : locale.portal.primary.renewal.inactive(
                                  formatDate(subscription.cancelledAt!, locale.code)
                              )}
                    </p>
                </div>
                <div className="max-w-50 md:ml-auto">
                    <SubscriptionAction subscription={subscription} plans={plans} sellingUnit={sellingUnit} />
                </div>
            </div>
            <div className="mt-4">{isActive ? <PaymentMethodUpdate subscription={subscription} /> : null}</div>
        </div>
    );
}
