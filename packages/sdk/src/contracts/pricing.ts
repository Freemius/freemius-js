import { SellingUnit } from '../api/types';
import { PortalPlans } from './portal';

export type PricingData = {
    /**
     * Product's pricing plans to display in the paywall.
     */
    plans: PortalPlans;
    /**
     * Optional plan ID to use for top-up purchases.
     */
    topupPlan?: PortalPlans[number] | null;
    /**
     * The selling unit label for the product (e.g., "Credits", "Messages", etc.).
     */
    sellingUnit: SellingUnit;
};
