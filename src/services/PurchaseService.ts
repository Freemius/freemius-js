import { FsApiClient } from '../api/client';
import { FSId, idToNumber } from '../utils/id';
import { components } from '../api/schema';
import { PurchaseInfo } from '../models/PurchaseInfo';

export class PurchaseService {
    constructor(
        private readonly productId: FSId,
        private readonly apiClient: FsApiClient
    ) {}

    async retrievePurchase(licenseId: FSId): Promise<PurchaseInfo | null> {
        const [license, subscription] = await Promise.all([
            await this.fetchLicense(licenseId),
            await this.fetchSubscription(licenseId),
        ]);

        if (!license) {
            return null;
        }

        const user = await this.fetchUser(license.user_id!);

        if (!user) {
            return null;
        }

        return new PurchaseInfo(user, license, subscription);
    }

    // @todo - Implement
    async retrievePurchasesByEmail(email: string): Promise<PurchaseInfo[]> {
        console.log(email);
        return [];
    }

    private async fetchSubscription(licenseId: FSId): Promise<components['schemas']['Subscription'] | null> {
        const subscriptionResponse = await this.apiClient.GET(
            `/products/{product_id}/licenses/{license_id}/subscription.json`,
            {
                params: {
                    path: {
                        product_id: idToNumber(this.productId),
                        license_id: idToNumber(licenseId),
                    },
                },
            }
        );

        if (
            subscriptionResponse.response.status !== 200 ||
            !subscriptionResponse.data ||
            !subscriptionResponse.data.id
        ) {
            return null;
        }

        return subscriptionResponse.data;
    }

    private async fetchLicense(licenseId: FSId): Promise<components['schemas']['License'] | null> {
        const licenseResponse = await this.apiClient.GET(`/products/{product_id}/licenses/{license_id}.json`, {
            params: {
                path: {
                    product_id: idToNumber(this.productId),
                    license_id: idToNumber(licenseId),
                },
            },
        });

        if (licenseResponse.response.status !== 200 || !licenseResponse.data || !licenseResponse.data.id) {
            return null;
        }

        return licenseResponse.data;
    }

    private async fetchUser(userId: FSId): Promise<components['schemas']['User'] | null> {
        const userResponse = await this.apiClient.GET(`/products/{product_id}/users/{user_id}.json`, {
            params: {
                path: {
                    product_id: idToNumber(this.productId),
                    user_id: idToNumber(userId),
                },
            },
        });

        if (userResponse.response.status !== 200 || !userResponse.data || !userResponse.data.id) {
            return null;
        }

        return userResponse.data;
    }
}
