import { PagingOptions } from '../contracts/types';
import { ApiBase } from './ApiBase';
import {
    SubscriptionEntity,
    SubscriptionFilterOptions,
    FSId,
    SubscriptionCancellationReasonType,
    SubscriptionCancellationResult,
    SubscriptionRenewalCouponResult,
} from './types';

export class Subscription extends ApiBase<SubscriptionEntity, SubscriptionFilterOptions> {
    async retrieve(subscriptionId: FSId) {
        const result = await this.client.GET(`/products/{product_id}/subscriptions/{subscription_id}.json`, {
            params: {
                path: {
                    product_id: this.productId,
                    subscription_id: this.getIdForPath(subscriptionId),
                },
            },
        });

        if (!this.isGoodResponse(result.response) || !result.data || !result.data.id) {
            return null;
        }

        return result.data;
    }

    async retrieveMany(filter?: SubscriptionFilterOptions, pagination?: PagingOptions) {
        const result = await this.client.GET(`/products/{product_id}/subscriptions.json`, {
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

        if (!this.isGoodResponse(result.response) || !result.data || !Array.isArray(result.data.subscriptions)) {
            return [];
        }

        return result.data.subscriptions;
    }

    async applyRenewalCoupon(
        subscriptionId: FSId,
        couponId: string,
        logAutoRenew: boolean
    ): Promise<SubscriptionRenewalCouponResult | null> {
        const result = await this.client.PUT(`/products/{product_id}/subscriptions/{subscription_id}.json`, {
            params: {
                path: {
                    product_id: this.productId,
                    subscription_id: this.getIdForPath(subscriptionId),
                },
            },
            body: {
                auto_renew: logAutoRenew,
                coupon_id: Number.parseInt(couponId, 10),
            },
        });

        if (!this.isGoodResponse(result.response) || !result.data || !result.data.id) {
            return null;
        }

        return result.data;
    }

    async cancel(
        subscriptionId: FSId,
        feedback?: string,
        reasonIds?: SubscriptionCancellationReasonType[]
    ): Promise<SubscriptionCancellationResult | null> {
        const result = await this.client.DELETE(`/products/{product_id}/subscriptions/{subscription_id}.json`, {
            params: {
                path: {
                    product_id: this.productId,
                    subscription_id: this.getIdForPath(subscriptionId),
                },
                query: {
                    reason: feedback,
                    reason_ids: reasonIds ?? [],
                },
            },
            querySerializer: this.getQuerySerializerForArray(),
        });

        if (!this.isGoodResponse(result.response) || !result.data || !result.data.id) {
            return null;
        }

        return result.data;
    }
}
