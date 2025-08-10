/**
 * This file holds a bunch of functions that are used to understand the user's active plan.
 *
 * The implementation will differ based on your SaaS application logic. Here we have kept it very simple:
 *
 * 1. We have a table `UserLicense` that maps the user to their Freemius plan/license.
 * 2. The table is kept in sync with the Freemius API using webhooks.
 * 3. The user also has a `credits` field that tracks the user's credits.
 */
'use server';

import { prisma } from '@/lib/prisma';
import { LicenseEntity, parseDateTime, PurchaseInfo, SubscriptionEntity } from '@freemius/sdk';
import { UserLicense, User } from '@generated/prisma';
import { freemius } from './freemius';
import { RouteError } from './route-error';

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
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
        return false;
    }

    return user.credit >= credits;
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

export async function authenticateAndGetFreemiusPurchase(fsLicenseId: string): Promise<PurchaseInfo> {
    const freemiusPurchase = await freemius.purchase.retrievePurchase(fsLicenseId);

    if (!freemiusPurchase) {
        throw new RouteError('License not found or does not belong to the user', 'license_not_found', 404);
    }

    if (!freemiusPurchase.isActive) {
        throw new RouteError('License is not active', 'license_not_active', 403);
    }

    await processPurchaseInfo(freemiusPurchase);

    return freemiusPurchase;
}

export async function processPurchaseInfo(fsPurchase: PurchaseInfo): Promise<void> {
    const user = await prisma.user.findUnique({ where: { email: fsPurchase.email } });

    if (!user) {
        // We can also register the user here if needed.
        console.warn(`User with email ${fsPurchase.email} not found. Cannot process purchase.`);
        return;
    }

    const existingLicense = await getLicense(user.id);

    // If license already exists and the current purchase info is from the same license and plan, don't add the credit
    if (
        !existingLicense ||
        existingLicense.fsLicenseId !== fsPurchase.licenseId ||
        existingLicense.fsUserId !== fsPurchase.userId ||
        existingLicense.fsPlanId !== fsPurchase.planId
    ) {
        if (fsPurchase.quota && fsPurchase.quota > 0) {
            // Add credits only if the purchase has a quota
            await addCredits(user.id, fsPurchase.quota);

            console.log(`Added ${fsPurchase.quota} credits to user ${user.id} for purchase ${fsPurchase.licenseId}`);
        } else {
            console.log(`No credits added for user ${user.id} for purchase ${fsPurchase.licenseId} as it has no quota`);
        }
    } else {
        console.log(`User ${user.id} already has an active license for purchase ${fsPurchase.licenseId}`);
    }

    // There could still be manual updates to the license, so process the expiration.
    const allSubscriptionPlans = process.env.NEXT_PUBLIC_FS_PLAN_ALL_SUBSCRIPTIONS?.split(',') ?? [
        process.env.NEXT_PUBLIC_FS__PLAN_SUBSCRIPTION!,
    ];

    if (fsPurchase.isFromPlans(allSubscriptionPlans)) {
        await prisma.userLicense.upsert({
            where: {
                userId: user.id,
            },
            update: {
                fsUserId: fsPurchase.userId,
                fsPlanId: fsPurchase.planId,
                fsLicenseId: fsPurchase.licenseId,
                expiration: fsPurchase.expiration,
                canceled: fsPurchase.canceled,
            },
            create: {
                userId: user.id,
                fsUserId: fsPurchase.userId,
                fsPlanId: fsPurchase.planId,
                fsLicenseId: fsPurchase.licenseId,
                expiration: fsPurchase.expiration,
                canceled: fsPurchase.canceled,
            },
        });
    }
}

export async function syncLicenseFromWebhook(fsLicense: LicenseEntity): Promise<void> {
    const userLicense = await prisma.userLicense.findUnique({ where: { fsLicenseId: fsLicense.id } });

    // Process if this is a new purchase.
    if (!userLicense) {
        const purchaseInfo = await freemius.purchase.retrievePurchase(fsLicense.id!);
        if (purchaseInfo) {
            await processPurchaseInfo(purchaseInfo);
        }

        return;
    }

    // Synchronize the existing license with the Freemius data.
    await prisma.userLicense.update({
        where: { id: userLicense.id },
        data: {
            fsUserId: fsLicense.user_id!,
            fsPlanId: fsLicense.plan_id!,
            fsLicenseId: fsLicense.id!,
            expiration: parseDateTime(fsLicense.expiration),
            canceled: fsLicense.is_cancelled ?? false,
        },
    });
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

export async function syncLicenseByEmail(email: string): Promise<PurchaseInfo | null> {
    const purchases = await freemius.purchase.retrieveActiveSubscriptionByEmail(email, { count: 1 });

    if (!purchases || purchases.length === 0) {
        return null;
    }

    const purchaseInfo = purchases[0]!;

    await processPurchaseInfo(purchaseInfo);

    return purchaseInfo;
}
