/* eslint-disable @typescript-eslint/no-unused-vars */
import { Checkout } from '../../checkout/Checkout';
import { PurchaseEntitlementData } from '../../contracts/purchase';
import { freemius } from './fs';

const SANDBOX = false;

type PricingData = {
    annual: number | null;
    monthly: number | null;
    // Percentage discount when choosing annual over monthly, rounded to nearest integer. Null if discount cannot be calculated (e.g. missing price data).
    annualDiscount: number | null;
    planId: string;
    title: string;
    canCheckout: boolean;
    checkoutUrl: string;
    isCurrentPlan: boolean;
    buttonText: string;
    features: { title: string; value: string }[];
};

/**
 * Create a Checkout session for the user.
 */
async function createFreemiusCheckout(
    user: { email: string; firstName?: string; lastName?: string },
    planId?: string
): Promise<Checkout> {
    // @ts-expect-error - The planId can be undefined and depending on some TS config it can cause error, but in practice this is fine.
    const checkout = await freemius.checkout.create({
        user,
        planId: planId,
        isSandbox: SANDBOX,
    });

    return checkout;
}

async function getPricingData(
    user: { email: string; firstName?: string; lastName?: string },
    entitlement: Pick<PurchaseEntitlementData, 'fsLicenseId' | 'fsPlanId'> | null = null
): Promise<PricingData[]> {
    const productPricing = await freemius.api.product.retrievePricingData();
    const upgradeAuth = entitlement
        ? await freemius.api.license.retrieveCheckoutUpgradeAuthorization(entitlement.fsLicenseId)
        : null;

    const subscription = entitlement ? await freemius.api.license.retrieveSubscription(entitlement.fsLicenseId) : null;
    const hasActiveSubscription = subscription?.canceled_at == null;
    const currentPlanIndex = entitlement
        ? (productPricing?.plans?.findIndex((plan) => plan.id === entitlement.fsPlanId) ?? -1)
        : -1;

    const data: PricingData[] = [];

    let index = 0;
    for (const plan of productPricing?.plans ?? []) {
        if (plan.is_hidden) {
            continue;
        }

        const checkout = await createFreemiusCheckout(user, plan.id!);
        const isCurrentPlan = entitlement?.fsPlanId == plan.id;

        if (upgradeAuth) {
            checkout.setLicenseUpgradeByAuth({ authorization: upgradeAuth, licenseId: entitlement!.fsLicenseId });
        }

        const annualPrice = plan.pricing?.[0]?.annual_price;
        const monthlyPrice = plan.pricing?.[0]?.monthly_price;

        let annualOverMonthlyDiscount = null;
        if (annualPrice != undefined && monthlyPrice != undefined) {
            const annualCost = annualPrice;
            const monthlyCost = monthlyPrice * 12;
            if (monthlyCost > 0) {
                annualOverMonthlyDiscount = Math.round(((monthlyCost - annualCost) / monthlyCost) * 100);
            }
        }

        const canCheckout = !hasActiveSubscription || !isCurrentPlan;

        const isLowerPlan = currentPlanIndex !== -1 && index < currentPlanIndex;

        const buttonText =
            !upgradeAuth || !hasActiveSubscription
                ? 'Subscribe'
                : isCurrentPlan
                  ? 'Your Plan'
                  : isLowerPlan
                    ? 'Downgrade'
                    : 'Upgrade';

        data.push({
            isCurrentPlan,
            canCheckout,
            buttonText,
            annual: plan.pricing?.[0]?.annual_price ?? null,
            monthly: plan.pricing?.[0]?.monthly_price ?? null,
            annualDiscount: annualOverMonthlyDiscount,
            planId: plan.id!,
            title: plan.title!,
            checkoutUrl: canCheckout ? checkout.getLink() : '',
            features:
                plan.features?.map((feature) => ({
                    title: feature.title!,
                    value: feature.value!,
                })) ?? [],
        });

        index++;
    }

    return data;
}

getPricingData({ email: 'swas@freemius.com' }, { fsLicenseId: '1868448', fsPlanId: '40918' }).then((data) => {
    console.log(data);
});

type SubscriptionPaymentData = {
    subscription: {
        id: string;
        cyclePricing: number;
        frequency: 'annual' | 'monthly';
        // In YYYY-MM-DD HH:mm:ss format
        nextPayment: string;
        isCancelled: boolean;
        // In YYYY-MM-DD HH:mm:ss format or null
        canceledAt: string | null;
        planTitle: string | null;
        unitTitle: string | null;
    } | null;
    payments: {
        id: string;
        gross: number;
        vat: number;
        currency: string;
        // In YYYY-MM-DD HH:mm:ss format
        created: string;
        planTitle: string | null;
        unitTitle: string | null;
        type: 'payment' | 'refund';
        isRenewal: boolean;
    }[];
};

async function getSubscriptionAndPayments(
    entitlement: Pick<PurchaseEntitlementData, 'fsLicenseId' | 'fsUserId'>
): Promise<SubscriptionPaymentData> {
    const subscription = await freemius.api.license.retrieveSubscription(entitlement.fsLicenseId);
    const payments = await freemius.api.user.retrievePayments(entitlement.fsUserId);
    const pricingData = await freemius.api.product.retrievePricingData();

    const planTitleById = new Map<string, string>();
    const pricingById = new Map<string, { quota: number }>();

    pricingData?.plans?.forEach((plan) => {
        planTitleById.set(plan.id!, plan.title!);

        plan.pricing?.forEach((pricing) => {
            pricingById.set(pricing.id!, {
                quota: pricing.licenses ?? 1,
            });
        });
    });

    function formatQuota(quota: number | null): string | null {
        if (!quota || quota === 1) {
            return null;
        }

        const singular = pricingData?.plugin?.selling_unit_label?.singular ?? 'Unit';
        const plural = pricingData?.plugin?.selling_unit_label?.plural ?? 'Units';

        return `${quota} ${quota === 1 ? singular : plural}`;
    }

    const data: SubscriptionPaymentData = {
        subscription: subscription
            ? {
                  id: subscription.id!,
                  cyclePricing: subscription.amount_per_cycle!,
                  frequency: subscription.billing_cycle === 12 ? 'annual' : 'monthly',
                  nextPayment: subscription.next_payment!,
                  isCancelled: subscription.canceled_at !== null,
                  canceledAt: subscription.canceled_at ?? null,
                  planTitle: planTitleById.get(subscription.plan_id!) ?? 'Unknown Plan',
                  unitTitle: formatQuota(pricingById.get(subscription.pricing_id!)?.quota ?? null),
              }
            : null,
        payments:
            payments?.map((payment) => ({
                id: payment.id!,
                gross: payment.gross!,
                vat: payment.vat!,
                currency: payment.currency!,
                created: payment.created!,
                planTitle: planTitleById.get(payment.plan_id!) ?? 'Unknown Plan',
                type: payment.type === 'payment' ? 'payment' : 'refund',
                unitTitle: formatQuota(pricingById.get(payment.pricing_id!)?.quota ?? null),
                isRenewal: payment.is_renewal ?? false,
            })) ?? [],
    };

    return data;
}

getSubscriptionAndPayments({ fsLicenseId: '1868256', fsUserId: '5723112' }).then((data) => {
    console.log(data);
});

async function cancelSubscription(entitlement: Pick<PurchaseEntitlementData, 'fsLicenseId'>): Promise<boolean> {
    const subscription = await freemius.api.license.retrieveSubscription(entitlement.fsLicenseId);

    if (!subscription || subscription.canceled_at != null) {
        return false;
    }

    await freemius.api.subscription.cancel(subscription.id!);

    return true;
}

cancelSubscription({ fsLicenseId: '1867816' }).then((result) => {
    console.log('Cancellation result:', result);
});

async function getInvoice(userId: string, paymentId: string): Promise<Blob | null> {
    const invoice = await freemius.api.user.retrieveInvoice(userId, paymentId);

    return invoice;
}

getInvoice('5723112', '1917010').then((invoice) => {
    if (invoice) {
        console.log('Invoice retrieved successfully:', invoice);
    } else {
        console.log('Failed to retrieve invoice.');
    }
});
