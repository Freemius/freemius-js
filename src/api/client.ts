import createClient from 'openapi-fetch';
import type { paths } from './schema';

const API_ENDPOINT_PRODUCTION = 'https://api.freemius.com/v1/';
const API_ENDPOINT_TEST = 'http://api.freemius-local.com:8080/v1/';

export function createApiClient(bearerToken?: string) {
    const isTestServer = process.env.FS__INTERNAL__IS_DEVELOPMENT_MODE === 'true';

    const apiEndpoint = isTestServer ? API_ENDPOINT_TEST : API_ENDPOINT_PRODUCTION;

    return createClient<paths>({
        baseUrl: apiEndpoint,
        headers: {
            Authorization: bearerToken ? `Bearer ${bearerToken}` : undefined,
        },
    });
}

export type FsApiClient = ReturnType<typeof createApiClient>;
