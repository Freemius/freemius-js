import { PagingOptions } from '../contracts/types';
import { ApiBase } from './ApiBase';
import { EventEntity, EventFilterOptions, FSId } from './types';

export class WebhookEvent extends ApiBase<EventEntity, EventFilterOptions> {
    async retrieve(eventId: FSId) {
        const result = await this.client.GET(`/products/{product_id}/events/{event_id}.json`, {
            params: {
                path: {
                    product_id: this.productId,
                    event_id: this.getIdForPath(eventId),
                },
            },
        });

        if (!this.isGoodResponse(result.response) || !result.data || !result.data.id) {
            return null;
        }

        return result.data;
    }

    async retrieveMany(filter?: EventFilterOptions, pagination?: PagingOptions) {
        const result = await this.client.GET(`/products/{product_id}/events.json`, {
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

        if (!this.isGoodResponse(result.response) || !result.data || !Array.isArray(result.data.events)) {
            return [];
        }

        return result.data.events;
    }
}
