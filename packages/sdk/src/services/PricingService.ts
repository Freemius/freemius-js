import { isIdsEqual } from '../api/parser';
import { FSId, PricingEntity, SellingUnit } from '../api/types';
import { PricingData } from '../contracts/pricing';
import { PortalPlans } from '../contracts/portal';
import { ApiService } from '../services/ApiService';

export class PricingService {
    constructor(private readonly api: ApiService) {}

    async retrieve(topupPlanId?: FSId): Promise<PricingData> {
        const pricingData = await this.api.product.retrievePricingData();

        const plans: PricingData['plans'] =
            pricingData?.plans
                ?.filter((plan) => {
                    return plan.pricing?.some((p) => this.isValidPricing(p));
                })
                .map((plan) => {
                    return {
                        ...plan,
                        pricing: plan.pricing?.filter((p) => this.isValidPricing(p)) ?? [],
                    };
                }) ?? [];

        return {
            plans: plans,
            topupPlan: this.findTopupPlan(plans, topupPlanId),
            sellingUnit: (pricingData?.plugin?.selling_unit_label as SellingUnit) ?? {
                singular: 'Unit',
                plural: 'Units',
            },
        };
    }

    findTopupPlan(plans?: PortalPlans, planId?: FSId): PortalPlans[number] | null {
        if (!plans) {
            return null;
        }

        const topupPlan = plans.find((plan) => {
            return (
                // Either search by the explicitly provided plan ID
                (isIdsEqual(plan.id!, planId ?? '') && !plan.is_hidden) ||
                // Or try to guess: A topup plan is where all pricing have one-off purchase set
                plan.pricing?.filter((p) => this.isValidPricing(p)).every((p) => p.lifetime_price)
            );
        });

        return topupPlan ?? null;
    }

    private isValidPricing(pricing: PricingEntity): boolean {
        return !!(pricing.monthly_price || pricing.annual_price || pricing.lifetime_price);
    }
}
