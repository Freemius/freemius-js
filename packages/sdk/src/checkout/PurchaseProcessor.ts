import { ActionError } from '../errors/ActionError';
import { PurchaseInfo } from '../Freemius';
import * as zod from 'zod';
import { PurchaseService } from '../services/PurchaseService';
import { CheckoutAction } from '../contracts/checkout';

export type PurchaseCallback = (purchase: PurchaseInfo) => Promise<Response | void>;

export class PurchaseProcessor implements CheckoutAction {
    constructor(
        private readonly purchase: PurchaseService,
        private readonly callback?: PurchaseCallback
    ) {}

    canHandle(request: Request): boolean {
        const url = new URL(request.url);
        const action = url.searchParams.get('action');

        return request.method === 'POST' && action === 'process_purchase';
    }

    async processAction(request: Request): Promise<Response> {
        const purchaseSchema = zod.object({
            purchase: zod.object({
                license_id: zod.string(),
            }),
        });

        const contentType = request.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            throw ActionError.badRequest('Invalid content type. Expected application/json');
        }

        // Parse request body
        let requestBody: unknown;
        try {
            requestBody = await request.json();
        } catch {
            throw ActionError.badRequest('Request body must be valid JSON');
        }

        // Validate request body with Zod schema
        const parseResult = purchaseSchema.safeParse(requestBody);
        if (!parseResult.success) {
            throw ActionError.validationFailed('Invalid request body format', parseResult.error.issues);
        }

        const {
            purchase: { license_id: licenseId },
        } = parseResult.data;
        const purchase = await this.purchase.retrievePurchase(licenseId);

        if (!purchase) {
            throw ActionError.notFound('No purchase data found for the provided license ID');
        }

        if (this.callback) {
            const callbackResponse = await this.callback(purchase);

            if (callbackResponse) {
                return callbackResponse;
            }
        }

        return Response.json(purchase.toData());
    }
}
