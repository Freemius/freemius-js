import { createApiClient, FsApiClient } from './api/client';
import { Checkout } from './services/Checkout';
import { PurchaseService } from './services/PurchaseService';
import { FSId } from './utils/id';

export class Freemius {
    public readonly checkout: Checkout;

    public readonly purchase: PurchaseService;

    private readonly apiClient: FsApiClient;

    constructor(
        private readonly productId: FSId,
        private readonly apiKey: string,
        private readonly secretKey: string,
        private readonly publicKey: string
    ) {
        this.apiClient = createApiClient(apiKey);
        this.checkout = new Checkout(productId, publicKey, secretKey);
        this.purchase = new PurchaseService(productId, this.apiClient);
    }

    // createWebhookListener() {}
}

export { PurchaseInfo } from './models/PurchaseInfo';
