import { CheckoutAction } from '../contracts/checkout';
import { PricingService } from '../services/PricingService';

export class PricingRetriever implements CheckoutAction {
    constructor(private readonly pricing: PricingService) {}

    canHandle(request: Request): boolean {
        const url = new URL(request.url);
        const action = url.searchParams.get('action');

        return action === 'pricing_data';
    }

    async processAction(request: Request): Promise<Response> {
        // Get the topupPlanId from the query parameters
        const url = new URL(request.url);
        const topupPlanId = url.searchParams.get('topupPlanId') || undefined;

        const pricingData = await this.pricing.retrieve(topupPlanId);

        return Response.json(pricingData);
    }
}
