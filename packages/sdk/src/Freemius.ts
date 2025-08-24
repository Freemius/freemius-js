import { ApiService } from './services/ApiService';
import { CheckoutService } from './services/CheckoutService';
import { CustomerPortalService } from './services/CustomerPortalService';
import { PurchaseService } from './services/PurchaseService';
import { FSId } from './api/types';
import { WebhookService } from './services/WebhookService';
import { AuthService } from './services/AuthService';

export class Freemius {
    public readonly api: ApiService;

    public readonly checkout: CheckoutService;

    public readonly purchase: PurchaseService;

    public readonly customerPortal: CustomerPortalService;

    public readonly webhook: WebhookService;

    private readonly auth: AuthService;

    constructor(productId: FSId, apiKey: string, secretKey: string, publicKey: string) {
        this.api = new ApiService(productId, apiKey, secretKey, publicKey);
        this.auth = new AuthService(productId, secretKey);
        this.checkout = new CheckoutService(productId, publicKey, secretKey, this.api);
        this.purchase = new PurchaseService(this.api);
        this.customerPortal = new CustomerPortalService(this.api, this.checkout, this.auth);
        this.webhook = new WebhookService(secretKey);
    }
}

export { PurchaseInfo } from './models/PurchaseInfo';
