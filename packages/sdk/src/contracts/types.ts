import { FSId } from '../api/types';

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

export type UserRetriever = () => Promise<
    { id: FSId; primaryLicenseId?: FSId; email?: string } | { email: string } | null
>;

/**
 * @todo - Add a more unified way to get handlers so that we can simplify the Checkout & Customer Portal request processors.
 */
export interface RequestProcessor<Config> {
    createProcessor(config: Config): (request: Request) => Promise<Response>;

    process(config: Config, request: Request): Promise<Response>;
}
