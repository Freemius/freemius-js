import { PagingOptions } from '../contracts/types';
import { ApiBase } from './ApiBase';
import { SubscriptionEntity, SubscriptionFilterOptions, FSId } from './types';

export class Subscription extends ApiBase<SubscriptionEntity, SubscriptionFilterOptions> {
    async retrieve(subscriptionId: FSId) {
        const response = await this.client.GET(`/products/{product_id}/subscriptions/{subscription_id}.json`, {
            params: {
                path: {
                    product_id: this.productId,
                    subscription_id: this.getIdForPath(subscriptionId),
                },
            },
        });

        if (response.response.status !== 200 || !response.data || !response.data.id) {
            return null;
        }

        return response.data;
    }

    async retrieveMany(filter?: SubscriptionFilterOptions, pagination?: PagingOptions) {
        const response = await this.client.GET(`/products/{product_id}/subscriptions.json`, {
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

        if (response.response.status !== 200 || !response.data || !Array.isArray(response.data.subscriptions)) {
            return [];
        }

        return response.data.subscriptions;
    }
}
