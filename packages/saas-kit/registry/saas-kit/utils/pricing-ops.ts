import { PricingEntity } from '@freemius/sdk';

export function findClosestPricing<T extends PricingEntity>(
    pricings: T[] | null | undefined,
    quota: number | null
): T | null {
    if (!quota || !pricings || pricings.length === 0) {
        return pricings?.[0] ?? null;
    }

    // Find the pricing that has the least difference from the quota
    let closest: T | null = null;
    let minDiff = Infinity;
    for (const pricing of pricings) {
        if (pricing.licenses == null) {
            continue; // Skip if licenses is not defined (just sanity check)
        }

        const diff = Math.abs(pricing.licenses - quota);

        if (diff < minDiff) {
            minDiff = diff;
            closest = pricing;
        }
    }

    return closest ?? pricings[0] ?? null;
}
