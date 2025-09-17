import { parseDateTime } from '../api/parser';
import { PurchaseEntitlementData } from '../contracts/purchase';
import { UserRetriever } from '../contracts/types';

export class EntitlementService {
    /**
     * Get the active subscription entitlement from a list of entitlements stored in your own database.
     *
     * @param entitlements - Array of entitlements to filter
     * @returns The single active entitlement, or null if none found
     * @throws Error if multiple active entitlements are found
     */
    getActive<T extends PurchaseEntitlementData>(entitlements: T[] | null): T | null {
        const activeEntitlements = this.getActives(entitlements);

        if (!activeEntitlements || activeEntitlements.length === 0) {
            return null;
        }

        if (activeEntitlements.length > 1) {
            throw new Error(`Multiple active entitlements found: ${activeEntitlements.length} entitlements are active`);
        }

        return activeEntitlements[0]!;
    }

    /**
     * Get all active subscription entitlements from a list of entitlements stored in your own database.
     *
     * @param entitlements - Array of entitlements to filter
     * @returns Array of active entitlements, or null if none found
     */
    getActives<T extends PurchaseEntitlementData>(entitlements: T[] | null): T[] | null {
        if (!entitlements || entitlements.length === 0) {
            return null;
        }

        const activeEntitlements = entitlements.filter((entitlement) => {
            if (entitlement.type !== 'subscription') {
                return false;
            }

            if (entitlement.isCanceled) {
                return false;
            }

            if (entitlement.expiration === null) {
                return true;
            }

            const expiration =
                entitlement.expiration instanceof Date ? entitlement.expiration : parseDateTime(entitlement.expiration);

            if (expiration && expiration < new Date()) {
                return false;
            }

            return true;
        });

        return activeEntitlements.length > 0 ? activeEntitlements : null;
    }

    getFsUser(entitlement: PurchaseEntitlementData | null, email?: string): Awaited<ReturnType<UserRetriever>> {
        if (entitlement) {
            return {
                email,
                id: entitlement.fsUserId,
                primaryLicenseId: entitlement.fsLicenseId,
            } as Awaited<ReturnType<UserRetriever>>;
        }

        return email ? { email } : null;
    }

    /**
     * Calculates the number of complete months elapsed since the entitlement subscription was created.
     *
     * @param entitlement - The entitlement to check
     * @returns Number of complete months elapsed, or -1 if entitlement is null
     */
    getElapsedMonth(entitlement: PurchaseEntitlementData | null): number {
        if (!entitlement) {
            return -1;
        }

        const created =
            entitlement.createdAt instanceof Date ? entitlement.createdAt : parseDateTime(entitlement.createdAt);

        if (!created) {
            return -1;
        }

        const now = new Date();

        let months = (now.getFullYear() - created.getFullYear()) * 12 + (now.getMonth() - created.getMonth());

        // Adjust if current day is before the created day
        if (now.getDate() < created.getDate()) {
            months -= 1;
        }

        return months;
    }

    /**
     * Calculates the number of complete years elapsed since the entitlement subscription was created.
     *
     * @param entitlement - The entitlement to check
     * @returns Number of complete years elapsed, or -1 if entitlement is null
     */
    getElapsedYear(entitlement: PurchaseEntitlementData | null): number {
        if (!entitlement) {
            return -1;
        }

        const created =
            entitlement.createdAt instanceof Date ? entitlement.createdAt : parseDateTime(entitlement.createdAt);

        if (!created) {
            return -1;
        }

        const now = new Date();

        let years = now.getFullYear() - created.getFullYear();

        // Adjust if current month/day is before the created month/day
        if (
            now.getMonth() < created.getMonth() ||
            (now.getMonth() === created.getMonth() && now.getDate() < created.getDate())
        ) {
            years -= 1;
        }

        return years;
    }
}
