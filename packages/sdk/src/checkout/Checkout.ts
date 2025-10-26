import {
    CheckoutOptions,
    CheckoutPopupParams,
    convertCheckoutOptionsToQueryParams,
    buildFreemiusQueryFromOptions,
} from '@freemius/checkout';
import { isTestServer, splitName } from '../utils/ops';
import { CheckoutBuilderUserOptions } from '../contracts/checkout';
import { FSId } from '../api/types';

export type CheckoutSerialized = {
    options: CheckoutOptions;
    link: string;
    baseUrl: string;
};

export type CheckoutLicenseAuthorization = { licenseId: FSId; authorization: string };

/**
 * A builder class for constructing checkout parameters. This class provides a fluent
 * API to create Checkout parameters for a product with various configurations.
 *
 * Every method returns the existing instance of the builder for chainability,
 * The final `getOptions()` method returns the constructed `CheckoutOptions` object.
 */
export class Checkout {
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
     */
    setSandbox(sandbox: NonNullable<CheckoutPopupParams['sandbox']>): Checkout {
        this.options = {
            ...this.options,
            sandbox,
        };

        return this;
    }

    /**
     * Sets user information for the checkout session.
     *
     * @param user User object with email and optional name fields. The shape matches the session from `better-auth` or next-auth packages. Also handles `null` or `undefined` gracefully.
     * @param readonly If true, the user information will be read-only in the checkout session.
     *
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
     */
    setImage(imageUrl: string): Checkout {
        this.options = {
            ...this.options,
            image: imageUrl,
        };

        return this;
    }

    /**
     * Configures the checkout for license renewal or upgrade by the license key.
     *
     * @note - This is less secure since it exposes the license key to the client. Use only in authenticated contexts.
     *
     * @param licenseKey The license key to renew
     */
    setLicenseUpgradeByKey(licenseKey: string): Checkout {
        this.options = {
            ...this.options,
            license_key: licenseKey,
        };

        return this;
    }

    /**
     * Configures the checkout for license upgrade using an authorization token.
     *
     * @param params The license upgrade authorization parameters
     */
    setLicenseUpgradeByAuth(params: CheckoutLicenseAuthorization): Checkout {
        this.options = {
            ...this.options,
            license_id: params.licenseId,
            authorization: params.authorization,
        };

        return this;
    }

    /**
     * Builds and returns the final checkout options to be used with the `@freemius/checkout` package.
     *
     * @returns The constructed CheckoutOptions object
     */
    getOptions(): CheckoutOptions {
        return { ...this.options };
    }

    /**
     * Generates a checkout link based on the current builder state.
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
