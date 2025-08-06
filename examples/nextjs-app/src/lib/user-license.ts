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
import { PurchaseInfo } from '@freemius/sdk';
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

    if (!freemiusPurchase.isActive()) {
        throw new RouteError('License is not active', 'license_not_active', 403);
    }

    await processPurchaseInfo(freemiusPurchase);

    return freemiusPurchase;
}

export async function processPurchaseInfo(freemiusPurchase: PurchaseInfo): Promise<void> {
    const user = await prisma.user.findUnique({ where: { email: freemiusPurchase.email } });

    if (!user) {
        return;
    }

    // @note - Check in README.md (Feedback from Dror)
    if (freemiusPurchase.quota && freemiusPurchase.quota > 0) {
        await addCredits(user.id, freemiusPurchase.quota);
    }

    if (freemiusPurchase.isPlan(process.env.NEXT_PUBLIC_FS__PLAN_SUBSCRIPTION!)) {
        await prisma.userLicense.upsert({
            where: {
                userId: user.id,
            },
            update: {
                fsUserId: freemiusPurchase.userId,
                fsPlanId: freemiusPurchase.planId,
                fsLicenseId: freemiusPurchase.licenseId,
                expiration: freemiusPurchase.expiration,
                canceled: freemiusPurchase.canceled,
            },
            create: {
                userId: user.id,
                fsUserId: freemiusPurchase.userId,
                fsPlanId: freemiusPurchase.planId,
                fsLicenseId: freemiusPurchase.licenseId,
                expiration: freemiusPurchase.expiration,
                canceled: freemiusPurchase.canceled,
            },
        });
    }
}
