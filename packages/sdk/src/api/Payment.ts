import { PagingOptions } from '../contracts/types';
import { ApiBase } from './ApiBase';
import { FSId, PaymentEntity, PaymentFilterOptions } from './types';

export class Payment extends ApiBase<PaymentEntity, PaymentFilterOptions> {
    async retrieve(paymentId: FSId): Promise<PaymentEntity | null> {
        const response = await this.client.GET(`/products/{product_id}/payments/{payment_id}.json`, {
            params: {
                path: {
                    product_id: this.productId,
                    payment_id: this.getIdForPath(paymentId),
                },
            },
        });

        if (!this.isGoodResponse(response.response) || !response.data || !response.data.id) {
            return null;
        }

        return response.data;
    }

    async retrieveMany(filter?: PaymentFilterOptions, pagination?: PagingOptions) {
        const response = await this.client.GET(`/products/{product_id}/payments.json`, {
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

        if (!this.isGoodResponse(response.response) || !response.data || !Array.isArray(response.data.payments)) {
            return [];
        }

        return response.data.payments;
    }

    async retrieveInvoice(paymentId: FSId) {
        const response = await this.client.GET(`/products/{product_id}/payments/{payment_id}/invoice.pdf`, {
            params: {
                path: {
                    payment_id: this.getIdForPath(paymentId),
                    product_id: this.productId,
                },
            },
            parseAs: 'blob', // Expecting a PDF blob response
        });

        if (!this.isGoodResponse(response.response) || !response.data) {
            return null;
        }

        return response.data as Blob; // Assuming the response is a PDF blob
    }
}
