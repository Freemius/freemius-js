import { PortalAction } from '../contracts/portal';
import { UserEmailRetriever, UserRetriever } from '../contracts/types';
import { ActionError } from '../errors/ActionError';
import { PurchaseInfo } from '../Freemius';
import { PurchaseService } from '../services/PurchaseService';

export type RestoreCallback = (purchases: PurchaseInfo[]) => Promise<Response | void>;

export class PurchaseRestorer implements PortalAction {
    constructor(
        private readonly purchase: PurchaseService,
        private readonly user: UserRetriever | UserEmailRetriever,
        private readonly callback?: RestoreCallback,
        private readonly subscriptionOnly: boolean = false
    ) {}

    createAuthenticatedUrl(): string {
        throw new Error('Method not implemented.');
    }

    verifyAuthentication(): boolean {
        // This is handled later in the processAction method
        return true;
    }

    canHandle(request: Request): boolean {
        const url = new URL(request.url);
        const action = url.searchParams.get('action');

        return request.method === 'POST' && action === 'restore_purchase';
    }

    async processAction(): Promise<Response> {
        let purchases: PurchaseInfo[] | null = null;
        const user = await this.user();

        if (!user) {
            throw ActionError.unauthorized('User not authenticated');
        }

        if (this.subscriptionOnly) {
            purchases =
                'id' in user
                    ? await this.purchase.retrieveSubscriptions(user.id)
                    : await this.purchase.retrieveSubscriptionsByEmail(user.email);
        } else {
            purchases =
                'id' in user
                    ? await this.purchase.retrievePurchases(user.id)
                    : await this.purchase.retrievePurchasesByEmail(user.email);
        }

        if (!purchases) {
            throw ActionError.notFound('No purchases found for the provided user');
        }

        if (this.callback) {
            const callbackResponse = await this.callback(purchases);

            if (callbackResponse) {
                return callbackResponse;
            }
        }

        return Response.json(purchases.map((p) => p.toData()));
    }
}
