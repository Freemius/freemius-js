import { BILLING_CYCLE, CURRENCY } from '../contracts/types';
import {
    parseBillingCycle,
    parseNumber,
    idToString,
    isIdsEqual,
    parseDateTime,
    parseCurrency,
    parsePaymentMethod,
} from '../api/parser';
import { PurchaseData } from '../contracts/purchase';
import { PricingTableData, FSId, UserEntity, LicenseEntity, SubscriptionEntity } from '../api/types';

export class PurchaseInfo implements PurchaseData {
    readonly email: string;
    readonly firstName: string;
    readonly lastName: string;
    readonly userId: string;
    readonly planId: string;
    readonly pricingId: string;
    readonly licenseId: string;
    readonly expiration: Date | null;
    readonly canceled: boolean;
    readonly subscriptionId: string | null;
    readonly billingCycle: BILLING_CYCLE | null;
    readonly quota: number | null;
    readonly initialAmount: number | null;
    readonly renewalAmount: number | null;
    readonly currency: CURRENCY | null;
    readonly renewalDate: Date | null;
    readonly paymentMethod: 'card' | 'paypal' | 'ideal' | null;
    readonly created: Date;

    constructor(user: UserEntity, license: LicenseEntity, subscription: SubscriptionEntity | null) {
        this.email = user.email!;
        this.firstName = user.first ?? '';
        this.lastName = user.last ?? '';
        this.userId = idToString(license.user_id!);
        this.canceled = license.is_cancelled ?? false;
        this.expiration = license.expiration ? parseDateTime(license.expiration) : null;
        this.licenseId = idToString(license.id!);
        this.planId = idToString(license.plan_id!);
        this.subscriptionId = null;
        this.billingCycle = null;
        this.quota = license.quota ?? null;
        this.pricingId = idToString(license.pricing_id!);
        this.initialAmount = null;
        this.renewalAmount = null;
        this.currency = null;
        this.renewalDate = null;
        this.paymentMethod = null;
        this.created = parseDateTime(license.created) ?? new Date();

        if (subscription) {
            this.subscriptionId = idToString(subscription.id!);
            this.billingCycle = parseBillingCycle(subscription.billing_cycle);
            this.initialAmount = parseNumber(subscription.initial_amount);
            this.renewalAmount = parseNumber(subscription.renewal_amount);
            this.currency = parseCurrency(subscription.currency);
            this.renewalDate = subscription.next_payment ? parseDateTime(subscription.next_payment) : null;
            this.paymentMethod = parsePaymentMethod(subscription.gateway);
        }
    }

    isPlan(planId: FSId): boolean {
        return this.planId === idToString(planId);
    }

    isFromPlans(planIds: FSId[]): boolean {
        return planIds.some((planId) => this.isPlan(planId));
    }

    toData(): PurchaseData {
        return {
            email: this.email,
            firstName: this.firstName,
            lastName: this.lastName,
            userId: this.userId,
            planId: this.planId,
            pricingId: this.pricingId,
            licenseId: this.licenseId,
            expiration: this.expiration,
            canceled: this.canceled,
            subscriptionId: this.subscriptionId,
            billingCycle: this.billingCycle,
            quota: this.quota,
            isActive: this.isActive,
            initialAmount: this.initialAmount,
            renewalAmount: this.renewalAmount,
            currency: this.currency,
            renewalDate: this.renewalDate,
            paymentMethod: this.paymentMethod,
            created: this.created,
        };
    }

    get isActive(): boolean {
        if (this.canceled) {
            return false;
        }

        if (this.expiration && this.expiration < new Date()) {
            return false;
        }

        return true;
    }

    hasSubscription(): boolean {
        return this.subscriptionId !== null;
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

    getPlanTitle(pricingData: PricingTableData | null): string {
        const plan = pricingData?.plans?.find((p) => isIdsEqual(p.id!, this.planId));

        return plan?.title ?? plan?.name ?? 'Deleted Plan';
    }
}
