'use client';

import * as React from 'react';
import type { PortalData } from '@freemius/sdk';
import { useLocale } from '../utils/locale';
import { formatCurrency, formatDate } from '../utils/formatter';
import { SubscriptionAction } from './subscription-action';
import { PaymentMethodUpdate } from './payment-method-update';
import PaymentIcon from './payment-icon';
import { Badge } from '@/components/ui/badge';

export function SubscriptionInfo(props: {
    subscription: NonNullable<PortalData['subscriptions']['primary']>;
    plans: PortalData['plans'];
    sellingUnit: PortalData['sellingUnit'];
    onCancel?: () => void;
}) {
    const { subscription, plans, sellingUnit, onCancel } = props;
    const locale = useLocale();

    const renewalDate = subscription.renewalDate ? new Date(subscription.renewalDate) : null;
    const isActive = subscription.isActive;

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="">
                    <h3 className="text-lg mb-0 flex align-baseline">
                        {locale.portal.primary.planTitle(subscription.planTitle)}
                        {!isActive ? (
                            <Badge variant="destructive" className="ml-2">
                                {locale.portal.primary.inactiveBadge()}
                            </Badge>
                        ) : null}
                    </h3>
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
                    <SubscriptionAction
                        subscription={subscription}
                        plans={plans}
                        sellingUnit={sellingUnit}
                        onCancel={onCancel}
                    />
                </div>
            </div>
            <div className="mt-4">
                {isActive ? (
                    <PaymentMethodUpdate subscription={subscription} />
                ) : renewalDate && renewalDate > new Date() ? (
                    <div className="flex items-center">
                        <PaymentIcon method={subscription.paymentMethod!} />
                        <p className="text-sm text-muted-foreground">
                            {locale.portal.primary.renewal.updatePaymentMethodBefore(
                                formatDate(renewalDate, locale.code)
                            )}
                        </p>
                    </div>
                ) : null}
            </div>
        </>
    );
}
