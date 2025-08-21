import { PortalAction } from '../contracts/portal';
import { ApiService } from '../services/ApiService';
import * as zod from 'zod';
import { AuthService } from '../services/AuthService';
import { ActionError } from './ActionError';

export class InvoiceAction implements PortalAction {
    private readonly actionName = 'invoice';

    constructor(
        private readonly api: ApiService,
        private readonly auth: AuthService
    ) {}

    private createAction(id: string): string {
        return `invoice_${id}`;
    }

    createAuthenticatedUrl(id: string, userId: string, endpoint: string): string {
        const token = this.auth.createActionToken(this.createAction(id), userId);

        const url = new URL(endpoint);
        url.searchParams.set('action', this.actionName);
        url.searchParams.set('token', token);
        url.searchParams.set('invoiceId', id);
        url.searchParams.set('userId', userId);

        return url.href;
    }

    verifyAuthentication(request: Request): boolean {
        const url = new URL(request.url);
        const action = url.searchParams.get('action');
        const token = url.searchParams.get('token');
        const invoiceId = url.searchParams.get('invoiceId');
        const userId = url.searchParams.get('userId');

        if (!action || !token || !invoiceId || !userId) {
            return false;
        }

        return this.auth.verifyActionToken(token, this.createAction(invoiceId), userId);
    }

    canHandle(request: Request): boolean {
        const url = new URL(request.url);
        const action = url.searchParams.get('action');

        return action === this.actionName;
    }

    async processAction(request: Request): Promise<Response> {
        // Verify the request that is has valid invoiceId and userId with zod schema validation
        const schema = zod.object({
            invoiceId: zod.string().min(1, 'Invoice ID is required'),
            userId: zod.string().min(1, 'User ID is required'),
        });

        const url = new URL(request.url);
        const invoiceId = url.searchParams.get('invoiceId');
        const userIdParam = url.searchParams.get('userId');

        const parseResult = schema.safeParse({ invoiceId, userId: userIdParam });

        if (!parseResult.success) {
            throw ActionError.validationFailed('Invalid request parameters', parseResult.error.issues);
        }

        const { invoiceId: validInvoiceId } = parseResult.data;

        try {
            const pdf = await this.api.payment.retrieveInvoice(validInvoiceId);

            if (pdf) {
                return new Response(pdf, {
                    headers: {
                        'Content-Type': 'application/pdf',
                        'Content-Disposition': `inline; filename="invoice_${validInvoiceId}.pdf"`,
                    },
                });
            } else {
                throw ActionError.notFound('Invoice not found');
            }
        } catch (error) {
            if (error instanceof ActionError) {
                throw error;
            }

            throw ActionError.internalError('Failed to retrieve invoice');
        }
    }
}
