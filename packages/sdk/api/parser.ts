import { BillingCycleApiEnum, CurrencyApiEnum, FSId } from './types';
import { BILLING_CYCLE, CURRENCY, PaymentMethod } from '../contracts/types';

export function idToNumber(id: FSId): number {
    if (typeof id === 'number') {
        return id;
    } else if (typeof id === 'bigint') {
        return Number(id);
    } else if (typeof id === 'string') {
        const parsed = Number.parseInt(id, 10);

        if (Number.isNaN(parsed)) {
            throw new Error(`Invalid FSId: ${id}`);
        }

        return parsed;
    } else {
        throw new Error(`Unsupported FSId type: ${typeof id}`);
    }
}

export function idToString(id: FSId): string {
    if (typeof id === 'string') {
        return id;
    } else if (typeof id === 'number' || typeof id === 'bigint') {
        return String(id);
    } else {
        throw new Error(`Unsupported FSId type: ${typeof id}`);
    }
}

export function isIdsEqual(id1: FSId, id2: FSId): boolean {
    return idToString(id1) === idToString(id2);
}

export function parseBillingCycle(cycle?: BillingCycleApiEnum): BILLING_CYCLE {
    const billingCycle = Number.parseInt(cycle?.toString() ?? '', 10);

    if (billingCycle === 1) {
        return BILLING_CYCLE.MONTHLY;
    }

    if (billingCycle === 12) {
        return BILLING_CYCLE.YEARLY;
    }

    return BILLING_CYCLE.ONEOFF;
}

export function parseNumber(value: unknown): number | null {
    if (typeof value === 'number') {
        return value;
    } else if (typeof value === 'string') {
        const parsed = Number.parseFloat(value);
        return Number.isNaN(parsed) ? null : parsed;
    } else {
        return null;
    }
}

export function parseDateTime(dateString?: string | null): Date | null {
    if (!dateString) {
        return null;
    }

    // Freemius date format is "YYYY-MM-DD HH:mm:ss" in UTC
    const dateParts = dateString.split(' ');
    if (dateParts.length !== 2) {
        return null;
    }

    const date = dateParts[0]!.split('-');
    const time = dateParts[1]!.split(':');
    if (date.length !== 3 || time.length !== 3) {
        return null;
    }

    const year = Number.parseInt(date[0]!);
    const month = Number.parseInt(date[1]!) - 1; // Months are zero-based
    const day = Number.parseInt(date[2]!);
    const hours = Number.parseInt(time[0]!);
    const minutes = Number.parseInt(time[1]!);
    const seconds = Number.parseInt(time[2]!);

    if (
        Number.isNaN(year) ||
        Number.isNaN(month) ||
        Number.isNaN(day) ||
        Number.isNaN(hours) ||
        Number.isNaN(minutes) ||
        Number.isNaN(seconds)
    ) {
        return null;
    }

    const utcDate = new Date(Date.UTC(year, month, day, hours, minutes, seconds, 0));

    return utcDate;
}

export function parseDate(dateString?: string | null): Date | null {
    if (!dateString) {
        return null;
    }

    // Freemius date format is "YYYY-MM-DD"
    return parseDateTime(dateString + ' 00:00:00');
}

export function parseCurrency(currency?: CurrencyApiEnum): CURRENCY | null {
    switch (currency?.toLowerCase?.()) {
        case 'usd':
            return CURRENCY.USD;
        case 'eur':
            return CURRENCY.EUR;
        case 'gbp':
            return CURRENCY.GBP;
        default:
            return null;
    }
}

export function parsePaymentMethod(gateway?: string | null): PaymentMethod | null {
    return gateway?.startsWith('stripe') ? 'card' : gateway?.startsWith('paypal') ? 'paypal' : null;
}
