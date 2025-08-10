import { FSId, SubscriptionEntity, UserEntity } from '../api/types';
import { PurchaseInfo } from '../models/PurchaseInfo';
import { PurchaseData } from '../contracts/purchase';
import { ApiService } from './ApiService';
import { PagingOptions } from '../contracts/types';
import { isIdsEqual } from '../api/parser';

export class PurchaseService {
    constructor(private readonly api: ApiService) {}

    /**
     * Retrieve purchase information from the Freemius API based on the license ID.
     *
     * The license is the primary entitlement for a purchase, and it may or may not be associated with a subscription.
     * With this method, you can retrieve detailed information about the purchase, including user details, plan, expiration, and more.
     */
    async retrievePurchase(licenseId: FSId): Promise<PurchaseInfo | null> {
        const [license, subscription] = await Promise.all([
            await this.api.license.retrieve(licenseId),
            await this.api.license.retrieveSubscription(licenseId),
        ]);

        if (!license) {
            return null;
        }

        const user = await this.api.user.retrieve(license.user_id!);

        if (!user) {
            return null;
        }

        return new PurchaseInfo(user, license, subscription);
    }

    /**
     * A helper method to retrieve raw purchase data instead of a full PurchaseInfo object.
     *
     * This is useful when passing data from server to client in frameworks like Next.js, where only serializable data should be sent.
     */
    async retrievePurchaseData(licenseId: FSId): Promise<PurchaseData | null> {
        const purchaseInfo = await this.retrievePurchase(licenseId);

        if (!purchaseInfo) {
            return null;
        }

        return purchaseInfo.toData();
    }

    /**
     * Retrieve a list of active subscriptions for a user. You can use this method to find or sync subscriptions from freemius to your system.
     */
    async retrieveSubscriptions(userId: FSId, pagination?: PagingOptions): Promise<PurchaseInfo[]> {
        const user = await this.api.user.retrieve(userId);

        if (!user) {
            return [];
        }

        const subscriptions = await this.api.user.retrieveSubscriptions(
            userId,
            {
                filter: 'active',
            },
            pagination
        );

        if (!subscriptions || !subscriptions.length) {
            return [];
        }

        // @todo - Improve rate limiting by batching requests or using a more efficient method.
        const licenseSubscriptionPromises = subscriptions.map(async (subscription) => {
            const license = await this.api.license.retrieve(subscription.license_id!);

            if (!license) {
                return null;
            }

            return new PurchaseInfo(user, license, subscription);
        });

        return await Promise.all(licenseSubscriptionPromises).then((results) =>
            results
                // Remove null values and sort by creation date, where the recent purchase is first.
                .filter((result): result is PurchaseInfo => result !== null)
                .sort((a, b) => b.created.getTime() - a.created.getTime())
        );
    }

    /**
     * Retrieve a list of purchase data for a user.
     *
     * This is a convenience method that returns the purchase data in a format suitable for client-side rendering or serialization.
     */
    async retrieveSubscriptionsData(userId: FSId, pagination?: PagingOptions): Promise<PurchaseData[]> {
        const purchaseInfos = await this.retrieveSubscriptions(userId, pagination);

        return purchaseInfos.map((info) => info.toData());
    }

    async retrieveBySubscription(
        subscription: SubscriptionEntity,
        subscriptionUser?: UserEntity
    ): Promise<PurchaseInfo | null> {
        if (!subscription.license_id) {
            return null;
        }

        const license = await this.api.license.retrieve(subscription.license_id);

        if (!license) {
            return null;
        }

        const user =
            subscriptionUser && isIdsEqual(subscriptionUser.id!, license.user_id!)
                ? subscriptionUser
                : await this.api.user.retrieve(license.user_id!);

        if (!user) {
            return null;
        }

        return new PurchaseInfo(user, license, subscription);
    }

    async retrieveActiveSubscriptionByEmail(email: string, pagination?: PagingOptions): Promise<PurchaseInfo[] | null> {
        const user = await this.api.user.retrieveByEmail(email);

        if (!user) {
            return null;
        }

        return await this.retrieveSubscriptions(user.id!, pagination);
    }
}
