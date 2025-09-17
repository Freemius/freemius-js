import { CheckoutOptions } from '@freemius/checkout';
import {
    idToString,
    isIdsEqual,
    parseBillingCycle,
    parseCurrency,
    parseDateTime,
    parseNumber,
    parsePaymentMethod,
} from '../api/parser';
import {
    BillingEntity,
    CouponEntityEnriched,
    FSId,
    PaymentEntity,
    PlanEntity,
    PricingEntity,
    PricingTableData,
    SellingUnit,
    UserEntity,
    UserSubscriptionEntity,
} from '../api/types';
import { PortalBilling, PortalData, PortalPayment, PortalSubscription, PortalSubscriptions } from '../contracts/portal';
import { CURRENCY } from '../contracts/types';
import { ApiService } from '../services/ApiService';
import { CheckoutService } from '../services/CheckoutService';
import { CustomerPortalActionService } from './CustomerPortalActionService';

type CustomerPortalDataOption = {
    /**
     * The API endpoint for which secure authenticated signed URLs will be created where the customer portal will send requests to fetch additional data (e.g., invoices, licenses, subscriptions). This should be an endpoint in your SaaS application that you will implement to handle these requests.
     */
    endpoint: string;
    /**
     * ID of the primary licenses, in case your software has pricing model supporting multiple active subscriptions. If not provided the first active subscription will be used instead.
     */
    primaryLicenseId?: FSId | null;
    /**
     * Whether to create actions in sandbox mode (For example Checkout, Upgrade etc).
     */
    sandbox?: boolean;
};

export type CustomerPortalDataWithUserOption = {
    /**
     * ID of the user from Freemius.
     */
    userId: FSId;
} & CustomerPortalDataOption;

export type CustomerPortalDataWithEmailOption = {
    /**
     * The email address of the user from Freemius.
     */
    email: string;
} & CustomerPortalDataOption;

export class PortalDataRepository {
    constructor(
        private readonly api: ApiService,
        private readonly action: CustomerPortalActionService,
        private readonly checkout: CheckoutService
    ) {}

    async retrievePortalDataByEmail(config: CustomerPortalDataWithEmailOption): Promise<PortalData | null> {
        const user = await this.api.user.retrieveByEmail(config.email);

        if (!user) {
            return null;
        }

        return this.retrievePortalData({
            user,
            endpoint: config.endpoint,
            primaryLicenseId: config.primaryLicenseId ?? null,
            sandbox: config.sandbox ?? false,
        });
    }

    async retrievePortalDataByUserId(config: CustomerPortalDataWithUserOption): Promise<PortalData | null> {
        const user = await this.api.user.retrieve(config.userId);

        if (!user) {
            return null;
        }

        return this.retrievePortalData({
            user,
            endpoint: config.endpoint,
            primaryLicenseId: config.primaryLicenseId ?? null,
            sandbox: config.sandbox ?? false,
        });
    }

    async retrievePortalData(config: {
        user: UserEntity;
        endpoint: string;
        primaryLicenseId?: FSId | null;
        sandbox?: boolean;
    }): Promise<PortalData | null> {
        const { user, endpoint, primaryLicenseId = null, sandbox = false } = config;
        const userId = user.id!;

        const data = await this.retrieveApiData(userId);

        if (!data) {
            return null;
        }

        const { pricingData, subscriptions, payments, billing, coupons } = data;

        const plans = this.getPlansById(pricingData);
        const pricings = this.getPricingById(pricingData);

        const checkoutOptions: CheckoutOptions = {
            product_id: this.api.productId,
        };

        if (sandbox) {
            checkoutOptions.sandbox = await this.checkout.getSandboxParams();
        }

        const portalData: PortalData = {
            endpoint,
            user,
            checkoutOptions,
            billing: this.getBilling(billing, userId, endpoint),
            subscriptions: await this.getSubscriptions(subscriptions, plans, pricings, primaryLicenseId, endpoint),
            payments: this.getPayments(payments, plans, pricings, userId, endpoint),
            plans: pricingData.plans ?? [],
            sellingUnit: (pricingData.plugin?.selling_unit_label as SellingUnit) ?? {
                singular: 'Unit',
                plural: 'Units',
            },
            productId: this.api.productId,
            cancellationCoupons: coupons,
        };

        return portalData;
    }

    async retrieveApiData(userId: FSId): Promise<{
        pricingData: PricingTableData;
        subscriptions: UserSubscriptionEntity[];
        payments: PaymentEntity[];
        billing: BillingEntity | null;
        coupons: CouponEntityEnriched[] | null;
    } | null> {
        const [pricingData, subscriptions, payments, billing, coupons] = await Promise.all([
            this.api.product.retrievePricingData(),
            this.api.user.retrieveSubscriptions(userId, { extended: true }),
            this.api.user.retrievePayments(userId),
            this.api.user.retrieveBilling(userId),
            this.api.product.retrieveSubscriptionCancellationCoupon(),
        ]);

        if (!pricingData || !subscriptions) {
            return null;
        }

        return { pricingData, subscriptions, payments, billing, coupons };
    }

    getPayments(
        payments: PaymentEntity[],
        plans: Map<string, PlanEntity>,
        pricings: Map<string, PricingEntity>,
        userId: FSId,
        endpoint: string
    ): PortalPayment[] {
        return payments.map((payment) => ({
            ...payment,
            invoiceUrl: this.action.invoice.createAuthenticatedUrl(payment.id!, idToString(userId), endpoint),
            paymentMethod: parsePaymentMethod(payment.gateway)!,
            createdAt: parseDateTime(payment.created) ?? new Date(),
            planTitle: plans.get(payment.plan_id!)?.title ?? `Plan ${payment.plan_id!}`,
            quota: pricings.get(payment.pricing_id!)?.licenses ?? null,
        }));
    }

    getPlansById(pricingData: PricingTableData): Map<string, PlanEntity> {
        const plans: Map<string, PlanEntity> = new Map();

        pricingData.plans?.forEach((plan) => {
            plan.title = plan.title ?? plan.name ?? `Plan ${plan.id!}`;
            plans.set(idToString(plan.id!), plan);
        });

        return plans;
    }

    getPricingById(pricingData: PricingTableData): Map<string, PricingEntity> {
        const pricings: Map<string, PricingEntity> = new Map();

        pricingData.plans?.forEach((plan) => {
            plan.pricing?.forEach((p) => {
                pricings.set(idToString(p.id!), p);
            });
        });

        return pricings;
    }

    getBilling(billing: BillingEntity | null, userId: FSId, endpoint: string): PortalBilling {
        return {
            ...(billing ?? {}),
            updateUrl: this.action.billing.createAuthenticatedUrl(billing?.id ?? 'new', idToString(userId), endpoint),
        };
    }

    async getSubscriptions(
        subscriptions: UserSubscriptionEntity[],
        plans: Map<string, PlanEntity>,
        pricings: Map<string, PricingEntity>,
        primaryLicenseId: FSId | null = null,
        endpoint: string
    ): Promise<PortalSubscriptions> {
        const portalSubscriptions: PortalSubscriptions = {
            primary: null,
            active: [],
            past: [],
        };

        subscriptions.forEach((subscription) => {
            const isActive = null === subscription.canceled_at;
            const trialEndsData = subscription.trial_ends ? parseDateTime(subscription.trial_ends) : null;
            const isTrial = trialEndsData ? trialEndsData > new Date() : false;
            const isFreeTrial = isTrial && !subscription.gateway;

            const subscriptionData: PortalSubscription = {
                subscriptionId: idToString(subscription.id!),
                planId: idToString(subscription.plan_id!),
                pricingId: idToString(subscription.pricing_id!),
                planTitle: plans.get(subscription.plan_id!)?.title ?? `Plan ${subscription.plan_id!}`,
                renewalAmount: parseNumber(subscription.renewal_amount)!,
                initialAmount: parseNumber(subscription.initial_amount)!,
                billingCycle: parseBillingCycle(subscription.billing_cycle),
                isActive: isActive,
                renewalDate: parseDateTime(subscription.next_payment),
                licenseId: idToString(subscription.license_id!),
                currency: parseCurrency(subscription.currency) ?? CURRENCY.USD,
                createdAt: parseDateTime(subscription.created) ?? new Date(),
                cancelledAt: subscription.canceled_at ? parseDateTime(subscription.canceled_at) : null,
                quota: pricings.get(subscription.pricing_id!)?.licenses ?? null,
                paymentMethod: parsePaymentMethod(subscription.gateway),
                isTrial: isTrial,
                trialEnds: isTrial ? trialEndsData : null,
                isFreeTrial: isFreeTrial,
                applyRenewalCancellationCouponUrl: this.isRenewalCancellationCouponApplicable(subscription)
                    ? this.action.renewalCoupon.createAuthenticatedUrl(
                          idToString(subscription.id!),
                          idToString(subscription.user_id!),
                          endpoint
                      )
                    : null,
                cancelRenewalUrl: this.action.cancelRenewal.createAuthenticatedUrl(
                    idToString(subscription.id!),
                    idToString(subscription.user_id!),
                    endpoint
                ),
            };

            if (isActive) {
                portalSubscriptions.active.push(subscriptionData);
            } else {
                portalSubscriptions.past.push(subscriptionData);
            }

            if (isActive && primaryLicenseId && isIdsEqual(subscription.license_id!, primaryLicenseId)) {
                portalSubscriptions.primary = subscriptionData;
            }
        });

        // Sort subscriptions by created date, most recent first
        portalSubscriptions.active.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        portalSubscriptions.past.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

        if (!portalSubscriptions.primary) {
            // If no primary subscription is set, use the first active or inactive subscription as primary
            portalSubscriptions.primary = portalSubscriptions.active[0] ?? portalSubscriptions.past[0] ?? null;
        }

        // @todo - Right now add the checkout upgrade authorization to the primary subscription if it exists. In the future our API itself can return this data.
        if (portalSubscriptions.primary) {
            portalSubscriptions.primary.checkoutUpgradeAuthorization =
                await this.api.license.retrieveCheckoutUpgradeAuthorization(portalSubscriptions.primary.licenseId);
        }

        return portalSubscriptions;
    }

    /**
     * Check if coupon application is impossible due to certain conditions.
     * This function can be used to determine if a coupon can be applied to a subscription.
     * Introduced initially for PayPal subscriptions with a renewal date less than 48 hours in the future.
     *
     * @author @DanieleAlessandra
     * @author @swashata (Ported to SDK)
     *
     * @returns boolean
     */
    isRenewalCancellationCouponApplicable(subscription: UserSubscriptionEntity): boolean {
        // If it was already applied, do not allow applying it again.
        if (subscription.has_subscription_cancellation_discount) {
            return false;
        }

        // The block is only for PayPal subscriptions
        if (subscription.gateway !== 'paypal') {
            return true;
        }

        // Convert next_payment to time.
        const nextPaymentTime = parseDateTime(subscription.next_payment)?.getTime() ?? 0;

        // Get the current time.
        const currentTime = new Date().getTime();

        // Check if the next payment is at least 48 hours in the future.
        const fortyEightHoursInMs = 48 * 60 * 60 * 1000;

        return nextPaymentTime <= currentTime + fortyEightHoursInMs;
    }
}
