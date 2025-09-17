import { BILLING_CYCLE, CURRENCY, PaymentMethod } from './types';

export interface PurchaseData {
    /**
     * Email address of the user associated with the license. This is unique to the user and is used for communication regarding the license.
     */
    email: string;
    /**
     * First name of the user associated with the license.
     */
    firstName: string;
    /**
     * Last name of the user associated with the license.
     */
    lastName: string;
    /**
     * ID of the Freemius user.
     */
    userId: string;
    /**
     * ID of the Freemius plan the license is associated with.
     */
    planId: string;
    /**
     * ID of the Freemius pricing of the plan (used to determine the quota of the purchase).
     */
    pricingId: string;
    /**
     * ID of the Freemius license.
     *
     * Use this ID to make additional API calls related to the license and associated subscriptions.
     */
    licenseId: string;
    /**
     * Expiration date of the license.
     *
     * If `null` then the license never expires (for one-off purchases).
     */
    expiration: Date | null;
    /**
     * Indicates if the license is canceled.
     */
    canceled: boolean;
    /**
     * Quota/Units associated with the license. If `null`, then it means the license has unlimited quota.
     */
    quota: number | null;
    /**
     * ID of the Freemius subscription associated with the license, if any.
     *
     * This is optional and may be `null` if the license is not associated with a subscription (for one-off purchases or if the subscription is cancelled already).
     */
    subscriptionId: string | null;
    /**
     * Billing cycle of the subscription, if applicable.
     *
     * This is optional and may be `null` if the license is not associated with a subscription.
     * The billing cycle could be `oneoff`, in case a subscription was created against a one-off trial.
     */
    billingCycle: BILLING_CYCLE | null;
    /**
     * Indicates if the license is currently active. Only relevant for subscriptions.
     */
    isActive: boolean;
    /**
     * Initial amount charged for the purchase, if applicable.
     */
    initialAmount: number | null;
    /**
     * Renewal amount for the subscription, if applicable.
     */
    renewalAmount: number | null;
    /**
     * Renewal date for the subscription, if applicable.
     */
    renewalDate: Date | null;
    /**
     * Currency of the purchase, if applicable.
     */
    currency: CURRENCY | null;
    /**
     * Payment method used for the purchase, if applicable.
     */
    paymentMethod: PaymentMethod | null;
    /**
     * Date when the purchase was created. This reflects the created date of the license. The subscription however can get cancelled or updated durign the life-cycle and shouldn't be used to determine the purchase date.
     */
    created: Date;
}

export type PurchaseEntitlementType = 'subscription' | 'oneoff';

/**
 * Data structure representing a purchase entitlement, which links a user to a specific license and plan within the Freemius system.
 * This is what is typically stored in your own database to keep track of user entitlements.
 */
export interface PurchaseEntitlementData {
    /**
     * The unique identifier of the user in the Freemius system.
     */
    fsLicenseId: string;
    /**
     * The unique identifier of the plan in the Freemius system.
     */
    fsPlanId: string;
    /**
     * The unique identifier of the pricing in the Freemius system.
     */
    fsPricingId: string;
    /**
     * The unique identifier of the user in the Freemius system.
     */
    fsUserId: string;
    /**
     * The type of entitlement, which can be either 'subscription' or 'oneoff'.
     */
    type: PurchaseEntitlementType;
    /**
     * The expiration date of the entitlement. If `null`, the entitlement does not expire.
     * If you are passing a string, then it must of the format "YYYY-MM-DD HH:mm:ss" in UTC.
     */
    expiration: Date | null | string;
    /**
     * The date when the entitlement was created. This is useful for record-keeping and auditing purposes.
     */
    createdAt: Date | string;
    /**
     * Indicates whether the entitlement has been canceled.
     */
    isCanceled: boolean;
}
