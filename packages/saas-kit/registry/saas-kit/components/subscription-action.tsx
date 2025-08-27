import * as React from 'react';
import {
    BILLING_CYCLE,
    PortalSubscription,
    PortalPlans,
    PricingEntity,
    SellingUnit,
    isIdsEqual,
    parseCurrency,
} from '@freemius/sdk';
import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuPortal,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCheckout } from '../hooks/checkout';
import { useLocale } from '../utils/locale';
import { formatCurrency, formatNumber } from '../utils/formatter';
import { findClosestPricing } from '../utils/pricing-ops';

type EnrichedPricing = PricingEntity & {
    updateAmount: string | null;
    updatePeriod: string | null;
};

type PlanWithPricing = Omit<PortalPlans[0], 'pricing'> & {
    closestPricing: EnrichedPricing | null;
    pricing: EnrichedPricing[] | null;
};

/**
 * @todo
 * 1. Implement a nice short pricing table like UI when upgrading or downgrading.
 */
export function SubscriptionAction(props: {
    subscription: PortalSubscription;
    plans: PortalPlans;
    sellingUnit: SellingUnit;
    onCancel?: () => void;
}) {
    const { subscription, plans, onCancel } = props;
    const locale = useLocale();

    const checkout = useCheckout();

    const data = useMemo(() => {
        const availablePlans: PlanWithPricing[] = plans
            // Filter out all plans which are strictly subscription only.
            .filter((plan) => {
                return plan.pricing?.some((pricing) => pricing.annual_price || pricing.monthly_price);
            })
            // Augment each plan with closest pricing based on the current subscription quota.
            .map((plan) => {
                const filteredPricing: EnrichedPricing[] | undefined = plan.pricing
                    ?.filter((pricing) => {
                        return (
                            (pricing.annual_price || pricing.monthly_price) &&
                            parseCurrency(pricing.currency) === subscription.currency
                        );
                    })
                    .map((pricing) => {
                        let updatePeriod: BILLING_CYCLE | null = null;
                        let updateAmount: number | null = null;

                        if (subscription.billingCycle === BILLING_CYCLE.MONTHLY) {
                            if (pricing.monthly_price) {
                                updatePeriod = BILLING_CYCLE.MONTHLY;
                                updateAmount = pricing.monthly_price;
                            } else if (pricing.annual_price) {
                                updatePeriod = BILLING_CYCLE.YEARLY;
                                updateAmount = pricing.annual_price;
                            }
                        } else {
                            if (pricing.annual_price) {
                                updatePeriod = BILLING_CYCLE.YEARLY;
                                updateAmount = pricing.annual_price;
                            } else if (pricing.monthly_price) {
                                updatePeriod = BILLING_CYCLE.MONTHLY;
                                updateAmount = pricing.monthly_price;
                            }
                        }

                        return {
                            ...pricing,
                            updateAmount: updateAmount
                                ? formatCurrency(updateAmount, subscription.currency, locale.code)
                                : null,
                            updatePeriod: updatePeriod ? locale.billingCycle(updatePeriod).toLocaleLowerCase() : null,
                        };
                    });

                // This shouldn't happen because of the filtering above.
                if (!filteredPricing?.length) {
                    throw new Error(`Plan ${plan.id} has no valid pricing.`);
                }

                const closestPricing = findClosestPricing(filteredPricing, subscription.quota);

                // Put the closest pricing first in the list.
                const pricing = closestPricing
                    ? filteredPricing.filter((p) => !isIdsEqual(p.id!, closestPricing.id!))
                    : filteredPricing;

                if (closestPricing) {
                    pricing.unshift(closestPricing);
                }

                return {
                    ...plan,
                    pricing,
                    closestPricing,
                };
            });

        const currentPlanIndex = availablePlans.findIndex((plan) => isIdsEqual(plan.id!, subscription.planId)) ?? 0;

        const currentPlan = availablePlans[currentPlanIndex];

        const lowerPlans = availablePlans.slice(0, currentPlanIndex);
        const higherPlans = availablePlans.slice(currentPlanIndex + 1);

        const hasUpgrade = higherPlans.length > 0 || (currentPlan.pricing?.length ?? 0) > 1;
        const hasDowngrade = lowerPlans.length > 0;

        return { lowerPlans, higherPlans, currentPlan, hasDowngrade, hasUpgrade } as const;
    }, [subscription, plans, locale]);

    if (!subscription.isActive) {
        return (
            <Button
                className="w-full"
                onClick={() =>
                    checkout.open({
                        license_id: subscription.licenseId,
                        authorization: subscription.checkoutUpgradeAuthorization,
                        plan_id: subscription.planId,
                    })
                }
            >
                {locale.portal.action.reactivate()}
            </Button>
        );
    }

    return (
        <div className="w-full flex flex-col gap-2">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button className="w-full">{locale.portal.action.update()}</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-70" align="start">
                    {data.hasUpgrade ? (
                        <>
                            <PlanUpdateSection
                                label="Upgrade"
                                plans={data.higherPlans}
                                subscription={subscription}
                                sellingUnit={props.sellingUnit}
                            />
                            <PlanUpdateSection
                                plans={[data.currentPlan]}
                                subscription={subscription}
                                sellingUnit={props.sellingUnit}
                            />
                        </>
                    ) : null}
                    {data.hasDowngrade ? (
                        <>
                            <DropdownMenuSeparator />
                            <PlanUpdateSection
                                label="Downgrade"
                                plans={data.lowerPlans}
                                subscription={subscription}
                                sellingUnit={props.sellingUnit}
                            />
                        </>
                    ) : null}
                </DropdownMenuContent>
            </DropdownMenu>
            {onCancel ? (
                <Button className="w-full" variant="outline" onClick={onCancel}>
                    {locale.portal.action.cancel()}
                </Button>
            ) : null}
        </div>
    );
}

function PlanUpdateSection({
    label,
    plans,
    subscription,
    sellingUnit,
}: {
    label?: string;
    plans: PlanWithPricing[];
    subscription: PortalSubscription;
    sellingUnit: SellingUnit;
}) {
    const locale = useLocale();
    const checkout = useCheckout();

    return (
        <>
            {label ? <DropdownMenuLabel>{label}</DropdownMenuLabel> : null}
            <DropdownMenuGroup>
                {plans.map((plan) => {
                    if (!plan.pricing?.length) {
                        return null;
                    }

                    if (plan.pricing.length === 1) {
                        return (
                            <DropdownMenuItem
                                disabled={isIdsEqual(plan.closestPricing!.id!, subscription.pricingId)}
                                key={plan.id}
                                onClick={() =>
                                    checkout.open({
                                        license_id: subscription.licenseId,
                                        authorization: subscription.checkoutUpgradeAuthorization,
                                        plan_id: plan.id!,
                                        pricing_id: plan.closestPricing?.id,
                                    })
                                }
                            >
                                {plan.title}
                                {/* @todo - This data structure is weird here */}
                                {plan.closestPricing?.updateAmount && plan.closestPricing.updatePeriod ? (
                                    <DropdownMenuShortcut>
                                        {locale.portal.action.amount(
                                            plan.closestPricing.updateAmount,
                                            plan.closestPricing.updatePeriod
                                        )}
                                    </DropdownMenuShortcut>
                                ) : null}
                            </DropdownMenuItem>
                        );
                    }

                    const cheapestPricing = plan.pricing[0]!;

                    return (
                        <DropdownMenuSub key={plan.id}>
                            <DropdownMenuSubTrigger>
                                {plan.title}
                                {cheapestPricing.updateAmount && cheapestPricing.updatePeriod ? (
                                    <DropdownMenuShortcut>
                                        {locale.portal.action.amount(
                                            cheapestPricing.updateAmount,
                                            cheapestPricing.updatePeriod
                                        )}
                                    </DropdownMenuShortcut>
                                ) : null}
                            </DropdownMenuSubTrigger>
                            <DropdownMenuPortal>
                                <DropdownMenuSubContent className="w-70">
                                    {plan.pricing.map((pricing) => {
                                        if (!pricing.updateAmount || !pricing.updatePeriod) {
                                            return null;
                                        }

                                        return (
                                            <DropdownMenuItem
                                                key={pricing.id}
                                                disabled={isIdsEqual(pricing.id!, subscription.pricingId)}
                                                onClick={() =>
                                                    checkout.open({
                                                        license_id: subscription.licenseId,
                                                        authorization: subscription.checkoutUpgradeAuthorization,
                                                        plan_id: plan.id!,
                                                        pricing_id: pricing.id,
                                                    })
                                                }
                                            >
                                                {locale.portal.action.pricingTitle(
                                                    formatNumber(pricing.licenses ?? 0),
                                                    pricing.licenses ?? 0,
                                                    sellingUnit
                                                )}
                                                <DropdownMenuShortcut>
                                                    {isIdsEqual(pricing.id!, subscription.pricingId)
                                                        ? locale.portal.action.current()
                                                        : locale.portal.action.amount(
                                                              pricing.updateAmount,
                                                              pricing.updatePeriod
                                                          )}
                                                </DropdownMenuShortcut>
                                            </DropdownMenuItem>
                                        );
                                    })}
                                </DropdownMenuSubContent>
                            </DropdownMenuPortal>
                        </DropdownMenuSub>
                    );
                })}
            </DropdownMenuGroup>
        </>
    );
}
