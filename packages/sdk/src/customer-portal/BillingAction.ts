import { BillingUpdatePayload } from '../api/types';
import { PortalAction } from '../contracts/portal';
import { ApiService } from '../services/ApiService';
import { AuthService } from '../services/AuthService';
import { ActionError } from '../errors/ActionError';
import * as zod from 'zod';

export class BillingAction implements PortalAction {
    private readonly actionName = 'billing';

    constructor(
        private readonly api: ApiService,
        private readonly auth: AuthService
    ) {}

    private createAction(id: string): string {
        return `billing_${id}`;
    }

    createAuthenticatedUrl(id: string, userId: string, endpoint: string): string {
        const token = this.auth.createActionToken(this.createAction(id), userId);

        const url = new URL(endpoint);
        url.searchParams.set('action', this.actionName);
        url.searchParams.set('token', token);
        url.searchParams.set('billingId', id);
        url.searchParams.set('userId', userId);

        return url.href;
    }

    verifyAuthentication(request: Request): boolean {
        const url = new URL(request.url);
        const action = url.searchParams.get('action');
        const token = url.searchParams.get('token');
        const billingId = url.searchParams.get('billingId');
        const userId = url.searchParams.get('userId');

        if (!action || !token || !billingId || !userId) {
            return false;
        }

        return this.auth.verifyActionToken(token, this.createAction(billingId), userId);
    }

    canHandle(request: Request): boolean {
        const url = new URL(request.url);
        const action = url.searchParams.get('action');

        return action === this.actionName;
    }

    async processAction(request: Request): Promise<Response> {
        // Define Zod schema for billing request body
        const billingSchema = zod.object({
            business_name: zod.string().optional(),
            tax_id: zod.string().optional(),
            phone: zod.string().optional(),
            address_apt: zod.string().optional(),
            address_street: zod.string().optional(),
            address_city: zod.string().optional(),
            address_state: zod.string().optional(),
            address_country_code: zod.string().optional(),
            address_zip: zod.string().optional(),
        });

        // Check content type
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
        const parseResult = billingSchema.safeParse(requestBody);
        if (!parseResult.success) {
            throw ActionError.validationFailed('Invalid request body format', parseResult.error.issues);
        }

        const billingData = parseResult.data;

        // Extract URL parameters for billing ID and user ID
        const url = new URL(request.url);
        const billingId = url.searchParams.get('billingId');
        const userId = url.searchParams.get('userId');

        if (!billingId) {
            throw ActionError.badRequest('Missing required parameter: billingId');
        }

        if (!userId) {
            throw ActionError.badRequest('Missing required parameter: userId');
        }

        const payload: BillingUpdatePayload = {};

        if (billingData.business_name) {
            payload.business_name = billingData.business_name;
        }
        if (billingData.tax_id) {
            payload.tax_id = billingData.tax_id;
        }
        if (billingData.phone) {
            payload.phone = billingData.phone;
        }

        if (billingData.address_apt) {
            payload.address_apt = billingData.address_apt;
        }
        if (billingData.address_street) {
            payload.address_street = billingData.address_street;
        }
        if (billingData.address_city) {
            payload.address_city = billingData.address_city;
        }
        if (billingData.address_state) {
            payload.address_state = billingData.address_state;
        }
        if (billingData.address_country_code) {
            payload.address_country_code = billingData.address_country_code;
        }
        if (billingData.address_zip) {
            payload.address_zip = billingData.address_zip;
        }

        const response = await this.api.user.updateBilling(userId, payload);

        if (!response) {
            throw ActionError.internalError('Failed to update billing information');
        }

        return Response.json(response, { status: 200 });
    }
}
