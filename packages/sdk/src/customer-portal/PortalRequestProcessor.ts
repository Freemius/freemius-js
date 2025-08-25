import { PortalAction } from '../contracts/portal';
import { RequestProcessor, UserEmailRetriever, UserRetriever } from '../contracts/types';
import { ActionError } from '../errors/ActionError';
import { PurchaseService } from '../services/PurchaseService';
import { BillingAction } from './BillingAction';
import { InvoiceAction } from './InvoiceAction';
import { PortalDataRepository } from './PortalDataRepository';
import { PortalDataRetriever } from './PortalDataRetriever';
import { PurchaseRestorer, RestoreCallback } from './PurchaseRestorer';

export type PortalRequestConfig = {
    getUser: UserRetriever;
    getUserEmail?: UserEmailRetriever;
    onRestore?: RestoreCallback;
    restoreSubscriptionsOnly?: boolean;
    isSandbox?: boolean;
    portalEndpoint: string;
};

export class PortalRequestProcessor implements RequestProcessor<PortalRequestConfig> {
    constructor(
        private readonly repository: PortalDataRepository,
        private readonly invoice: InvoiceAction,
        private readonly billing: BillingAction,
        private readonly purchase: PurchaseService
    ) {}

    getProcessor(config: PortalRequestConfig): (request: Request) => Promise<Response> {
        return (request: Request) => this.process(config, request);
    }

    /**
     * Process actions done by the user in the customer portal.
     */
    async process(config: PortalRequestConfig, request: Request): Promise<Response> {
        const url = new URL(request.url);
        const action = url.searchParams.get('action');

        if (!action) {
            return ActionError.badRequest('Action parameter is required').toResponse();
        }

        const actionHandlers: PortalAction[] = [
            new PortalDataRetriever(this.repository, config.getUser, config.portalEndpoint, config.isSandbox),
            this.invoice,
            this.billing,
        ];

        if (config.onRestore) {
            actionHandlers.push(
                new PurchaseRestorer(
                    this.purchase,
                    config.getUserEmail ?? config.getUser,
                    config.onRestore,
                    config.restoreSubscriptionsOnly ?? false
                )
            );
        }

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
            return ActionError.internalError('Internal Server Error').toResponse();
        }

        return ActionError.badRequest('Unsupported action').toResponse();
    }
}
