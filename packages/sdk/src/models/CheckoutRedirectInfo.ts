import { idToString, parseBillingCycle, parseCurrency, parseDateTime, parseNumber } from '../api/parser';
import { BillingCycleApiEnum, CurrencyApiEnum, FSId } from '../api/types';
import { CheckoutRedirectData } from '../contracts/checkout';
import { BILLING_CYCLE, CURRENCY } from '../contracts/types';

export class CheckoutRedirectInfo implements CheckoutRedirectData {
    user_id: string;
    plan_id: string;
    email: string;
    pricing_id: string;
    currency: CURRENCY;
    license_id: string;
    expiration: Date | null;
    quota: number | null;
    action: 'payment_method_update' | 'license_update' | null;
    amount: number;
    tax: number;
    type: 'subscription' | 'one-off';
    subscription_id: string | null;
    billing_cycle: BILLING_CYCLE | null;
    payment_id: string | null;

    // Add these to the constructor to initialize the new members
    constructor(data: Record<string, unknown>) {
        this.user_id = idToString(data.user_id as FSId);
        this.plan_id = idToString(data.plan_id as FSId);
        this.email = data.email as string;
        this.pricing_id = idToString(data.pricing_id as FSId);
        this.currency = data.currency ? parseCurrency(data.currency as CurrencyApiEnum)! : CURRENCY.USD;
        this.license_id = idToString(data.license_id as FSId);
        this.expiration = data.expiration ? parseDateTime(data.expiration as string) : null;
        this.quota = data.quota ? parseNumber(data.quota) : null;
        this.action = data.action ? (data.action as 'payment_method_update' | 'license_update') : null;
        this.amount = parseNumber(data.amount as string)!;
        this.tax = parseNumber(data.tax as string)!;
        this.type = data.type === 'subscription' ? 'subscription' : 'one-off';
        this.subscription_id = data.subscription_id ? idToString(data.subscription_id as string) : null;
        this.billing_cycle = data.billing_cycle ? parseBillingCycle(data.billing_cycle as BillingCycleApiEnum) : null;
        this.payment_id = data.payment_id ? idToString(data.payment_id as string) : null;
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
            currency: this.currency,
            license_id: this.license_id,
            expiration: this.expiration,
            quota: this.quota,
            action: this.action,
            amount: this.amount,
            tax: this.tax,
            type: this.type,
            subscription_id: this.subscription_id,
            billing_cycle: this.billing_cycle,
            payment_id: this.payment_id,
        };
    }
}
