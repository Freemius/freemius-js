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

/**
 * Process the purchase info and update the local database.
 *
 * This function is called when a purchase happens with Freemius.
 */
export async function processPurchaseInfo(fsPurchase: PurchaseInfo): Promise<void> {
    const user = await prisma.user.findUnique({ where: { email: fsPurchase.email } });

    if (!user) {
        // We can also register the user here if needed.
        console.warn(`User with email ${fsPurchase.email} not found. Cannot process purchase.`);
        return;
    }

    await processEntitlementFromPurchase(user, fsPurchase);

    await processCreditFromPurchase(user, fsPurchase);
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

export async function syncLicenseFromWebhook(fsLicenseId: string): Promise<void> {
    const purchaseInfo = await freemius.purchase.retrievePurchase(fsLicenseId);
    if (purchaseInfo) {
        await processPurchaseInfo(purchaseInfo);
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

export async function hasCredits(userId: string, credits: number = 1): Promise<boolean> {
    const creditsAvailable = await getCredits(userId);

    return creditsAvailable >= credits;
}

export async function getCredits(userId: string): Promise<number> {
    const entitlement = await getUserEntitlement(userId);

    // Make sure the user has been given a credit based on their entitlement subscription.
    if (entitlement) {
        await addCredits(userId, getSubscriptionCredit(entitlement.fsPlanId), entitlement);
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
        return 0;
    }

    return user.credit;
}

export async function deductCredits(userId: string, credits: number): Promise<User | null> {
    const updatedLicense = await prisma.user.update({
        where: { id: userId },
        data: { credit: { decrement: credits } },
    });

    return updatedLicense;
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

// Private helpers

async function addCredits(userId: string, credits: number, entitlement: UserFsEntitlement): Promise<void> {
    // Do the operation in a transaction to make sure it's atomic.
    await prisma.$transaction(async (tx) => {
        const creditCycle =
            entitlement.type === 'subscription' ? freemius.entitlement.getElapsedMonth(entitlement) : -1;

        try {
            // Insert the credit log entry
            await tx.creditLog.create({
                data: {
                    userId: userId,
                    fsLicenseId: entitlement.fsLicenseId,
                    credits: credits,
                    creditCycle: creditCycle,
                },
            });

            // Update the user's credit
            await tx.user.update({
                where: { id: userId },
                data: { credit: { increment: credits } },
            });
        } catch {
            // If unique constraint fails, it means the credit has already been processed.
        }
    });
}

const subscriptionEntitlementMap = new Map<string, number>();
subscriptionEntitlementMap.set(process.env.STARTER_PLAN_ID!, 100);
subscriptionEntitlementMap.set(process.env.PROFESSIONAL_PLAN_ID!, 200);
subscriptionEntitlementMap.set(process.env.BUSINESS_PLAN_ID!, 500);
function getSubscriptionCredit(planId: string): number {
    return subscriptionEntitlementMap.get(planId) ?? 0;
}

async function processEntitlementFromPurchase(user: User, fsPurchase: PurchaseInfo): Promise<void> {
    await prisma.userFsEntitlement.upsert({
        where: {
            fsLicenseId: fsPurchase.licenseId,
        },
        update: fsPurchase.toEntitlement(),
        create: fsPurchase.toEntitlement({ userId: user.id }),
    });
}

async function processCreditFromPurchase(user: User, fsPurchase: PurchaseInfo): Promise<void> {
    let credits: number = 0;

    if (fsPurchase.isSubscription()) {
        // If this is a subscription we get the entitlement from the plan ID.
        credits = getSubscriptionCredit(fsPurchase.planId) ?? 0;
    } else {
        // Else we can leverage the quota from the license directly as provided by Freemius.
        // @note - In the future we will enrich more entitlement in the fsPurchase and from the system.
        credits = fsPurchase.quota ?? 0;
    }

    await addCredits(user.id, credits, fsPurchase.toEntitlement());
}
