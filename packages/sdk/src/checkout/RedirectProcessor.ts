import { createHmac, timingSafeEqual } from 'crypto';
import { CheckoutRedirectInfo } from '../models/CheckoutRedirectInfo';
import { CheckoutAction } from '../contracts/checkout';
import { ActionError } from '../errors/ActionError';

export type RedirectCallback = (info: CheckoutRedirectInfo) => Promise<Response | void>;

export class RedirectProcessor implements CheckoutAction {
    constructor(
        private readonly secretKey: string,
        private readonly proxyUrl?: string,
        private readonly callback?: RedirectCallback,
        private readonly afterProcessUrl?: string
    ) {}

    canHandle(request: Request): boolean {
        const url = new URL(request.url);

        return request.method === 'GET' && url.searchParams.has('signature');
    }

    async processAction(request: Request): Promise<Response> {
        const info = await this.getRedirectInfo(request.url);

        if (!info) {
            throw ActionError.badRequest('Invalid or missing redirect signature');
        }

        if (this.callback) {
            const callbackResponse = await this.callback(info);

            if (callbackResponse) {
                return callbackResponse;
            }
        }

        const url = new URL(this.afterProcessUrl ?? this.proxyUrl ?? request.url);

        // Delete all existing search params
        url.search = '';

        // Add new search params
        url.searchParams.set('plan', info.plan_id);
        url.searchParams.set('is_subscription', info.isSubscription() ? '1' : '0');
        url.searchParams.set('quote', info.quota?.toString() ?? '0');

        // Default response if no callback is provided or callback does not return a response
        return Response.redirect(url.href, 302);
    }

    async getRedirectInfo(currentUrl: string): Promise<CheckoutRedirectInfo | null> {
        const url = new URL(
            currentUrl
                // Handle spaces in the URL, which may be encoded as %20 or +
                .replace(/%20/g, '+')
        );

        const signature = url.searchParams.get('signature');

        if (!signature) {
            return null;
        }

        // Replace URL parts if proxyUrl is set. This is useful when your app is behind a proxy (which is common).
        if (this.proxyUrl) {
            const proxy = new URL(this.proxyUrl);
            url.protocol = proxy.protocol;
            url.host = proxy.host;
            url.port = proxy.port;
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
    getCleanUrl(url: string): string {
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
