import { ApiService } from './services/ApiService';
import { CheckoutService } from './services/CheckoutService';
import { CustomerPortalService } from './services/CustomerPortalService';
import { FSId } from './api/types';
import { WebhookService } from './services/WebhookService';
import { AuthService } from './services/AuthService';
import { PricingService } from './services/PricingService';
import { PurchaseService } from './services/PurchaseService';

export class Freemius {
    public readonly api: ApiService;

    public readonly checkout: CheckoutService;

    public readonly purchase: PurchaseService;

    public readonly customerPortal: CustomerPortalService;

    public readonly webhook: WebhookService;

    public readonly pricing: PricingService;

    private readonly auth: AuthService;

    constructor(productId: FSId, apiKey: string, secretKey: string, publicKey: string) {
        this.api = new ApiService(productId, apiKey, secretKey, publicKey);
        this.auth = new AuthService(productId, secretKey);
        this.pricing = new PricingService(this.api);
        this.purchase = new PurchaseService(this.api);
        this.checkout = new CheckoutService(productId, publicKey, secretKey, this.purchase, this.pricing);
        this.customerPortal = new CustomerPortalService(this.api, this.checkout, this.auth, this.purchase);
        this.webhook = new WebhookService(secretKey);
    }
}

export { PurchaseInfo } from './models/PurchaseInfo';
