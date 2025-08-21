import { ApiService } from './ApiService';
import { FSId } from '../api/types';
import { PortalData, PortalAction } from '../contracts/portal';
import { CheckoutService } from './CheckoutService';
import { CheckoutOptions } from '@freemius/checkout';
import { AuthService } from './AuthService';
import { InvoiceAction } from '../customer-portal/InvoiceAction';
import { PortalDataRepository } from '../customer-portal/PortalDataRepository';
import { ActionError } from '../customer-portal/ActionError';
import { BillingAction } from '../customer-portal/BillingAction';

export class CustomerPortalService {
    private readonly repository: PortalDataRepository;
    private readonly invoiceAction: InvoiceAction;
    private readonly billingAction: BillingAction;

    constructor(
        private readonly api: ApiService,
        private readonly checkout: CheckoutService,
        private readonly authService: AuthService
    ) {
        this.repository = new PortalDataRepository(this.api);

        this.invoiceAction = new InvoiceAction(this.api, this.authService);
        this.billingAction = new BillingAction(this.api, this.authService);
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
        const data = await this.repository.getApiData(userId);

        if (!data) {
            return null;
        }

        const { user, pricingData, subscriptions, payments, billing } = data;

        const plans = this.repository.getPlansById(pricingData);
        const pricings = this.repository.getPricingById(pricingData);

        const checkoutOptions: CheckoutOptions = {
            product_id: this.api.productId,
        };

        if (sandbox) {
            checkoutOptions.sandbox = await this.checkout.getSandboxParams();
        }

        const portalData: PortalData = {
            endpoint,
            user,
            checkoutOptions,
            billing: this.repository.getBilling(billing, this.billingAction, userId, endpoint),
            subscriptions: await this.repository.getSubscriptions(subscriptions, plans, pricings, primaryLicenseId),
            payments: this.repository.getPayments(payments, plans, pricings, this.invoiceAction, userId, endpoint),
            plans: pricingData.plans ?? [],
            sellingUnit: pricingData.selling_unit_label ?? {
                singular: 'Unit',
                plural: 'Units',
            },
            productId: this.api.productId,
        };

        return portalData;
    }

    /**
     * Process actions done by the user in the customer portal.
     */
    async processAction(request: Request): Promise<Response> {
        const url = new URL(request.url);
        const action = url.searchParams.get('action');

        if (!action) {
            return Response.json({ error: 'Action parameter is required' }, { status: 400 });
        }

        const actionHandlers: PortalAction[] = [this.invoiceAction, this.billingAction];

        try {
            for (const actionHandler of actionHandlers) {
                if (actionHandler.canHandle(request)) {
                    if (actionHandler.verifyAuthentication(request)) {
                        return await actionHandler.processAction(request);
                    } else {
                        throw ActionError.unauthorized('Invalid authentication token');
                    }
                }
            }
        } catch (error) {
            if (error instanceof ActionError) {
                return error.toResponse();
            }

            console.error('Error processing action:', error);
            return Response.json({ error: 'Internal server error' }, { status: 500 });
        }

        return Response.json({ error: 'Invalid action' }, { status: 400 });
    }
}
