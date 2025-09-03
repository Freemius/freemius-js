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

export interface PurchaseDBData {
    fsLicenseId: string;
    fsUserId: string;
    fsPlanId: string;
    expiration: Date | null | string;
    // @todo - Rename to `isCancelled`
    canceled: boolean;
}

export interface PurchaseCreditData {
    fsLicenseId: string;
    fsUserId: string;
    fsPlanId: string;
    credit: number;
}
