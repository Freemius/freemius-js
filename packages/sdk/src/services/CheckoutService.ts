import { CheckoutPopupParams, CheckoutOptions } from '@freemius/checkout';
import { FSId } from '../api/types';
import { idToString } from '../api/parser';
import { CheckoutBuilder, CheckoutBuilderUserOptions } from '../models/CheckoutBuilder';
import { createHash, createHmac, timingSafeEqual } from 'crypto';
import { CheckoutRedirectInfo } from '../models/CheckoutRedirectInfo';

export type CheckoutSessionOptions = {
    /**
     * The user for whom the checkout is being created.
     * This should be an object containing user details like email, ID, etc.
     * If not provided, the checkout will be created without user context.
     */
    user?: CheckoutBuilderUserOptions;
    /**
     * Whether to use sandbox mode for the checkout.
     *
     * @default false
     */
    isSandbox?: boolean;
    /**
     * Whether to include the recommended option in the checkout for maximum conversion.
     *
     * @default true
     */
    withRecommendation?: boolean;
    /**
     * The title of the checkout modal.
     */
    title?: string;
    /**
     * Image to display in the checkout modal. Must be a valid https URL.
     */
    image?: string;
    /**
     * Optional plan ID to use for the checkout.
     * If provided, this will be used as the default plan for the checkout, instead of the first paid plan.
     */
    planId?: string;
    /**
     * Optional quota to set for the checkout.
     *
     * This is useful when purchasing credits or similar resources.
     */
    quota?: number;
    /**
     * Optional trial period configuration.
     *
     * This can be used to set a trial period for the checkout.
     * If not provided, the checkout will not have a trial period.
     */
    trial?: CheckoutOptions['trial'];
};

export class CheckoutService {
    constructor(
        private readonly productId: FSId,
        private readonly publicKey: string,
        private readonly secretKey: string
    ) {}

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
     * const options = freemius.checkout.params()
     *   .withUser(session?.user)
     *   .inSandbox()
     *   .withRecommendation()
     *   .toOptions(); // Or .toLink() for a hosted checkout link
     * ```
     *
     * @example
     * Advanced configuration:
     * ```typescript
     * const checkoutOptions = freemius.checkout.params()
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
    create(withRecommendation: boolean = true): CheckoutBuilder {
        const productId = idToString(this.productId);

        const builder = new CheckoutBuilder({}, productId, this.publicKey, this.secretKey);

        return withRecommendation ? builder.withRecommendation() : builder;
    }

    /**
     * Convenience method to create checkout options for a specific user with or without sandbox mode.
     *
     * Useful for generating recommended checkout options for SaaS.
     */
    async createSessionOptions(options: CheckoutSessionOptions = {}): Promise<CheckoutOptions> {
        return await this.createSession(options).toOptions();
    }

    /**
     * Convenience method to create a checkout link for a specific user with or without sandbox mode.
     *
     * Useful for generating recommended checkout links for SaaS.
     */
    async createSessionLink(options: CheckoutSessionOptions = {}): Promise<string> {
        return await this.createSession(options).toLink();
    }

    /**
     * Convenience method to create a checkout session with user context and sandbox mode.
     *
     * This method allows you to create a checkout session with the user details and sandbox mode.
     */
    createSession(options: CheckoutSessionOptions = {}): CheckoutBuilder {
        const { user, isSandbox = false, withRecommendation = true, title, image, planId, quota, trial } = options;

        let builder = this.create(withRecommendation).withUser(user);

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

    /**
     * Processes the redirect from Freemius Checkout.
     *
     * This method verifies the signature in the URL and returns a CheckoutRedirectInfo object if successful.
     *
     * For nextjs like applications, make sure to replace the URL from the `Request` object with the right hostname to take care of the proxy.
     *
     * For example, if you have put the nextjs application behind nginx proxy (or ngrok during local development), then nextjs will still see the `request.url` as `https://localhost:3000/...`.
     * In this case, you should replace it with the actual URL of your application, like `https://xyz.ngrok-free.app/...`.
     *
     * @example
     * ```ts
     * export async function GET(request: Request) {
     *     // Replace the URL with the actual hostname of your application
     *     // This is important for the signature verification to work correctly.
     *     const data = await freemius.checkout.processRedirect(
     *         request.url.replace('https://localhost:3000', 'https://xyz.ngrok-free.app')
     *     );
     * }
     * ```
     */
    async processRedirect(currentUrl: string): Promise<CheckoutRedirectInfo | null> {
        const url = new URL(
            currentUrl
                // Handle spaces in the URL, which may be encoded as %20 or +
                .replace(/%20/g, '+')
        );

        const signature = url.searchParams.get('signature');

        if (!signature) {
            return null;
        }

        const cleanUrl = this.getCleanUrl(url.href);

        // Calculate HMAC SHA256
        const calculatedSignature = createHmac('sha256', this.secretKey).update(cleanUrl).digest('hex');

        // Compare signatures securely
        const result = timingSafeEqual(Buffer.from(calculatedSignature), Buffer.from(signature));

        if (!result) {
            return null;
        }

        const params = Object.fromEntries(url.searchParams.entries());

        if (!params.user_id || !params.plan_id || !params.pricing_id || !params.email) {
            return null;
        }

        return new CheckoutRedirectInfo(params);
    }

    // Helper to get the current absolute URL (removing "&signature=..." or "?signature=..." by string slicing)
    private getCleanUrl(url: string): string {
        const signatureParam = '&signature=';
        const signatureParamFirst = '?signature=';

        let signaturePos = url.indexOf(signatureParam);

        if (signaturePos === -1) {
            signaturePos = url.indexOf(signatureParamFirst);
        }

        if (signaturePos === -1) {
            // No signature param found, return as is
            return url;
        }

        return url.substring(0, signaturePos);
    }
}
