import { CheckoutPopupParams, CheckoutOptions } from '@freemius/checkout';
import { FSId } from '../api/types';
import { idToString } from '../api/parser';
import { CheckoutBuilder } from '../checkout/CheckoutBuilder';
import { createHash } from 'crypto';
import { CheckoutBuilderOptions } from '../contracts/checkout';
import { PurchaseService } from './PurchaseService';
import { PricingService } from './PricingService';
import { CheckoutRequestProcessor } from '../checkout/CheckoutRequestProcessor';

export class CheckoutService {
    public readonly request: CheckoutRequestProcessor;

    constructor(
        private readonly productId: FSId,
        private readonly publicKey: string,
        private readonly secretKey: string,
        private readonly purchase: PurchaseService,
        private readonly pricing: PricingService
    ) {
        this.request = new CheckoutRequestProcessor(this.purchase, this.pricing, this.secretKey);
    }

    /**
     * Use this to build a Checkout for your product.
     * You can build a Checkout link or options for the popup.
     *
     * @param withRecommendation If true, the checkout will include a recommendation for the user.
     *
     * @return A new instance of CheckoutBuilder with the product ID and public key.
     *
     * @example
     * Basic usage:
     * ```typescript
     * const options = freemius.checkout.create({user: session?.user})
     *   .toOptions(); // Or .toLink() for a hosted checkout link
     * ```
     *
     * @example
     * Advanced configuration: You can also skip the convenience options and rather use the builder directly to configure the checkout.
     *
     * ```typescript
     * const checkoutOptions = freemius.checkout.create()
     *   .withUser(user, true)
     *   .withPlan('1234')
     *   .withQuota(5)
     *   .withCurrency('eur')
     *   .withCoupon({
     *     code: 'DISCOUNT2023',
     *     hideUI: false
     *   })
     *   .inTrial('paid')
     *   .withAppearance({
     *     layout: 'horizontal',
     *     formPosition: 'left',
     *     fullscreen: true,
     *     modalTitle: 'Upgrade Now'
     *   })
     *   .withDiscounts({
     *     annual: true,
     *     multisite: 'auto',
     *     bundle: 'maximize',
     *     showMonthlySwitch: true
     *   })
     *   .withReviewsAndBadges({
     *     showReviews: true,
     *     showRefundBadge: true,
     *     refundPolicyPosition: 'below_form'
     *   })
     *   .withBillingCycle('dropdown', 'annual')
     *   .withLocale('en_US')
     *   .withAffiliate(12345)
     *   .inSandbox()
     *   .toOptions();
     * ```
     */
    create(options: CheckoutBuilderOptions = {}): CheckoutBuilder {
        const { user, isSandbox = false, withRecommendation = true, title, image, planId, quota, trial } = options;

        let builder = this.createBuilder().withUser(user);

        if (withRecommendation) {
            builder = builder.withRecommendation();
        }

        if (isSandbox) {
            builder = builder.inSandbox();
        }

        if (title) {
            builder = builder.withTitle(title);
        }

        if (image) {
            builder = builder.withImage(image);
        }

        if (planId) {
            builder = builder.withPlan(planId);
        }

        if (quota) {
            builder = builder.withQuota(quota);
        }

        if (trial) {
            builder = builder.inTrial(trial);
        }

        return builder;
    }

    /**
     * Convenience method to create checkout options for a specific user with or without sandbox mode.
     *
     * Useful for generating recommended checkout options for SaaS.
     *
     * @see create() for more details on the options.
     */
    async createOptions(options: CheckoutBuilderOptions = {}): Promise<CheckoutOptions> {
        return await this.create(options).toOptions();
    }

    /**
     * Convenience method to create a checkout link for a specific user with or without sandbox mode.
     *
     * Useful for generating recommended checkout links for SaaS.
     *
     * @see create() for more details on the options.
     */
    async createLink(options: CheckoutBuilderOptions = {}): Promise<string> {
        return await this.create(options).toLink();
    }

    private createBuilder(): CheckoutBuilder {
        const productId = idToString(this.productId);

        return new CheckoutBuilder({}, productId, this.publicKey, this.secretKey);
    }

    /**
     * Retrieves the sandbox parameters for the checkout.
     *
     * This shouldn't be used in production, but is useful for testing purposes.
     *
     * @note This is intentionally set as `async` because we would use the API in the future to generate more fine grained sandbox params (for example for a specific email address only).
     *
     * @todo - This has a duplication with the `inSandbox` method in the builder. Consider refactoring to avoid this duplication.
     *         Also think about whether we should make the builder's `inSandbox` method async as well.
     */
    async getSandboxParams(): Promise<NonNullable<CheckoutPopupParams['sandbox']>> {
        const timestamp = Math.floor(Date.now() / 1000).toString();
        const token = `${timestamp}${this.productId}${this.secretKey}${this.publicKey}checkout`;

        return {
            ctx: timestamp,
            token: createHash('md5').update(token).digest('hex'),
        };
    }
}
