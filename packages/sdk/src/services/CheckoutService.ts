import { CheckoutPopupParams } from '@freemius/checkout';
import { FSId } from '../api/types';
import { idToString } from '../api/parser';
import { Checkout, CheckoutLicenseAuthorization } from '../checkout/Checkout';
import { CheckoutBuilderOptions } from '../contracts/checkout';
import { PurchaseService } from './PurchaseService';
import { PricingService } from './PricingService';
import { CheckoutRequestProcessor } from '../checkout/CheckoutRequestProcessor';
import { RedirectProcessor } from '../checkout/RedirectProcessor';
import { createHash } from 'crypto';
import { ApiService } from './ApiService';

export class CheckoutService {
    public readonly request: CheckoutRequestProcessor;

    constructor(
        private readonly api: ApiService,
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
     * const checkout = await freemius.checkout.create({user: session?.user})
     *   .getOptions(); // Or .getLink() for a hosted checkout link
     * ```
     *
     * @example
     * Advanced configuration: You can also skip the convenience options and rather use the builder directly to configure the checkout.
     *
     * ```typescript
     * const checkout = freemius.checkout.create()
     *   .setUser(user, true)
     *   .setPlan('1234')
     *   .setCoupon({
     *     code: 'DISCOUNT2023',
     *     hideUI: false
     *   })
     *   .setSandbox()
     *   .getOptions();
     * ```
     *
     * @example
     */
    async create(options: CheckoutBuilderOptions = {}): Promise<Checkout> {
        const {
            user,
            isSandbox = false,
            withRecommendation = true,
            title,
            image,
            planId,
            quota,
            trial,
            licenseId,
        } = options;

        const builder = new Checkout(idToString(this.productId), this.publicKey, this.secretKey);

        if (user) {
            builder.setUser(user, true);
        }

        if (withRecommendation) {
            builder.setRecommendations();
        }

        if (isSandbox) {
            builder.setSandbox(await this.getSandboxParams());
        }

        if (title) {
            builder.setTitle(title);
        }

        if (image) {
            builder.setImage(image);
        }

        if (planId) {
            builder.setPlan(planId);
        }

        if (quota) {
            builder.setQuota(quota);
        }

        if (trial) {
            builder.setTrial(trial);
        }

        if (licenseId) {
            const authorization = await this.getLicenseUpgradeAuth(licenseId);
            builder.setLicenseUpgradeByAuth(authorization);
        }

        return builder;
    }

    /**
     * Retrieves the sandbox parameters for the checkout.
     *
     * This shouldn't be used in production, but is useful for testing purposes.
     *
     * @note This is intentionally set as `async` because we would use the API in the future to generate more fine grained sandbox params (for example for a specific email address only).
     */
    async getSandboxParams(): Promise<NonNullable<CheckoutPopupParams['sandbox']>> {
        const productId = idToString(this.productId);
        const timestamp = Math.floor(Date.now() / 1000).toString();
        const token = `${timestamp}${productId}${this.secretKey}${this.publicKey}checkout`;

        return {
            ctx: timestamp,
            token: createHash('md5').update(token).digest('hex'),
        };
    }

    /**
     * Retrieves the license upgrade authorization for a given license ID.
     *
     * This is used to authorize a license upgrade during the checkout process. Useful when creating upgrade links for existing users.
     */
    async getLicenseUpgradeAuth(licenseId: FSId): Promise<CheckoutLicenseAuthorization> {
        const auth = await this.api.license.retrieveCheckoutUpgradeAuthorization(licenseId);

        if (!auth) {
            throw new Error('Failed to retrieve license upgrade authorization');
        }

        return {
            licenseId,
            authorization: auth,
        };
    }

    /**
     * Processes a redirect URL and returns the checkout redirect information if valid.
     *
     * This is useful for handling redirects from the checkout portal back to your application.
     *
     * @param url The current URL to process.
     * @param proxyUrl Optional proxy URL to replace parts of the URL for signature verification.
     *
     * @returns A promise that resolves to the checkout redirect information or null if invalid.
     *
     * @example
     * ```typescript
     * const redirectInfo = await freemius.checkout.processRedirect(window.location.href);
     *
     * if (redirectInfo) {
     *   // Handle valid redirect info
     * } else {
     *   // Handle invalid or missing redirect info
     * }
     * ```
     */
    processRedirect(url: string, proxyUrl?: string) {
        const processor = new RedirectProcessor(this.secretKey, proxyUrl);
        return processor.getRedirectInfo(url);
    }
}
