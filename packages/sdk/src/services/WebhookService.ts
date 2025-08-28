import { WebhookListener } from '../webhook/WebhookListener';

export class WebhookService {
    constructor(private readonly secretKey: string) {}

    createListener(onError?: (error: unknown) => void): WebhookListener {
        return new WebhookListener(this.secretKey, onError);
    }

    createRequestProcessor(listener: WebhookListener): (request: Request) => Promise<Response> {
        return (request: Request) => this.processFetch(listener, request);
    }

    /**
     * WHATWG Fetch API adapter for modern JavaScript environments.
     *
     * Compatible with:
     * - Next.js App Router (route.ts files)
     * - Cloudflare Workers
     * - Deno
     * - Bun
     * - Vercel Edge Functions
     * - Any environment supporting the WHATWG Fetch API
     *
     * This method reads the request body as text and processes the webhook,
     * returning a standard Response object that can be directly returned
     * from your endpoint handler.
     *
     * @param listener - The webhook listener instance
     * @param request - The incoming Request object (WHATWG Fetch API)
     * @returns A Response object with the webhook processing result
     *
     * @example
     * ```typescript
     * // Next.js App Router (app/webhook/route.ts)
     * export async function POST(request: Request) {
     *   const listener = webhookService.createListener();
     *   return await webhookService.processFetch(listener, request);
     * }
     *
     * // Cloudflare Workers
     * export default {
     *   async fetch(request: Request): Promise<Response> {
     *     if (new URL(request.url).pathname === '/webhook') {
     *       const listener = webhookService.createListener();
     *       return await webhookService.processFetch(listener, request);
     *     }
     *     return new Response('Not Found', { status: 404 });
     *   }
     * };
     * ```
     */
    async processFetch(listener: WebhookListener, request: Request): Promise<Response> {
        const rawBody = await request.text();
        const result = await listener.process({ headers: request.headers, rawBody });

        return new Response(JSON.stringify(result), {
            status: result.status,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    /**
     * Native Node.js HTTP server adapter.
     *
     * Reads the raw body from the request stream and writes the HTTP response directly.
     *
     * @example
     * ```typescript
     * import { createServer } from 'http';
     *
     * const server = createServer(async (req, res) => {
     *   if (req.url === '/webhook') {
     *     await freemius.webhook.processNodeHttp(listener, req, res);
     *   }
     * });
     * ```
     */
    async processNodeHttp(
        listener: WebhookListener,
        req: import('http').IncomingMessage,
        res: import('http').ServerResponse
    ): Promise<void> {
        // Read the raw body from the request stream
        const chunks: Buffer[] = [];
        for await (const chunk of req) {
            chunks.push(chunk);
        }

        const rawBody = Buffer.concat(chunks);

        const result = await listener.process({ headers: req.headers, rawBody });

        res.statusCode = result.status;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(result));
    }

    // @todo - Implement other adapters.

    // /**
    //  * Express adapter.
    //  * Route MUST use: express.raw({ type: '* / *' })
    //  * Writes the HTTP response directly.
    //  */
    // async fromExpress(
    //     listener: WebhookListener,
    //     req: import('express').Request,
    //     res: import('express').Response
    // ): Promise<void> {
    //     const { status, ...body } = await listener.process({ headers: req.headers as any, rawBody: req.body });
    //     res.status(status).json(body);
    // }

    // /**
    //  * Fastify adapter.
    //  * Must register raw buffer parser:
    //  * fastify.addContentTypeParser('* /*', { parseAs: 'buffer' }, (_req, body, done) => done(null, body))
    //  * Writes the HTTP response directly.
    //  */
    // async fromFastify(
    //     listener: WebhookListener,
    //     request: { headers: Record<string, string | string[] | undefined>; body: Buffer },
    //     reply: { code: (n: number) => any; send: (payload: any) => any }
    // ): Promise<void> {
    //     const { status, ...body } = await listener.process({ headers: request.headers, rawBody: request.body });
    //     reply.code(status).send(body);
    // }
}
