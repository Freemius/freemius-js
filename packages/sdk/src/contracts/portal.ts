import { CheckoutOptions } from '@freemius/checkout';
import { operations } from '../api/schema';
import { BillingEntity, FSId, PaymentEntity, SellingUnit, UserEntity } from '../api/types';
import { BILLING_CYCLE, CURRENCY, PaymentMethod } from './types';

export interface PortalSubscription {
    subscriptionId: string;
    licenseId: string;
    planId: string;
    pricingId: string;
    planTitle: string;
    renewalAmount: number;
    initialAmount: number;
    billingCycle: BILLING_CYCLE | null;
    isActive: boolean;
    renewalDate: Date | null;
    currency: CURRENCY;
    cancelledAt?: Date | null;
    createdAt: Date;
    checkoutUpgradeAuthorization?: string | null;
    quota: number | null;
    paymentMethod: PaymentMethod | null;
    upgradeUrl?: string;
}

export type PortalPlans = NonNullable<
    operations['products/retrieve-pricing-table-data']['responses']['200']['content']['application/json']['plans']
>;

export type PortalPayment = PaymentEntity & {
    invoiceUrl: string;
    paymentMethod: PaymentMethod;
    createdAt: Date;
    quota: number | null;
    planTitle: string;
};

export type PortalBilling = (BillingEntity | null) & {
    updateUrl: string;
};

export type PortalSubscriptions = {
    primary: PortalSubscription | null;
    active: PortalSubscription[];
    past: PortalSubscription[];
};

export interface PortalData {
    user: UserEntity;
    endpoint: string;
    subscriptions: PortalSubscriptions;
    billing: PortalBilling;
    payments: PortalPayment[] | null;
    plans: PortalPlans;
    sellingUnit: SellingUnit;
    productId: string;
    checkoutOptions: CheckoutOptions;
}

/**
 * Interface for actions that can be processed in the customer portal.
 */
export interface PortalAction {
    createAuthenticatedUrl(id: string, userId: FSId, endpoint: string): string;

    verifyAuthentication(request: Request): boolean;

    canHandle(request: Request): boolean;

    /**
     * Process the action and return a response.
     */
    processAction(request: Request): Promise<Response>;
}
