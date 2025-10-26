import type { CheckoutOptions } from '@freemius/checkout';
import { BILLING_CYCLE, CURRENCY } from './types';

/**
 * Data received from Freemius Checkout after redirecting back to the application.
 * Contains user, license, and payment details for the completed checkout.
 */
export interface CheckoutRedirectData {
    // #region Common Fields (for both free trials and other kinds of purchases)
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
     * Indicates the type of action performed during checkout.
     */
    action: 'payment_method_update' | 'license_update' | 'trial' | 'purchase';
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
    // #endregion

    //#region Trial Fields (Free or Paid)
    /**
     * Indicates if the trial is free or paid. Null if not a trial.
     */
    trial: 'free' | 'paid' | null;
    /**
     * End date of the trial period, if applicable.
     */
    trial_ends_at: Date | null;
    //#endregion

    // #region Purchase Fields
    /**
     * Currency of the purchase (ISO code).
     */
    currency: CURRENCY;
    /**
     * Total amount charged for the purchase.
     */
    amount: number;
    /**
     * Tax amount applied to the purchase.
     */
    tax: number;
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
    // #endregion

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
     *
     * If null, indicates this is a free trial purchase and the final type of purchase is not applicable.
     */
    type: 'subscription' | 'one-off' | null;
}

export type CheckoutBuilderUserOptions =
    | { email: string; firstName?: string; lastName?: string; name?: string }
    | null
    | undefined;

export type CheckoutBuilderOptions = {
    /**
     * The user for whom the checkout is being created.
     * This should be an object containing user details like email, ID, etc.
     * If not provided, the checkout will be created without user context.
     */
    user?: CheckoutBuilderUserOptions;
    /**
     * Whether to use sandbox mode for the checkout.
     *
     * @default false
     */
    isSandbox?: boolean;
    /**
     * Whether to include the recommended option in the checkout for maximum conversion.
     *
     * @default true
     */
    withRecommendation?: boolean;
    /**
     * The title of the checkout modal.
     */
    title?: string;
    /**
     * Image to display in the checkout modal. Must be a valid https URL.
     */
    image?: string;
    /**
     * Optional plan ID to use for the checkout.
     * If provided, this will be used as the default plan for the checkout, instead of the first paid plan.
     */
    planId?: string;
    /**
     * Optional quota to set for the checkout.
     *
     * This is useful when purchasing credits or similar resources.
     */
    quota?: number;
    /**
     * Optional trial period configuration.
     *
     * This can be used to set a trial period for the checkout.
     * If not provided, the checkout will not have a trial period.
     */
    trial?: CheckoutOptions['trial'];
};

/**
 * Interface for actions that can be processed during the checkout flow.
 */
export interface CheckoutAction {
    /**
     * Determine if the action can be handled by this processor.
     */
    canHandle(request: Request): boolean;

    /**
     * Process the action and return a response.
     */
    processAction(request: Request): Promise<Response>;
}
