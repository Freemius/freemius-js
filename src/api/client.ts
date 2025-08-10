import createClient from 'openapi-fetch';
import type { paths } from './schema';

export function createApiClient(baseUrl: string, bearerToken?: string) {
    return createClient<paths>({
        baseUrl,
        headers: {
            Authorization: bearerToken ? `Bearer ${bearerToken}` : undefined,
        },
    });
}

export type FsApiClient = ReturnType<typeof createApiClient>;
