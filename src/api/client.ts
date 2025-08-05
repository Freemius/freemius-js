import createClient from 'openapi-fetch';
import type { paths } from './schema';

const API_ENDPOINT_PRODUCTION = 'https://api.freemius.com/v1/';
const API_ENDPOINT_TEST = 'http://api.freemius-local.com:8080/v1/';

export function createApiClient(isProduction: boolean, bearerToken?: string) {
    const apiEndpoint = isProduction ? API_ENDPOINT_PRODUCTION : API_ENDPOINT_TEST;

    return createClient<paths>({
        baseUrl: apiEndpoint,
        headers: {
            Authorization: bearerToken ? `Bearer ${bearerToken}` : undefined,
        },
    });
}
