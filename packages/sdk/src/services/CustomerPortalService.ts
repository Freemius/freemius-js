import { ApiService } from './ApiService';
import { PricingTableData, FSId, PricingEntity } from '../api/types';
import { PortalData, PortalSubscription, PortalPayment, PortalAction } from '../contracts/portal';
import {
    parseBillingCycle,
    parseNumber,
    idToString,
    parseDateTime,
    isIdsEqual,
    parseCurrency,
    parsePaymentMethod,
} from '../api/parser';
import { CURRENCY } from '../contracts/types';
import { CheckoutService } from './CheckoutService';
import { CheckoutOptions } from '@freemius/checkout';
import { AuthService } from './AuthService';
import { InvoiceAction } from '../customer-portal/InvoiceAction';

export class CustomerPortalService {
    private readonly action: { invoice: PortalAction };

    constructor(
        private readonly api: ApiService,
        private readonly checkout: CheckoutService,
        private readonly authService: AuthService
    ) {
        this.action = {
            invoice: new InvoiceAction(this.api, this.authService),
        };
    }

    /**
     * Retrieves the customer portal data for a user, including subscriptions, billing, and payments.
     *
     * @param userId The ID of the user for whom to retrieve portal data.
     * @param primaryLicenseId Optional primary license ID to include in the portal data. If present then the `primary` field will be populated with related information which our `@freemius/saas-starter` package uses to display the primary purchase information.
     */
    async retrieveData(
        userId: FSId,
        endpoint: string,
        primaryLicenseId: FSId | null = null,
        sandbox: boolean = false
    ): Promise<PortalData | null> {
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

        const planTitles = this.getPlanTitleById(pricingData!);

        const allPricingsById = this.getPricingById(pricingData!);

        const portalPayments: PortalPayment[] = payments.map((payment) => ({
            ...payment,
            invoiceUrl: this.action.invoice.createAuthenticatedUrl(payment.id!, user.id!, endpoint),
            paymentMethod: parsePaymentMethod(payment.gateway)!,
            createdAt: parseDateTime(payment.created) ?? new Date(),
            planTitle: planTitles[payment.plan_id!] ?? `Plan ${payment.plan_id!}`,
            quota: allPricingsById[payment.pricing_id!]?.licenses ?? null,
        }));

        const checkoutOptions: CheckoutOptions = {
            product_id: this.api.productId,
        };

        if (sandbox) {
            checkoutOptions.sandbox = await this.checkout.getSandboxParams();
        }

        const billingData: PortalData = {
            endpoint,
            user,
            checkoutOptions,
            billing: billing
                ? {
                      ...billing,
                      updateToken: this.authService.createActionToken('update_billing', user.id!),
                  }
                : null,
            subscriptions: {
                primary: null,
                active: [],
                past: [],
            },
            payments: portalPayments,
            plans: pricingData.plans ?? [],
            sellingUnit: pricingData.selling_unit_label ?? {
                singular: 'Unit',
                plural: 'Units',
            },
            productId: this.api.productId,
        };

        subscriptions.forEach((subscription) => {
            const isActive = null === subscription.canceled_at;

            const subscriptionData: PortalSubscription = {
                subscriptionId: idToString(subscription.id!),
                planId: idToString(subscription.plan_id!),
                pricingId: idToString(subscription.pricing_id!),
                planTitle: planTitles[subscription.plan_id!] ?? `Plan ${subscription.plan_id!}`,
                renewalAmount: parseNumber(subscription.renewal_amount)!,
                initialAmount: parseNumber(subscription.initial_amount)!,
                billingCycle: parseBillingCycle(subscription.billing_cycle),
                isActive: isActive,
                renewalDate: parseDateTime(subscription.next_payment),
                licenseId: idToString(subscription.license_id!),
                currency: parseCurrency(subscription.currency) ?? CURRENCY.USD,
                createdAt: parseDateTime(subscription.created) ?? new Date(),
                cancelledAt: subscription.canceled_at ? parseDateTime(subscription.canceled_at) : null,
                quota: allPricingsById[subscription.pricing_id!]?.licenses ?? null,
                paymentMethod: parsePaymentMethod(subscription.gateway),
                upgradeToken: this.authService.createActionToken(`subscription_upgrade_${subscription.id!}`, user.id!),
            };

            if (isActive) {
                billingData.subscriptions.active.push(subscriptionData);
            } else {
                billingData.subscriptions.past.push(subscriptionData);
            }

            if (isActive && primaryLicenseId && isIdsEqual(subscription.license_id!, primaryLicenseId)) {
                billingData.subscriptions.primary = subscriptionData;
            }
        });

        // Sort subscriptions by created date, most recent first
        billingData.subscriptions.active.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        billingData.subscriptions.past.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

        if (!billingData.subscriptions.primary) {
            // If no primary subscription is set, use the first active or inactive subscription as primary
            billingData.subscriptions.primary =
                billingData.subscriptions.active[0] ?? billingData.subscriptions.past[0] ?? null;
        }

        // @todo - Right now add the checkout upgrade authorization to the primary subscription if it exists. In the future our API itself can return this data.
        if (billingData.subscriptions.primary) {
            billingData.subscriptions.primary.checkoutUpgradeAuthorization =
                await this.api.license.retrieveCheckoutUpgradeAuthorization(
                    billingData.subscriptions.primary.licenseId
                );
        }

        return billingData;
    }

    /**
     * Process actions done by the user in the customer portal.
     */
    async processAction(request: Request): Promise<Response> {
        const url = new URL(request.url);
        const action = url.searchParams.get('action');

        if (!action) {
            return Response.json({ error: 'Action parameter is required' }, { status: 400 });
        }

        const actionHandlers = Object.values(this.action);

        for (const actionHandler of actionHandlers) {
            if (actionHandler.canHandle(request)) {
                if (actionHandler.verifyAuthentication(request)) {
                    return await actionHandler.processAction(request);
                } else {
                    return Response.json({ error: 'Invalid authentication token' }, { status: 401 });
                }
            }
        }

        return Response.json({ error: 'Invalid action' }, { status: 400 });
    }

    private getPlanTitleById(pricingData: PricingTableData): Record<string, string> {
        const planTitles: Record<string, string> = {};

        pricingData.plans?.forEach((plan) => {
            planTitles[plan.id!] = plan.title ?? plan.name ?? 'Unknown Plan';
        });

        return planTitles;
    }

    private getPricingById(pricingData: PricingTableData): Record<string, PricingEntity> {
        const pricing: Record<string, PricingEntity> = {};

        pricingData.plans?.forEach((plan) => {
            plan.pricing?.forEach((p) => {
                pricing[p.id!] = p;
            });
        });

        return pricing;
    }
}
