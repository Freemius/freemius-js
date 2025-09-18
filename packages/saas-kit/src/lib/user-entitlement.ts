/**
 * This file holds a bunch of functions that are used to understand the user's active plan.
 *
 * The implementation will differ based on your SaaS application logic. Here we have kept it very simple:
 *
 * 1. We have a table `UserFsEntitlement` that maps the user to their Freemius plan/license.
 * 2. The table is kept in sync with the Freemius API using webhooks.
 * 3. The user also has a `credits` field that tracks the user's credits.
 */
import { prisma } from '@/lib/prisma';
import { CheckoutRedirectInfo, PurchaseInfo, SubscriptionEntity, UserRetriever } from '@freemius/sdk';
import { UserFsEntitlement, User } from '@generated/prisma';
import { freemius } from './freemius';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

// #region Freemius SDK Supporting Functions for User Entitlements

/**
 * Process the purchase info and update the local database.
 *
 * This function is called when a purchase happens with Freemius.
 */
export async function processPurchaseInfo(fsPurchase: PurchaseInfo): Promise<void> {
    const user = await getUserByEmail(fsPurchase.email);

    if (!user) {
        return;
    }

    const credit = await processEntitlementFromPurchase(user, fsPurchase);

    if (credit > 0) {
        await addCredits(user.id, credit);
    }
}

/**
 * Get the Freemius user for the current session.
 *
 * This is used by the Freemius SDK to identify the user.
 *
 * @returns The Freemius user or null if the user is not logged in.
 */
export const getFsUser: UserRetriever = async () => {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    const entitlement = session ? await getUserEntitlement(session.user.id) : null;
    const email = session?.user.email ?? undefined;

    return freemius.entitlement.getFsUser(entitlement, email);
};

export async function syncEntitlementFromWebhook(fsLicenseId: string): Promise<void> {
    const purchaseInfo = await freemius.purchase.retrievePurchase(fsLicenseId);
    if (purchaseInfo) {
        await processPurchaseInfo(purchaseInfo);
    }
}

export async function renewCreditsFromWebhook(fsLicenseId: string): Promise<void> {
    const purchaseInfo = await freemius.purchase.retrievePurchase(fsLicenseId);

    if (purchaseInfo) {
        const credits = getCreditsForPurchase(purchaseInfo);

        const entitlement = await prisma.userFsEntitlement.findUnique({
            where: { fsLicenseId },
        });

        if (entitlement && credits > 0) {
            await addCredits(entitlement.userId, credits);
        }
    }
}

/**
 * Get the user's entitlement.
 *
 * @returns The user's active entitlement or null if the user does not have an active entitlement.
 */
export async function getUserEntitlement(userId: string): Promise<UserFsEntitlement | null> {
    const entitlements = await prisma.userFsEntitlement.findMany({ where: { userId, type: 'subscription' } });

    return freemius.entitlement.getActive(entitlements);
}

export async function deleteEntitlement(fsLicenseId: string): Promise<void> {
    await prisma.userFsEntitlement.delete({ where: { fsLicenseId: fsLicenseId } });
}

export async function processRedirect(info: CheckoutRedirectInfo): Promise<void> {
    const purchaseInfo = await freemius.purchase.retrievePurchase(info.license_id);

    if (purchaseInfo) {
        await processPurchaseInfo(purchaseInfo);
    }
}

export async function sendRenewalFailureEmail(subscription: SubscriptionEntity): Promise<void> {
    // This is a placeholder for sending an email to the user about the renewal failure.
    // You can use your preferred email service here.
    console.log('Sending renewal failure email for subscription:', subscription);
    // Example: await sendEmailToUser(subscription.user, 'Renewal failed', 'Your subscription renewal has failed.');
}

//#endregion

// #region Credit & Entitlement Management

export async function hasCredits(userId: string, credits: number = 1): Promise<boolean> {
    const creditsAvailable = await getCredits(userId);

    return creditsAvailable >= credits;
}

export async function getCredits(userId: string): Promise<number> {
    const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
    return user.credit;
}

export async function deductCredits(userId: string, credits: number): Promise<User | null> {
    const updatedLicense = await prisma.user.update({
        where: { id: userId },
        data: { credit: { decrement: credits } },
    });

    return updatedLicense;
}

export async function addCredits(userId: string, credits: number): Promise<void> {
    await prisma.user.update({
        where: { id: userId },
        data: { credit: { increment: credits } },
    });
}

const resourceRecord = {
    // Subscription
    starter: 100,
    professional: 200,
    business: 500,

    // Top-ups
    topup_1000: 1000,
    topup_5000: 5000,
    topup_10000: 10000,
} as const;

const pricingToResourceMap: Record<string, keyof typeof resourceRecord> = {
    [process.env.FREEMIUS_PRICING_ID_STARTER!]: 'starter',
    [process.env.FREEMIUS_PRICING_ID_PROFESSIONAL!]: 'professional',
    [process.env.FREEMIUS_PRICING_ID_BUSINESS!]: 'business',
    [process.env.FREEMIUS_PRICING_ID_TOPUP_1000!]: 'topup_1000',
    [process.env.FREEMIUS_PRICING_ID_TOPUP_5000!]: 'topup_5000',
    [process.env.FREEMIUS_PRICING_ID_TOPUP_10000!]: 'topup_10000',
};

function getCreditsForPurchase(fsPurchase: PurchaseInfo): number {
    const credit = resourceRecord[pricingToResourceMap[fsPurchase.pricingId]] ?? 0;

    return fsPurchase.isAnnual() ? credit * 12 : credit;
}

async function processEntitlementFromPurchase(user: User, fsPurchase: PurchaseInfo): Promise<number> {
    let credit = 0;

    const isExisting = await prisma.userFsEntitlement.findUnique({
        where: {
            fsLicenseId: fsPurchase.licenseId,
        },
    });

    if (!isExisting) {
        credit = getCreditsForPurchase(fsPurchase);
    }

    await prisma.userFsEntitlement.upsert({
        where: {
            fsLicenseId: fsPurchase.licenseId,
        },
        update: fsPurchase.toEntitlementRecord(),
        create: fsPurchase.toEntitlementRecord({ userId: user.id }),
    });

    return credit;
}

// #endregion

// Private helpers

export async function getUserByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
}
