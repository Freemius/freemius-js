import { ApiService } from './ApiService';
import { FSId } from '../api/types';
import { PortalData } from '../contracts/portal';
import { CheckoutService } from './CheckoutService';
import { AuthService } from './AuthService';
import { PortalDataRepository } from '../customer-portal/PortalDataRepository';
import { PurchaseService } from './PurchaseService';
import { PortalRequestProcessor } from '../customer-portal/PortalRequestProcessor';
import { CustomerPortalActionService } from '../customer-portal/CustomerPortalActionService';

export class CustomerPortalService {
    private readonly repository: PortalDataRepository;

    public readonly action: CustomerPortalActionService;
    public readonly request: PortalRequestProcessor;

    constructor(
        private readonly api: ApiService,
        private readonly checkout: CheckoutService,
        private readonly authService: AuthService,
        private readonly purchase: PurchaseService
    ) {
        this.action = new CustomerPortalActionService(this.api, this.authService);

        this.repository = new PortalDataRepository(this.api, this.action, this.checkout);

        this.request = new PortalRequestProcessor(this.repository, this.action, this.purchase);
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
