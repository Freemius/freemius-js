import { PagingOptions } from '../contracts/types';
import { ApiBase } from './ApiBase';
import { LicenseEntity, LicenseFilterOptions, SubscriptionEntity, FSId } from './types';

export class License extends ApiBase<LicenseEntity, LicenseFilterOptions> {
    async retrieve(licenseId: FSId) {
        const licenseResponse = await this.client.GET(`/products/{product_id}/licenses/{license_id}.json`, {
            params: {
                path: {
                    product_id: this.productId,
                    license_id: this.getIdForPath(licenseId),
                },
            },
        });

        if (!this.isGoodResponse(licenseResponse.response) || !licenseResponse.data || !licenseResponse.data.id) {
            return null;
        }

        return licenseResponse.data;
    }

    async retrieveMany(filter?: LicenseFilterOptions, pagination?: PagingOptions) {
        const response = await this.client.GET(`/products/{product_id}/licenses.json`, {
            params: {
                path: {
                    product_id: this.productId,
                },
                query: {
                    ...this.getPagingParams(pagination),
                    ...(filter ?? {}),
                },
            },
        });

        if (!this.isGoodResponse(response.response) || !response.data || !Array.isArray(response.data.licenses)) {
            return [];
        }

        return response.data.licenses;
    }

    async retrieveSubscription(licenseId: FSId): Promise<SubscriptionEntity | null> {
        const subscriptionResponse = await this.client.GET(
            `/products/{product_id}/licenses/{license_id}/subscription.json`,
            {
                params: {
                    path: {
                        product_id: this.productId,
                        license_id: this.getIdForPath(licenseId),
                    },
                },
            }
        );

        if (
            !this.isGoodResponse(subscriptionResponse.response) ||
            !subscriptionResponse.data ||
            !subscriptionResponse.data.id
        ) {
            return null;
        }

        return subscriptionResponse.data;
    }

    async retrieveCheckoutUpgradeAuthorization(licenseId: FSId): Promise<string | null> {
        const response = await this.client.POST(`/products/{product_id}/licenses/{license_id}/checkout/link.json`, {
            params: {
                path: {
                    product_id: this.productId,
                    license_id: this.getIdForPath(licenseId),
                },
            },
            body: {
                is_payment_method_update: true,
            },
        });

        if (!this.isGoodResponse(response.response) || !response.data || !response.data.settings) {
            return null;
        }

        return response.data.settings.authorization as string;
    }
}
