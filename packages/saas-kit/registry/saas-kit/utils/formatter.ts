export function formatDate(date: Date | null | string, locale: string = 'en-US', showTime: boolean = true): string {
    if (!date) return 'N/A';

    try {
        return new Date(date).toLocaleString(locale, {
            dateStyle: 'medium',
            timeStyle: showTime ? 'short' : undefined,
            hour12: true,
        });
    } catch {
        return date.toString();
    }
}

export function splitName(name: string): { firstName: string; lastName: string } {
    const parts = name.split(' ');

    return {
        firstName: parts[0] ?? '',
        lastName: parts.slice(1).join(' ') ?? '',
    };
}

export function fullName(first?: string, last?: string): string {
    return [first, last].filter(Boolean).join(' ').trim();
}

export function formatCurrency(
    amount: number,
    currency: string = 'USD',
    locale: string = 'en-US',
    maxFraction = 2
): string {
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency.toUpperCase(),
        maximumFractionDigits: maxFraction,
    }).format(amount);
}

export function formatNumber(value: number, locale: string = 'en-US'): string {
    return new Intl.NumberFormat(locale).format(value);
}
