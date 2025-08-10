import { PagingOptions } from '../contracts/types';
import { ApiBase } from './ApiBase';
import {
    LicenseEntity,
    PaymentEntity,
    SubscriptionEntity,
    UserBillingEntity,
    UserEntity,
    UserFilterOptions,
    FSId,
    UserSubscriptionFilterOptions,
    UserLicenseFilterOptions,
    UserPaymentFilterOptions,
} from './types';

const USER_FIELDS = 'email,first,last,picture,is_verified,id,created,updated,is_marketing_allowed';

export class User extends ApiBase<UserEntity, UserFilterOptions> {
    async retrieve(userId: FSId) {
        const userResponse = await this.client.GET(`/products/{product_id}/users/{user_id}.json`, {
            params: {
                path: {
                    product_id: this.productId,
                    user_id: this.getIdForPath(userId),
                },
                query: {
                    fields: USER_FIELDS,
                },
            },
        });

        if (userResponse.response.status !== 200 || !userResponse.data || !userResponse.data.id) {
            return null;
        }

        return userResponse.data;
    }

    async retrieveMany(filter?: UserFilterOptions, pagination?: PagingOptions) {
        const response = await this.client.GET(`/products/{product_id}/users.json`, {
            params: {
                path: {
                    product_id: this.productId,
                },
                query: {
                    ...this.getPagingParams(pagination),
                    ...(filter ?? {}),
                    fields: USER_FIELDS,
                },
            },
        });

        if (response.response.status !== 200 || !response.data || !Array.isArray(response.data.users)) {
            return [];
        }

        return response.data.users;
    }

    async retrieveByEmail(email: string): Promise<UserEntity | null> {
        const response = await this.client.GET(`/products/{product_id}/users.json`, {
            params: {
                path: {
                    product_id: this.productId,
                },
                query: {
                    email,
                },
            },
        });

        if (!this.isGoodResponse(response.response) || !Array.isArray(response.data?.users)) {
            return null;
        }

        return response.data.users?.[0] ?? null;
    }

    async retrieveBilling(userId: FSId): Promise<UserBillingEntity | null> {
        const billingResponse = await this.client.GET(`/products/{product_id}/users/{user_id}/billing.json`, {
            params: {
                path: {
                    product_id: this.productId,
                    user_id: this.getIdForPath(userId),
                },
            },
        });

        if (billingResponse.response.status !== 200 || !billingResponse.data || !billingResponse.data) {
            return null;
        }

        return billingResponse.data;
    }

    async retrieveSubscriptions(
        userId: FSId,
        filters?: UserSubscriptionFilterOptions,
        pagination?: PagingOptions
    ): Promise<SubscriptionEntity[]> {
        const response = await this.client.GET(`/products/{product_id}/users/{user_id}/subscriptions.json`, {
            params: {
                path: {
                    product_id: this.productId,
                    user_id: this.getIdForPath(userId),
                },
                query: {
                    ...(filters ?? {}),
                    ...this.getPagingParams(pagination),
                },
            },
        });

        if (response.response.status !== 200 || !response.data || !Array.isArray(response.data.subscriptions)) {
            return [];
        }

        return response.data.subscriptions;
    }

    async retrieveLicenses(
        userId: FSId,
        filters?: UserLicenseFilterOptions,
        pagination?: PagingOptions
    ): Promise<LicenseEntity[]> {
        const response = await this.client.GET(`/products/{product_id}/users/{user_id}/licenses.json`, {
            params: {
                path: {
                    product_id: this.productId,
                    user_id: this.getIdForPath(userId),
                },
                query: {
                    ...(filters ?? {}),
                    ...this.getPagingParams(pagination),
                },
            },
        });

        if (response.response.status !== 200 || !response.data || !Array.isArray(response.data.licenses)) {
            return [];
        }

        return response.data.licenses;
    }

    async retrievePayments(
        userId: FSId,
        filters?: UserPaymentFilterOptions,
        pagination?: PagingOptions
    ): Promise<PaymentEntity[]> {
        const response = await this.client.GET(`/products/{product_id}/users/{user_id}/payments.json`, {
            params: {
                path: {
                    product_id: this.productId,
                    user_id: this.getIdForPath(userId),
                },
                query: {
                    ...(filters ?? {}),
                    ...this.getPagingParams(pagination),
                },
            },
        });

        if (response.response.status !== 200 || !response.data || !Array.isArray(response.data.payments)) {
            return [];
        }

        return response.data.payments;
    }
}
