import { ApiService } from './ApiService';
import { PortalData } from '../contracts/portal';
import { CheckoutService } from './CheckoutService';
import { AuthService } from './AuthService';
import {
    CustomerPortalDataWithEmailOption,
    CustomerPortalDataWithUserOption,
    PortalDataRepository,
} from '../customer-portal/PortalDataRepository';
import { PurchaseService } from './PurchaseService';
import { PortalRequestProcessor } from '../customer-portal/PortalRequestProcessor';
import { CustomerPortalActionService } from '../customer-portal/CustomerPortalActionService';
import { PurchaseInfo } from '../models/PurchaseInfo';

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
     */
    async retrieveData(option: CustomerPortalDataWithUserOption): Promise<PortalData | null> {
        return this.repository.retrievePortalDataByUserId(option);
    }

    async retrieveDataByEmail(option: CustomerPortalDataWithEmailOption): Promise<PortalData | null> {
        return this.repository.retrievePortalDataByEmail(option);
    }

    /**
     * Creates a restorer function that processes an array of purchases by invoking the provided callback for each purchase.
     */
    createRestorer(callback: (purchase: PurchaseInfo) => Promise<void>): (purchases: PurchaseInfo[]) => Promise<void> {
        return async (purchases: PurchaseInfo[]) => {
            await Promise.all(purchases.map((purchase) => callback(purchase)));
        };
    }
}
