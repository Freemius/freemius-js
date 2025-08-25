import { ApiService } from './ApiService';
import { FSId } from '../api/types';
import { PortalData } from '../contracts/portal';
import { CheckoutService } from './CheckoutService';
import { AuthService } from './AuthService';
import { InvoiceAction } from '../customer-portal/InvoiceAction';
import { PortalDataRepository } from '../customer-portal/PortalDataRepository';
import { BillingAction } from '../customer-portal/BillingAction';
import { PurchaseService } from './PurchaseService';
import { PortalRequestProcessor } from '../customer-portal/PortalRequestProcessor';

export class CustomerPortalService {
    private readonly repository: PortalDataRepository;

    public readonly invoice: InvoiceAction;
    public readonly billing: BillingAction;
    public readonly request: PortalRequestProcessor;

    constructor(
        private readonly api: ApiService,
        private readonly checkout: CheckoutService,
        private readonly authService: AuthService,
        private readonly purchase: PurchaseService
    ) {
        this.invoice = new InvoiceAction(this.api, this.authService);
        this.billing = new BillingAction(this.api, this.authService);

        this.repository = new PortalDataRepository(this.api, this.invoice, this.billing, this.checkout);

        this.request = new PortalRequestProcessor(this.repository, this.invoice, this.billing, this.purchase);
    }

    /**
     * Retrieves the customer portal data for a user, including subscriptions, billing, and payments.
     *
     * @param userId The ID of the user for whom to retrieve portal data.
     * @param primaryLicenseId Optional primary license ID to include in the portal data. If present then the `primary` field will be populated with related information which our `@freemius/saas-starter` package uses to display the primary purchase information.
     */
    async retrieveData(
        userId: FSId,
        endpoint: string,
        primaryLicenseId: FSId | null = null,
        sandbox: boolean = false
    ): Promise<PortalData | null> {
        return this.repository.retrievePortalDataByUserId({
            userId,
            endpoint,
            primaryLicenseId,
            sandbox,
        });
    }
}
