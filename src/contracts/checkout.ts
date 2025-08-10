import { BILLING_CYCLE, CURRENCY } from './types';

/**
 * Data received from Freemius Checkout after redirecting back to the application.
 * Contains user, license, and payment details for the completed checkout.
 */
export interface CheckoutRedirectData {
    /**
     * ID of the Freemius user associated with the checkout.
     */
    user_id: string;
    /**
     * ID of the Freemius plan purchased.
     */
    plan_id: string;
    /**
     * Email address of the user associated with the license.
     */
    email: string;
    /**
     * ID of the Freemius pricing for the plan (used to determine quota).
     */
    pricing_id: string;
    /**
     * Currency of the purchase (ISO code).
     */
    currency: CURRENCY;
    /**
     * ID of the Freemius license, if available.
     */
    license_id: string;
    /**
     * Expiration date of the license, if available.
     */
    expiration: Date | null;
    /**
     * Quota/Units associated with the license, if available.
     */
    quota: number | null;
    /**
     * Indicates the type of action performed during checkout, if applicable.
     * Can be 'payment_method_update' or 'license_update'.
     *
     * If null it means the checkout was a standard purchase.
     */
    action: 'payment_method_update' | 'license_update' | null;
    /**
     * Total amount charged for the purchase.
     */
    amount: number;
    /**
     * Tax amount applied to the purchase.
     */
    tax: number;
    /**
     * Indicates a subscription purchase.
     * If present, the following fields are required:
     * - type: 'subscription'
     * - subscription_id
     * - billing_cycle
     *
     * If not present, the purchase is a one-off and the following fields are required:
     * - type: 'one-off'
     * - payment_id
     */
    type: 'subscription' | 'one-off';
    /**
     * ID of the Freemius subscription associated with the license (for subscriptions only).
     */
    subscription_id: string | null;
    /**
     * Billing cycle of the subscription (for subscriptions only).
     */
    billing_cycle: BILLING_CYCLE | null;
    /**
     * ID of the payment for the one-off purchase (for one-off only).
     */
    payment_id: string | null;
}
