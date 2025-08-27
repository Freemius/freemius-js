import { idToString } from '../api/parser';
import { FSId } from '../api/types';
import { PortalAction } from '../contracts/portal';
import { ActionError } from '../errors/ActionError';
import { ApiService } from '../services/ApiService';
import { AuthService } from '../services/AuthService';
import * as zod from 'zod';

const schema = zod.object({
    couponId: zod.string().min(1),
});

export type ApplyRenewalCouponRequest = zod.infer<typeof schema>;

export class SubscriptionRenewalCouponAction implements PortalAction {
    private readonly actionName = 'subscription_cancellation_coupon';

    constructor(
        private readonly api: ApiService,
        private readonly auth: AuthService
    ) {}

    private createAction(id: string): string {
        return `renewal_coupon_${id}`;
    }

    createAuthenticatedUrl(id: string, userId: FSId, endpoint: string): string {
        const token = this.auth.createActionToken(this.createAction(id), userId);

        const url = new URL(endpoint);
        url.searchParams.set('action', this.actionName);
        url.searchParams.set('token', token);
        url.searchParams.set('subscriptionId', id);
        url.searchParams.set('userId', idToString(userId));

        return url.href;
    }

    verifyAuthentication(request: Request): boolean {
        const url = new URL(request.url);
        const action = url.searchParams.get('action');
        const token = url.searchParams.get('token');
        const subscriptionId = url.searchParams.get('subscriptionId');
        const userId = url.searchParams.get('userId');

        if (!action || !token || !subscriptionId || !userId) {
            return false;
        }

        return this.auth.verifyActionToken(token, this.createAction(subscriptionId), userId);
    }

    canHandle(request: Request): boolean {
        const url = new URL(request.url);
        const action = url.searchParams.get('action');

        return action === this.actionName && request.method === 'POST';
    }

    async processAction(request: Request): Promise<Response> {
        // Check content type
        const contentType = request.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            throw ActionError.badRequest('Invalid content type. Expected application/json');
        }

        let requestBody: unknown;
        try {
            requestBody = await request.json();
        } catch {
            throw ActionError.badRequest('Request body must be valid JSON');
        }

        // Validate request body with Zod schema
        const parseResult = schema.safeParse(requestBody);
        if (!parseResult.success) {
            throw ActionError.validationFailed('Invalid request body format', parseResult.error.issues);
        }

        // Get the subscriptionId from the URL
        const url = new URL(request.url);
        const subscriptionId = url.searchParams.get('subscriptionId');
        if (!subscriptionId) {
            throw ActionError.badRequest('Missing subscriptionId in the request URL');
        }

        const result = await this.api.subscription.applyRenewalCoupon(subscriptionId, parseResult.data.couponId, true);

        if (!result) {
            throw ActionError.internalError('Failed to apply renewal coupon to the subscription');
        }

        return Response.json(result, { status: 200 });
    }
}
