import createClient, { Middleware } from 'openapi-fetch';
import type { paths } from './schema';
import { version } from '../../package.json';

const middleware: Middleware = {
    async onRequest({ request }) {
        const originalUrl = new URL(request.url);

        // Add a `sdk_version` query parameter to every request
        originalUrl.searchParams.set('sdk_version', version);

        return new Request(originalUrl, request);
    },
};

export function createApiClient(baseUrl: string, bearerToken?: string) {
    const client = createClient<paths>({
        baseUrl,
        headers: {
            Authorization: bearerToken ? `Bearer ${bearerToken}` : undefined,
            'User-Agent': `Freemius/JS-SDK`,
        },
    });

    client.use(middleware);

    return client;
}

export type FsApiClient = ReturnType<typeof createApiClient>;
