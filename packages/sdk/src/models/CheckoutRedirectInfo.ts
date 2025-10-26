import { idToString, parseBillingCycle, parseCurrency, parseDateTime, parseNumber } from '../api/parser';
import { BillingCycleApiEnum, CurrencyApiEnum, FSId } from '../api/types';
import { CheckoutRedirectData } from '../contracts/checkout';
import { BILLING_CYCLE, CURRENCY } from '../contracts/types';

export class CheckoutRedirectInfo implements CheckoutRedirectData {
    user_id: string;
    plan_id: string;
    email: string;
    pricing_id: string;
    action: 'payment_method_update' | 'license_update' | 'trial' | 'purchase';
    license_id: string;
    expiration: Date | null;
    quota: number | null;

    trial: 'free' | 'paid' | null;
    trial_ends_at: Date | null;

    currency: CURRENCY;
    amount: number;
    tax: number;
    type: 'subscription' | 'one-off' | null;
    subscription_id: string | null;
    billing_cycle: BILLING_CYCLE | null;
    payment_id: string | null;

    // Add these to the constructor to initialize the new members
    constructor(data: Record<string, unknown>) {
        this.user_id = idToString(data.user_id as FSId);
        this.plan_id = idToString(data.plan_id as FSId);
        this.email = data.email as string;
        this.pricing_id = idToString(data.pricing_id as FSId);
        this.action = data.action
            ? (data.action as 'payment_method_update' | 'license_update' | 'trial' | 'purchase')
            : 'purchase';
        this.license_id = idToString(data.license_id as FSId);
        this.expiration = data.expiration ? parseDateTime(data.expiration as string) : null;
        this.quota = data.quota ? parseNumber(data.quota) : null;

        this.trial = data.trial ? (data.trial as 'free' | 'paid') : null;
        this.trial_ends_at = data.trial_ends_at ? parseDateTime(data.trial_ends_at as string) : null;

        this.currency = data.currency ? parseCurrency(data.currency as CurrencyApiEnum)! : CURRENCY.USD;
        this.amount = parseNumber(data.amount as string)!;
        this.tax = parseNumber(data.tax as string)!;
        this.subscription_id = data.subscription_id ? idToString(data.subscription_id as string) : null;
        this.billing_cycle = data.billing_cycle ? parseBillingCycle(data.billing_cycle as BillingCycleApiEnum) : null;
        this.payment_id = data.payment_id ? idToString(data.payment_id as string) : null;

        this.type = this.subscription_id ? 'subscription' : this.payment_id ? 'one-off' : null;
    }

    isSubscription(): boolean {
        return this.type === 'subscription';
    }

    toData(): CheckoutRedirectData {
        return {
            user_id: this.user_id,
            plan_id: this.plan_id,
            email: this.email,
            pricing_id: this.pricing_id,
            license_id: this.license_id,
            expiration: this.expiration,
            quota: this.quota,

            trial: this.trial,
            trial_ends_at: this.trial_ends_at,

            currency: this.currency,
            action: this.action,
            amount: this.amount,
            tax: this.tax,
            subscription_id: this.subscription_id,
            billing_cycle: this.billing_cycle,
            payment_id: this.payment_id,

            type: this.type,
        };
    }
}
