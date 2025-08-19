/**
 * This file holds all generic types used across the SDK, not specific to any contract.
 */
export enum BILLING_CYCLE {
    MONTHLY = 'monthly',
    YEARLY = 'yearly',
    ONEOFF = 'oneoff',
}

export interface PagingOptions {
    count?: number;
    offset?: number;
}

export type ApiEntitiesFilter<T> = Omit<NonNullable<T>, 'count' | 'offset'>;

export enum CURRENCY {
    USD = 'USD',
    EUR = 'EUR',
    GBP = 'GBP',
}

export type PaymentMethod = 'card' | 'paypal' | 'ideal';
