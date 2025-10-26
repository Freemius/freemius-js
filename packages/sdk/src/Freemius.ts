import { ApiService } from './services/ApiService';
import { CheckoutService } from './services/CheckoutService';
import { CustomerPortalService } from './services/CustomerPortalService';
import { FSId } from './api/types';
import { WebhookService } from './services/WebhookService';
import { AuthService } from './services/AuthService';
import { PricingService } from './services/PricingService';
import { PurchaseService } from './services/PurchaseService';
import { EntitlementService } from './services/EntitlementService';

export type FreemiusConfig = {
    productId: FSId;
    apiKey: string;
    secretKey: string;
    publicKey: string;
};

export class Freemius {
    public readonly api: ApiService;

    public readonly checkout: CheckoutService;

    public readonly purchase: PurchaseService;

    public readonly customerPortal: CustomerPortalService;

    public readonly webhook: WebhookService;

    public readonly pricing: PricingService;

    public readonly entitlement = new EntitlementService();

    private readonly auth: AuthService;

    constructor(config: FreemiusConfig) {
        const { productId, apiKey, secretKey, publicKey } = config;

        this.api = new ApiService(productId, apiKey, secretKey, publicKey);
        this.auth = new AuthService(productId, secretKey);
        this.pricing = new PricingService(this.api);
        this.purchase = new PurchaseService(this.api);
        this.checkout = new CheckoutService(productId, publicKey, secretKey, this.purchase, this.pricing);
        this.customerPortal = new CustomerPortalService(this.api, this.checkout, this.auth, this.purchase);
        this.webhook = new WebhookService(this.api, secretKey);
    }
}
