import * as zod from 'zod';
import { idToString } from '../api/parser';
import { FSId, SubscriptionCancellationReasonType } from '../api/types';
import { PortalAction } from '../contracts/portal';
import { ActionError } from '../errors/ActionError';
import { ApiService } from '../services/ApiService';
import { AuthService } from '../services/AuthService';

const schema = zod.object({
    feedback: zod.string().optional(),
    reason_ids: zod
        .array(zod.enum(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15']))
        .optional(),
});

export type SubscriptionCancellationRequest = zod.infer<typeof schema>;

export class SubscriptionCancellationAction implements PortalAction {
    private readonly actionName = 'subscription_cancellation';

    constructor(
        private readonly api: ApiService,
        private readonly auth: AuthService
    ) {}

    private createAction(id: string): string {
        return `cancellation_${id}`;
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
        // Get feedback and reason_ids from the body

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

        // Get subscriptionId and userId from the URL
        const url = new URL(request.url);
        const subscriptionId = url.searchParams.get('subscriptionId');
        const userId = url.searchParams.get('userId');

        if (!subscriptionId || !userId) {
            throw ActionError.badRequest('Missing subscriptionId or userId');
        }

        const reasonIds = parseResult.data.reason_ids
            ? (parseResult.data.reason_ids.map((id) => parseInt(id, 10)) as SubscriptionCancellationReasonType[])
            : undefined;

        const result = await this.api.subscription.cancel(subscriptionId, parseResult.data.feedback, reasonIds);

        if (!result) {
            throw ActionError.internalError('Failed to cancel the subscription');
        }

        return Response.json(result, { status: 200 });
    }
}
