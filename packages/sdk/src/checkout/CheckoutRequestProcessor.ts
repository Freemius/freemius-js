import { CheckoutAction } from '../contracts/checkout';
import { ActionError } from '../errors/ActionError';
import { PricingService } from '../services/PricingService';
import { PricingRetriever } from './PricingRetriever';
import { PurchaseService } from '../services/PurchaseService';
import { PurchaseCallback, PurchaseProcessor } from './PurchaseProcessor';
import { RedirectCallback, RedirectProcessor } from './RedirectProcessor';
import { RequestProcessor } from '../contracts/types';

export type CheckoutRequestConfig = {
    /**
     * The real public/proxy URL where the application is accessible from the internet.
     * This is useful for authenticating the Checkout Redirection requests.
     */
    proxyUrl?: string;
    /**
     * The function to be called when a purchase is made.
     */
    onPurchase?: PurchaseCallback;
    /**
     * The function to be called when a redirect is made after checkout.
     */
    onRedirect?: RedirectCallback;
    /**
     * Specifies a URL to redirect to after processing the redirect action. If not provided, it will redirect to the `proxyUrl` or the original request URL.
     */
    afterProcessUrl?: string;
};

export class CheckoutRequestProcessor implements RequestProcessor<CheckoutRequestConfig> {
    constructor(
        private readonly purchase: PurchaseService,
        private readonly pricing: PricingService,
        private readonly secretKey: string
    ) {}

    createProcessor(config: CheckoutRequestConfig): (request: Request) => Promise<Response> {
        return (request: Request) => this.process(config, request);
    }

    async process(config: CheckoutRequestConfig, request: Request): Promise<Response> {
        const url = new URL(request.url);
        const action = url.searchParams.get('action');

        if (!action) {
            return Response.json({ error: 'Action parameter is required' }, { status: 400 });
        }

        const actionHandlers: CheckoutAction[] = [
            this.getPricingRetriever(),
            this.getRedirectProcessor({
                proxyUrl: config.proxyUrl,
                callback: config.onRedirect,
                afterProcessUrl: config.afterProcessUrl,
            }),
            this.getPurchaseProcessor({ callback: config.onPurchase }),
        ];

        try {
            for (const actionHandler of actionHandlers) {
                if (actionHandler.canHandle(request)) {
                    return await actionHandler.processAction(request);
                }
            }
        } catch (error) {
            if (error instanceof ActionError) {
                return error.toResponse();
            }

            console.error('Error processing action:', error);
            return ActionError.internalError('Internal Server Error').toResponse();
        }

        return ActionError.badRequest('Unsupported action').toResponse();
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
     *     const data = await freemius.checkout.action.getRedirectProcessor({
     *          proxyUrl: 'https://xyz.ngrok-free.app',
     *          async callback(info) {
     *              // Handle the redirect info here, like creating a license, etc.
     *              // Return a Response object to override the default redirect behavior.
     *              return Response.redirect('/custom-success-page', 302);
     *          },
     *      });
     *
     *     return data.processAction(request);
     * }
     * ```
     */
    getRedirectProcessor(config: {
        proxyUrl?: string | undefined;
        callback?: RedirectCallback | undefined;
        afterProcessUrl?: string | undefined;
    }): RedirectProcessor {
        return new RedirectProcessor(this.secretKey, config.proxyUrl, config.callback, config.afterProcessUrl);
    }

    getPurchaseProcessor(config: { callback?: PurchaseCallback | undefined }): PurchaseProcessor {
        return new PurchaseProcessor(this.purchase, config.callback);
    }

    getPricingRetriever() {
        return new PricingRetriever(this.pricing);
    }
}
