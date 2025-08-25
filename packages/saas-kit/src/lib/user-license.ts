/**
 * This file holds a bunch of functions that are used to understand the user's active plan.
 *
 * The implementation will differ based on your SaaS application logic. Here we have kept it very simple:
 *
 * 1. We have a table `UserLicense` that maps the user to their Freemius plan/license.
 * 2. The table is kept in sync with the Freemius API using webhooks.
 * 3. The user also has a `credits` field that tracks the user's credits.
 *
 * The `use server` directive is just there in case you want to call these functions directly from a react component.
 */
'use server';

import { prisma } from '@/lib/prisma';
import {
    CheckoutRedirectInfo,
    LicenseEntity,
    PurchaseInfo,
    SubscriptionEntity,
    UserEmailRetriever,
    UserRetriever,
} from '@freemius/sdk';
import { UserLicense, User } from '@generated/prisma';
import { freemius } from './freemius';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

/**
 * Get the user's active license.
 *
 * @returns The user's active license or null if the user does not have an active license.
 */
export async function getLicense(userId: string): Promise<UserLicense | null> {
    const userLicense = await prisma.userLicense.findUnique({ where: { userId } });

    if (!userLicense) {
        return null;
    }

    if (userLicense.canceled) {
        return null;
    }

    if (userLicense.expiration && userLicense.expiration < new Date()) {
        return null;
    }

    return userLicense;
}

export async function hasCredits(userId: string, credits: number = 1): Promise<boolean> {
    const creditsAvailable = await getCredits(userId);

    return creditsAvailable >= credits;
}

export async function getCredits(userId: string): Promise<number> {
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

export async function addCredits(userId: string, credits: number): Promise<User | null> {
    const updatedLicense = await prisma.user.update({
        where: { id: userId },
        data: { credit: { increment: credits } },
    });

    return updatedLicense;
}

export async function processPurchases(purchases: PurchaseInfo[]): Promise<void> {
    for (const purchase of purchases) {
        await processPurchaseInfo(purchase);
    }
}

export async function processRedirect(info: CheckoutRedirectInfo): Promise<void> {
    const purchaseInfo = await freemius.purchase.retrievePurchase(info.license_id);

    if (purchaseInfo) {
        await processPurchaseInfo(purchaseInfo);
    }
}

export async function processPurchaseInfo(fsPurchase: PurchaseInfo): Promise<void> {
    const user = await prisma.user.findUnique({ where: { email: fsPurchase.email } });

    if (!user) {
        // We can also register the user here if needed.
        console.warn(`User with email ${fsPurchase.email} not found. Cannot process purchase.`);
        return;
    }

    // If the purchase is from a subscription then we update the local userLicense table.
    // Freemius guarantees that there is only one active subscription per user. (This can be configured in Freemius dashboard).
    const allSubscriptionPlans = process.env.NEXT_PUBLIC_FS_PLAN_ALL_SUBSCRIPTIONS?.split(',') ?? [
        process.env.NEXT_PUBLIC_FS__PLAN_SUBSCRIPTION!,
    ];

    if (fsPurchase.isFromPlans(allSubscriptionPlans)) {
        await prisma.userLicense.upsert({
            where: {
                userId: user.id,
            },
            update: fsPurchase.toDBData(),
            create: fsPurchase.toDBData({ userId: user.id }),
        });
    }

    // Now add the credits if not already added.
    if ((fsPurchase.quota ?? 0) > 0) {
        const existingCreditPurchase = await prisma.userCreditPurchase.findUnique({
            where: { fsLicenseId: fsPurchase.licenseId },
        });

        if (!existingCreditPurchase) {
            // Better do the operations in a transaction.
            prisma.$transaction(async (prisma) => {
                await prisma.userCreditPurchase.create({
                    data: fsPurchase.toCreditData({ userId: user.id }),
                });

                const updatedLicense = await prisma.user.update({
                    where: { id: user.id },
                    data: { credit: { increment: fsPurchase.credit ?? 0 } },
                });

                return updatedLicense;
            });
        }
    }
}

export async function syncLicenseFromWebhook(fsLicense: LicenseEntity): Promise<void> {
    const purchaseInfo = await freemius.purchase.retrievePurchase(fsLicense.id!);
    if (purchaseInfo) {
        await processPurchaseInfo(purchaseInfo);
    }
}

export async function deleteLicense(fsLicenseId: string): Promise<void> {
    await prisma.userLicense.delete({ where: { fsLicenseId: fsLicenseId } });
}

export async function sendRenewalFailureEmail(subscription: SubscriptionEntity): Promise<void> {
    // This is a placeholder for sending an email to the user about the renewal failure.
    // You can use your preferred email service here.
    console.log('Sending renewal failure email for subscription:', subscription);
    // Example: await sendEmailToUser(subscription.user, 'Renewal failed', 'Your subscription renewal has failed.');
}

export const getUser: UserRetriever = async () => {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    const license = session ? await getLicense(session.user.id) : null;

    if (license) {
        return { id: license.fsUserId, primaryLicenseId: license.fsLicenseId };
    }

    return null;
};

export const getUserEmail: UserEmailRetriever = async () => {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (session?.user?.email) {
        return { email: session.user.email };
    }

    return null;
};
