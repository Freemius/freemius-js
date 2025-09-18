import {
    CheckoutOptions,
    CheckoutPopupParams,
    convertCheckoutOptionsToQueryParams,
    buildFreemiusQueryFromOptions,
} from '@freemius/checkout';
import { createHash } from 'crypto';
import { isTestServer, splitName } from '../utils/ops';
import { CheckoutBuilderUserOptions } from '../contracts/checkout';

export type CheckoutSerialized = {
    options: CheckoutOptions;
    link: string;
    baseUrl: string;
};

/**
 * A builder class for constructing checkout parameters. This class provides a fluent
 * API to create Checkout parameters for a product with various configurations.
 *
 * Every method returns the existing instance of the builder for chainability,
 * The final `getOptions()` method returns the constructed `CheckoutOptions` object.
 */
export class Checkout {
    static createSandboxToken(
        productId: string,
        secretKey: string,
        publicKey: string
    ): NonNullable<CheckoutPopupParams['sandbox']> {
        const timestamp = Math.floor(Date.now() / 1000).toString();
        const token = `${timestamp}${productId}${secretKey}${publicKey}checkout`;

        return {
            ctx: timestamp,
            token: createHash('md5').update(token).digest('hex'),
        };
    }

    private options: CheckoutOptions;

    constructor(
        private readonly productId: string,
        private readonly publicKey: string,
        private readonly secretKey: string
    ) {
        this.options = { product_id: productId };
    }

    /**
     * Enables sandbox mode for testing purposes.
     *
     * @returns A new builder instance with sandbox configuration
     */
    setSandbox(): Checkout {
        this.options = {
            ...this.options,
            sandbox: Checkout.createSandboxToken(this.productId, this.secretKey!, this.publicKey!),
        };

        return this;
    }

    /**
     * Sets user information for the checkout session.
     *
     * @param user User object with email and optional name fields. The shape matches the session from `better-auth` or next-auth packages. Also handles `null` or `undefined` gracefully.
     * @param readonly If true, the user information will be read-only in the checkout session.
     *
     * @returns A new builder instance with user configuration
     */
    setUser(user: CheckoutBuilderUserOptions, readonly: boolean = true): Checkout {
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

        this.options = {
            ...this.options,
            user_email: user.email,
            user_firstname: firstName,
            user_lastname: lastName,
            readonly_user: readonly,
        };

        return this;
    }

    /**
     * Applies recommended UI settings for better user experience.
     * This includes fullscreen mode, upsells, refund badge, and reviews display.
     *
     * @returns A new builder instance with recommended UI settings
     */
    setRecommendations(): Checkout {
        this.options = {
            ...this.options,
            fullscreen: true,
            show_refund_badge: true,
            show_reviews: true,
            locale: 'auto',
            currency: 'auto',
        };

        return this;
    }

    /**
     * Sets the plan ID for the checkout.
     *
     * @param planId The plan ID to purchase
     * @returns A new builder instance with plan ID set
     */
    setPlan(planId: string | number): Checkout {
        this.options = {
            ...this.options,
            plan_id: planId.toString(),
        };

        return this;
    }

    /**
     * Sets the number of licenses to purchase.
     *
     * @param count Number of licenses
     * @returns A new builder instance with license count set
     */
    setQuota(count: number): Checkout {
        this.options = {
            ...this.options,
            licenses: count,
        };

        return this;
    }

    setPricing(pricingId: string | number): Checkout {
        this.options = {
            ...this.options,
            pricing_id: pricingId.toString(),
        };

        return this;
    }

    setTitle(title: string): Checkout {
        this.options = {
            ...this.options,
            title,
        };

        return this;
    }

    /**
     * Sets a coupon code for the checkout.
     *
     * @param coupon The coupon code to apply
     * @param hideUI Whether to hide the coupon input field from users
     * @returns A new builder instance with coupon configuration
     */
    setCoupon(options: { code: string; hideUI?: boolean }): Checkout {
        const { code: coupon, hideUI = false } = options;

        this.options = {
            ...this.options,
            coupon,
            hide_coupon: hideUI,
        };

        return this;
    }

    /**
     * Enables trial mode for the checkout.
     *
     * @param mode Trial type - true/false for plan default, or specific 'free'/'paid' mode
     * @returns A new builder instance with trial configuration
     */
    setTrial(mode: 'free' | 'paid' | boolean = true): Checkout {
        this.options = {
            ...this.options,
            trial: mode,
        };

        return this;
    }

    /**
     * Configures the visual layout and appearance of the checkout.
     *
     * @param options Appearance configuration options
     * @returns A new builder instance with appearance configuration
     */
    setAppearance(options: {
        layout?: 'vertical' | 'horizontal' | null;
        formPosition?: 'left' | 'right';
        fullscreen?: boolean;
        modalTitle?: string;
        id?: string; // Custom body ID for CSS targeting
    }): Checkout {
        this.options = { ...this.options };

        if (options.layout !== undefined) {
            this.options.layout = options.layout;
        }
        if (options.formPosition !== undefined) {
            this.options.form_position = options.formPosition;
        }
        if (options.fullscreen !== undefined) {
            this.options.fullscreen = options.fullscreen;
        }
        if (options.modalTitle !== undefined) {
            this.options.modal_title = options.modalTitle;
        }

        if (options.id !== undefined) {
            this.options.id = options.id;
        }

        return this;
    }

    /**
     * Configures discount display settings.
     *
     * @param options Discount configuration options
     * @returns A new builder instance with discount configuration
     */
    setDiscounts(options: {
        annual?: boolean;
        multisite?: boolean | 'auto';
        bundle?: boolean | 'maximize';
        showMonthlySwitch?: boolean;
    }): Checkout {
        this.options = { ...this.options };

        if (options.annual !== undefined) {
            this.options.annual_discount = options.annual;
        }
        if (options.multisite !== undefined) {
            this.options.multisite_discount = options.multisite;
        }
        if (options.bundle !== undefined) {
            this.options.bundle_discount = options.bundle;
        }
        if (options.showMonthlySwitch !== undefined) {
            this.options.show_monthly_switch = options.showMonthlySwitch;
        }

        return this;
    }

    /**
     * Configures billing cycle selector interface.
     *
     * @param selector Type of billing cycle selector to show
     * @param defaultCycle Default billing cycle to select
     * @returns A new builder instance with billing cycle configuration
     */
    setBillingCycle(
        defaultCycle: 'monthly' | 'annual' | 'lifetime',
        selector?: 'list' | 'responsive_list' | 'dropdown'
    ): Checkout {
        this.options = { ...this.options };

        if (selector !== undefined) {
            this.options.billing_cycle_selector = selector;
        }
        if (defaultCycle !== undefined) {
            this.options.billing_cycle = defaultCycle;
        }

        return this;
    }

    /**
     * Sets the language/locale for the checkout.
     *
     * @param locale Language setting - 'auto', 'auto-beta', or specific locale like 'en_US'
     * @returns A new builder instance with locale configuration
     */
    setLanguage(locale: 'auto' | 'auto-beta' | string = 'auto'): Checkout {
        this.options = {
            ...this.options,
            language: locale,
        };

        return this;
    }

    /**
     * Configures review and badge display settings.
     *
     * @param options Review and badge configuration
     * @returns A new builder instance with reviews and badges configuration
     */
    setSocialProofing(options: {
        showReviews?: boolean;
        reviewId?: number;
        showRefundBadge?: boolean;
        refundPolicyPosition?: 'below_form' | 'below_breakdown' | 'dynamic';
    }): Checkout {
        this.options = { ...this.options };

        if (options.showReviews !== undefined) {
            this.options.show_reviews = options.showReviews;
        }
        if (options.reviewId !== undefined) {
            this.options.review_id = options.reviewId;
        }
        if (options.showRefundBadge !== undefined) {
            this.options.show_refund_badge = options.showRefundBadge;
        }
        if (options.refundPolicyPosition !== undefined) {
            this.options.refund_policy_position = options.refundPolicyPosition;
        }

        return this;
    }

    /**
     * Enhanced currency configuration.
     *
     * @param currency Primary currency or 'auto' for automatic detection
     * @param defaultCurrency Default currency when using 'auto'
     * @param showInlineSelector Whether to show inline currency selector
     * @returns A new builder instance with currency configuration
     */
    setCurrency(
        currency: 'usd' | 'eur' | 'gbp' | 'auto',
        defaultCurrency: 'usd' | 'eur' | 'gbp' = 'usd',
        showInlineSelector: boolean = true
    ): Checkout {
        this.options = {
            ...this.options,
            show_inline_currency_selector: showInlineSelector,
            default_currency: defaultCurrency,
            currency: currency,
        };

        return this;
    }

    /**
     * Configures navigation and cancel behavior.
     *
     * @param cancelUrl URL for back button when in page mode
     * @param cancelIcon Custom cancel icon URL
     * @returns A new builder instance with navigation configuration
     */
    setCancelButton(cancelUrl?: string, cancelIcon?: string): Checkout {
        this.options = { ...this.options };

        if (cancelUrl !== undefined) {
            this.options.cancel_url = cancelUrl;
        }
        if (cancelIcon !== undefined) {
            this.options.cancel_icon = cancelIcon;
        }

        return this;
    }

    /**
     * Associates purchases with an affiliate account.
     *
     * @param userId Affiliate user ID
     * @returns A new builder instance with affiliate configuration
     */
    setAffiliate(userId: number): Checkout {
        this.options = {
            ...this.options,
            affiliate_user_id: userId,
        };

        return this;
    }

    /**
     * Sets a custom image/icon for the checkout.
     *
     * @param imageUrl Secure HTTPS URL to the image
     * @returns A new builder instance with custom image
     */
    setImage(imageUrl: string): Checkout {
        this.options = {
            ...this.options,
            image: imageUrl,
        };

        return this;
    }

    /**
     * Configures the checkout for license renewal.
     *
     * @param licenseKey The license key to renew
     * @returns A new builder instance configured for renewal
     */
    setLicenseRenewal(licenseKey: string): Checkout {
        this.options = {
            ...this.options,
            license_key: licenseKey,
        };

        return this;
    }

    /**
     * Builds and returns the final checkout options to be used with the `@freemius/checkout` package.
     *
     * @note - This is async by purpose so that we can allow for future enhancements that might require async operations.
     *
     * @returns The constructed CheckoutOptions object
     */
    getOptions(): CheckoutOptions {
        return { ...this.options };
    }

    /**
     * Generates a checkout link based on the current builder state.
     *
     * @note - This is async by purpose so that we can allow for future enhancements that might require async operations.
     */
    getLink(): string {
        const checkoutOptions = convertCheckoutOptionsToQueryParams(this.options);

        const queryParams = buildFreemiusQueryFromOptions(checkoutOptions);

        const url = new URL(`${this.getBaseUrl()}/product/${this.productId}/`);
        url.search = queryParams;

        return url.toString();
    }

    serialize(): CheckoutSerialized {
        return {
            options: this.getOptions(),
            link: this.getLink(),
            baseUrl: this.getBaseUrl(),
        };
    }

    private getBaseUrl(): string {
        return isTestServer() ? 'http://checkout.freemius-local.com:8080' : 'https://checkout.freemius.com';
    }
}
