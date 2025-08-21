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
    FSId,
    PaymentEntity,
    PlanEntity,
    PricingEntity,
    PricingTableData,
    SubscriptionEntity,
    UserEntity,
} from '../api/types';
import { PortalBilling, PortalPayment, PortalSubscription, PortalSubscriptions } from '../contracts/portal';
import { CURRENCY } from '../contracts/types';
import { ApiService } from '../services/ApiService';
import { BillingAction } from './BillingAction';
import { InvoiceAction } from './InvoiceAction';

export class PortalDataRepository {
    constructor(private readonly api: ApiService) {}

    async getApiData(userId: FSId): Promise<{
        user: UserEntity;
        pricingData: PricingTableData;
        subscriptions: SubscriptionEntity[];
        payments: PaymentEntity[];
        billing: BillingEntity | null;
    } | null> {
        const [user, pricingData, subscriptions, payments, billing] = await Promise.all([
            this.api.user.retrieve(userId),
            this.api.product.retrievePricingData(),
            this.api.user.retrieveSubscriptions(userId),
            this.api.user.retrievePayments(userId),
            this.api.user.retrieveBilling(userId),
        ]);

        if (!user || !pricingData || !subscriptions) {
            return null;
        }

        return { user, pricingData, subscriptions, payments, billing };
    }

    getPayments(
        payments: PaymentEntity[],
        plans: Map<string, PlanEntity>,
        pricings: Map<string, PricingEntity>,
        action: InvoiceAction,
        userId: FSId,
        endpoint: string
    ): PortalPayment[] {
        return payments.map((payment) => ({
            ...payment,
            invoiceUrl: action.createAuthenticatedUrl(payment.id!, idToString(userId), endpoint),
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

    getBilling(billing: BillingEntity | null, action: BillingAction, userId: FSId, endpoint: string): PortalBilling {
        return {
            ...(billing ?? {}),
            updateUrl: action.createAuthenticatedUrl(billing?.id ?? 'new', idToString(userId), endpoint),
        };
    }

    async getSubscriptions(
        subscriptions: SubscriptionEntity[],
        plans: Map<string, PlanEntity>,
        pricings: Map<string, PricingEntity>,
        primaryLicenseId: FSId | null = null
    ): Promise<PortalSubscriptions> {
        const portalSubscriptions: PortalSubscriptions = {
            primary: null,
            active: [],
            past: [],
        };

        subscriptions.forEach((subscription) => {
            const isActive = null === subscription.canceled_at;

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
}
