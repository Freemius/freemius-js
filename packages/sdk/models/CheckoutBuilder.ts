import {
    CheckoutOptions,
    CheckoutPopupParams,
    convertCheckoutOptionsToQueryParams,
    CheckoutPopupArbitraryParams,
    buildFreemiusQueryFromOptions,
} from '@freemius/checkout';
import { createHash } from 'crypto';
import { splitName } from '../utils/ops';

export type CheckoutBuilderUserOptions =
    | { email: string; firstName?: string; lastName?: string; name?: string }
    | null
    | undefined;

/**
 * A builder class for constructing checkout parameters. This class provides a fluent
 * API to create Checkout parameters for a product with various configurations.
 *
 *
 *
 * Every method returns a new instance of the builder with the updated options,
 * allowing for method chaining. The final `toOptions()` method returns the constructed
 * `CheckoutOptions` object. So the class itself is immutable and does not modify the original instance.
 */
export class CheckoutBuilder {
    constructor(
        private readonly options: Omit<CheckoutPopupParams, 'plugin_id'> & CheckoutPopupArbitraryParams,
        private readonly productId: string,
        private readonly publicKey?: string,
        private readonly secretKey?: string
    ) {}

    /**
     * Enables sandbox mode for testing purposes.
     *
     * @returns A new builder instance with sandbox configuration
     */
    inSandbox(): CheckoutBuilder {
        const timestamp = Math.floor(Date.now() / 1000).toString();
        const token = `${timestamp}${this.productId}${this.secretKey}${this.publicKey}checkout`;

        return new CheckoutBuilder(
            {
                ...this.options,
                sandbox: {
                    ctx: timestamp,
                    token: createHash('md5').update(token).digest('hex'),
                },
            },
            this.productId,
            this.publicKey,
            this.secretKey
        );
    }

    /**
     * Sets user information for the checkout session.
     *
     * @param user User object with email and optional name fields. The shape matches the session from `better-auth` or next-auth packages. Also handles `null` or `undefined` gracefully.
     * @param readonly If true, the user information will be read-only in the checkout session.
     *
     * @returns A new builder instance with user configuration
     */
    withUser(user: CheckoutBuilderUserOptions, readonly: boolean = true): CheckoutBuilder {
        if (!user) {
            return this;
        }

        let firstName = user.firstName ?? '';
        let lastName = user.lastName ?? '';

        if (user.name) {
            const { firstName: fn, lastName: ln } = splitName(user.name);
            firstName = fn;
            lastName = ln;
        }

        return new CheckoutBuilder(
            {
                ...this.options,
                user_email: user.email,
                user_first_name: firstName,
                user_last_name: lastName,
                readonly_user: readonly,
            },
            this.productId,
            this.publicKey,
            this.secretKey
        );
    }

    /**
     * Applies recommended UI settings for better user experience.
     * This includes fullscreen mode, upsells, refund badge, and reviews display.
     *
     * @returns A new builder instance with recommended UI settings
     */
    withRecommendation(): CheckoutBuilder {
        return new CheckoutBuilder(
            {
                ...this.options,
                fullscreen: true,
                show_refund_badge: true,
                show_reviews: true,
                locale: 'auto',
                currency: 'auto',
            },
            this.productId,
            this.publicKey,
            this.secretKey
        );
    }

    /**
     * Sets the plan ID for the checkout.
     *
     * @param planId The plan ID to purchase
     * @returns A new builder instance with plan ID set
     */
    withPlan(planId: string | number): CheckoutBuilder {
        return new CheckoutBuilder(
            {
                ...this.options,
                plan_id: planId.toString(),
            },
            this.productId,
            this.publicKey,
            this.secretKey
        );
    }

    /**
     * Sets the number of licenses to purchase.
     *
     * @param count Number of licenses
     * @returns A new builder instance with license count set
     */
    withQuota(count: number): CheckoutBuilder {
        return new CheckoutBuilder(
            {
                ...this.options,
                licenses: count,
            },
            this.productId,
            this.publicKey,
            this.secretKey
        );
    }

    withPricing(pricingId: string | number): CheckoutBuilder {
        return new CheckoutBuilder(
            {
                ...this.options,
                pricing_id: pricingId.toString(),
            },
            this.productId,
            this.publicKey,
            this.secretKey
        );
    }

    withTitle(title: string): CheckoutBuilder {
        return new CheckoutBuilder(
            {
                ...this.options,
                title,
            },
            this.productId,
            this.publicKey,
            this.secretKey
        );
    }

    /**
     * Sets a coupon code for the checkout.
     *
     * @param coupon The coupon code to apply
     * @param hideUI Whether to hide the coupon input field from users
     * @returns A new builder instance with coupon configuration
     */
    withCoupon(options: { code: string; hideUI?: boolean }): CheckoutBuilder {
        const { code: coupon, hideUI = false } = options;

        const newOptions = { ...this.options, hide_coupon: hideUI };
        if (coupon !== undefined) {
            newOptions.coupon = coupon;
        }

        return new CheckoutBuilder(newOptions, this.productId, this.publicKey, this.secretKey);
    }

    /**
     * Enables trial mode for the checkout.
     *
     * @param mode Trial type - true/false for plan default, or specific 'free'/'paid' mode
     * @returns A new builder instance with trial configuration
     */
    inTrial(mode: 'free' | 'paid' | boolean = true): CheckoutBuilder {
        return new CheckoutBuilder(
            {
                ...this.options,
                trial: mode,
            },
            this.productId,
            this.publicKey,
            this.secretKey
        );
    }

    /**
     * Configures the visual layout and appearance of the checkout.
     *
     * @param options Appearance configuration options
     * @returns A new builder instance with appearance configuration
     */
    withAppearance(options: {
        layout?: 'vertical' | 'horizontal' | null;
        formPosition?: 'left' | 'right';
        fullscreen?: boolean;
        modalTitle?: string;
        id?: string; // Custom body ID for CSS targeting
    }): CheckoutBuilder {
        const newOptions = { ...this.options };

        if (options.layout !== undefined) {
            newOptions.layout = options.layout;
        }
        if (options.formPosition !== undefined) {
            newOptions.form_position = options.formPosition;
        }
        if (options.fullscreen !== undefined) {
            newOptions.fullscreen = options.fullscreen;
        }
        if (options.modalTitle !== undefined) {
            newOptions.modal_title = options.modalTitle;
        }

        if (options.id !== undefined) {
            newOptions.id = options.id;
        }

        return new CheckoutBuilder(newOptions, this.productId, this.publicKey, this.secretKey);
    }

    /**
     * Configures discount display settings.
     *
     * @param options Discount configuration options
     * @returns A new builder instance with discount configuration
     */
    withDiscounts(options: {
        annual?: boolean;
        multisite?: boolean | 'auto';
        bundle?: boolean | 'maximize';
        showMonthlySwitch?: boolean;
    }): CheckoutBuilder {
        const newOptions = { ...this.options };

        if (options.annual !== undefined) {
            newOptions.annual_discount = options.annual;
        }
        if (options.multisite !== undefined) {
            newOptions.multisite_discount = options.multisite;
        }
        if (options.bundle !== undefined) {
            newOptions.bundle_discount = options.bundle;
        }
        if (options.showMonthlySwitch !== undefined) {
            newOptions.show_monthly_switch = options.showMonthlySwitch;
        }

        return new CheckoutBuilder(newOptions, this.productId, this.publicKey, this.secretKey);
    }

    /**
     * Configures billing cycle selector interface.
     *
     * @param selector Type of billing cycle selector to show
     * @param defaultCycle Default billing cycle to select
     * @returns A new builder instance with billing cycle configuration
     */
    withBillingCycle(
        defaultCycle: 'monthly' | 'annual' | 'lifetime',
        selector?: 'list' | 'responsive_list' | 'dropdown'
    ): CheckoutBuilder {
        const newOptions = { ...this.options };

        if (selector !== undefined) {
            newOptions.billing_cycle_selector = selector;
        }
        if (defaultCycle !== undefined) {
            newOptions.billing_cycle = defaultCycle;
        }

        return new CheckoutBuilder(newOptions, this.productId, this.publicKey, this.secretKey);
    }

    /**
     * Sets the language/locale for the checkout.
     *
     * @param locale Language setting - 'auto', 'auto-beta', or specific locale like 'en_US'
     * @returns A new builder instance with locale configuration
     */
    withLanguage(locale: 'auto' | 'auto-beta' | string = 'auto'): CheckoutBuilder {
        return new CheckoutBuilder(
            {
                ...this.options,
                language: locale,
                locale: locale,
            },
            this.productId,
            this.publicKey,
            this.secretKey
        );
    }

    /**
     * Configures review and badge display settings.
     *
     * @param options Review and badge configuration
     * @returns A new builder instance with reviews and badges configuration
     */
    withReviewsAndBadges(options: {
        showReviews?: boolean;
        reviewId?: number;
        showRefundBadge?: boolean;
        refundPolicyPosition?: 'below_form' | 'below_breakdown' | 'dynamic';
    }): CheckoutBuilder {
        const newOptions = { ...this.options };

        if (options.showReviews !== undefined) {
            newOptions.show_reviews = options.showReviews;
        }
        if (options.reviewId !== undefined) {
            newOptions.review_id = options.reviewId;
        }
        if (options.showRefundBadge !== undefined) {
            newOptions.show_refund_badge = options.showRefundBadge;
        }
        if (options.refundPolicyPosition !== undefined) {
            newOptions.refund_policy_position = options.refundPolicyPosition;
        }

        return new CheckoutBuilder(newOptions, this.productId, this.publicKey, this.secretKey);
    }

    /**
     * Enhanced currency configuration.
     *
     * @param currency Primary currency or 'auto' for automatic detection
     * @param defaultCurrency Default currency when using 'auto'
     * @param showInlineSelector Whether to show inline currency selector
     * @returns A new builder instance with currency configuration
     */
    withCurrency(
        currency: 'usd' | 'eur' | 'gbp' | 'auto',
        defaultCurrency: 'usd' | 'eur' | 'gbp' = 'usd',
        showInlineSelector: boolean = true
    ): CheckoutBuilder {
        const options = {
            ...this.options,
            show_inline_currency_selector: showInlineSelector,
            default_currency: defaultCurrency,
        };

        // Only set currency if it's not 'auto'
        if (currency !== 'auto') {
            options.currency = currency;
        }

        return new CheckoutBuilder(options, this.productId, this.publicKey, this.secretKey);
    }

    /**
     * Configures navigation and cancel behavior.
     *
     * @param cancelUrl URL for back button when in page mode
     * @param cancelIcon Custom cancel icon URL
     * @returns A new builder instance with navigation configuration
     */
    withNavigation(cancelUrl?: string, cancelIcon?: string): CheckoutBuilder {
        const newOptions = { ...this.options };

        if (cancelUrl !== undefined) {
            newOptions.cancel_url = cancelUrl;
        }
        if (cancelIcon !== undefined) {
            newOptions.cancel_icon = cancelIcon;
        }

        return new CheckoutBuilder(newOptions, this.productId, this.publicKey, this.secretKey);
    }

    /**
     * Associates purchases with an affiliate account.
     *
     * @param userId Affiliate user ID
     * @returns A new builder instance with affiliate configuration
     */
    withAffiliate(userId: number): CheckoutBuilder {
        return new CheckoutBuilder(
            {
                ...this.options,
                affiliate_user_id: userId,
            },
            this.productId,
            this.publicKey,
            this.secretKey
        );
    }

    /**
     * Sets a custom image/icon for the checkout.
     *
     * @param imageUrl Secure HTTPS URL to the image
     * @returns A new builder instance with custom image
     */
    withImage(imageUrl: string): CheckoutBuilder {
        return new CheckoutBuilder(
            {
                ...this.options,
                image: imageUrl,
            },
            this.productId,
            this.publicKey,
            this.secretKey
        );
    }

    /**
     * Configures the checkout for license renewal.
     *
     * @param licenseKey The license key to renew
     * @returns A new builder instance configured for renewal
     */
    forRenewal(licenseKey: string): CheckoutBuilder {
        return new CheckoutBuilder(
            {
                ...this.options,
                license_key: licenseKey,
            },
            this.productId,
            this.publicKey,
            this.secretKey
        );
    }

    /**
     * Builds and returns the final checkout options to be used with the `@freemius/checkout` package.
     *
     * @returns The constructed CheckoutOptions object
     */
    toOptions(
        additionalOptions?: Omit<CheckoutPopupParams, 'plugin_id'> & CheckoutPopupArbitraryParams
    ): CheckoutOptions {
        return { ...this.options, ...additionalOptions, product_id: this.productId };
    }

    toLink(): string {
        const checkoutOptions = convertCheckoutOptionsToQueryParams(this.options);

        const queryParams = buildFreemiusQueryFromOptions(checkoutOptions);

        const url = new URL(`https://checkout.freemius.com/product/${this.productId}/`);
        url.search = queryParams;

        return url.href;
    }
}
