import { ApiBase } from './ApiBase';
import { ProductEntity, PricingTableData } from './types';

export class Product extends ApiBase<ProductEntity, never> {
    async retrieve(): Promise<ProductEntity | null> {
        const response = await this.client.GET(`/products/{product_id}.json`, {
            params: {
                path: {
                    product_id: this.productId,
                },
            },
        });

        if (response.response.status !== 200 || !response.data) {
            return null;
        }

        return response.data;
    }

    async retrieveMany(): Promise<ProductEntity[]> {
        throw new Error('retrieveMany is not supported for Product API');
    }

    async retrievePricingData(): Promise<PricingTableData | null> {
        const response = await this.client.GET(`/products/{product_id}/pricing.json`, {
            params: {
                path: {
                    product_id: this.productId,
                },
            },
        });

        if (response.response.status !== 200 || !response.data) {
            return null;
        }

        return response.data;
    }
}
