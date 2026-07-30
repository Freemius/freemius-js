import { PagingOptions } from '../contracts/types';
import { ApiBase } from './ApiBase';
import {
    LicenseEntity,
    LicenseFilterOptions,
    SubscriptionEntity,
    FSId,
    LicenseUpdatePayload,
    LicenseCheckoutUpgradePayload,
    LicenseCheckoutUpgradeResult,
} from './types';

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

    async retrieveCheckoutUpgrade(
        licenseId: FSId,
        payload: LicenseCheckoutUpgradePayload = {}
    ): Promise<LicenseCheckoutUpgradeResult | null> {
        const response = await this.client.POST(`/products/{product_id}/licenses/{license_id}/checkout/link.json`, {
            params: {
                path: {
                    product_id: this.productId,
                    license_id: this.getIdForPath(licenseId),
                },
            },
            body: payload,
        });

        if (!this.isGoodResponse(response.response) || !response.data) {
            return null;
        }

        return response.data;
    }

    async retrieveCheckoutUpgradeAuthorization(licenseId: FSId): Promise<string | null> {
        const checkoutUpgrade = await this.retrieveCheckoutUpgrade(licenseId, {
            is_payment_method_update: true,
        });

        if (!checkoutUpgrade?.settings?.authorization) {
            return null;
        }

        return checkoutUpgrade.settings.authorization as string;
    }

    async update(licenseId: FSId, updateData: LicenseUpdatePayload): Promise<LicenseEntity | null> {
        const response = await this.client.PUT(`/products/{product_id}/licenses/{license_id}.json`, {
            params: {
                path: {
                    license_id: this.getIdForPath(licenseId),
                    product_id: this.productId,
                },
            },
            body: updateData,
        });

        if (!this.isGoodResponse(response.response) || !response.data || !response.data.id) {
            return null;
        }

        return response.data;
    }
}
