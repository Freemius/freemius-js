import { BILLING_CYCLE } from '../contracts/types';
import { components } from '../api/schema';
import { parseFreemiusDate } from '../utils/date';
import { FSId, idToString } from '../utils/id';

export class PurchaseInfo {
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
     * Quota/Units associated with the license. If `null`, then it means the license has unlimited quota.
     */
    quota: number | null;

    constructor(
        user: components['schemas']['User'],
        license: components['schemas']['License'],
        subscription: components['schemas']['Subscription'] | null
    ) {
        this.email = user.email!;
        this.firstName = user.first ?? '';
        this.lastName = user.last ?? '';
        this.userId = idToString(license.user_id!);
        this.canceled = license.is_cancelled ?? false;
        this.expiration = license.expiration ? parseFreemiusDate(license.expiration) : null;
        this.licenseId = idToString(license.id!);
        this.planId = idToString(license.plan_id!);
        this.subscriptionId = null;
        this.billingCycle = null;
        this.quota = license.quota ?? null;

        if (subscription) {
            this.subscriptionId = idToString(subscription.id!);
            this.billingCycle = this.getBillingCycle(subscription);
        }
    }

    isPlan(planId: FSId): boolean {
        return this.planId === idToString(planId);
    }

    isActive(): boolean {
        if (this.canceled) {
            return false;
        }

        if (this.expiration && this.expiration < new Date()) {
            return false;
        }

        return true;
    }

    isAnnual(): boolean {
        return this.billingCycle === BILLING_CYCLE.YEARLY;
    }

    isMonthly(): boolean {
        return this.billingCycle === BILLING_CYCLE.MONTHLY;
    }

    isOneOff(): boolean {
        return this.billingCycle === BILLING_CYCLE.ONEOFF || this.billingCycle === null;
    }

    private getBillingCycle(subscription: components['schemas']['Subscription']): BILLING_CYCLE {
        const billingCycle = Number.parseInt(subscription.billing_cycle?.toString() ?? '', 10);

        if (billingCycle === 1) {
            return BILLING_CYCLE.MONTHLY;
        }

        if (billingCycle === 12) {
            return BILLING_CYCLE.YEARLY;
        }

        return BILLING_CYCLE.ONEOFF;
    }
}
