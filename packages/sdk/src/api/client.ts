import createClient from 'openapi-fetch';
import type { paths } from './schema';
import { version } from '../../package.json';

function detectPlatform(): string {
    // Check for Bun runtime
    if (typeof globalThis !== 'undefined' && 'Bun' in globalThis) return 'Bun';

    // Check for Deno runtime
    if (typeof globalThis !== 'undefined' && 'Deno' in globalThis) return 'Deno';

    // Check for Node.js
    if (
        typeof globalThis !== 'undefined' &&
        'process' in globalThis &&
        globalThis.process &&
        typeof globalThis.process === 'object' &&
        'versions' in globalThis.process &&
        globalThis.process.versions &&
        'node' in globalThis.process.versions
    ) {
        return 'Node';
    }

    // Check for browser environment
    if (typeof globalThis !== 'undefined' && 'window' in globalThis) return 'Browser';

    return 'Unknown';
}

export function createApiClient(baseUrl: string, bearerToken?: string) {
    const platform = detectPlatform();
    const client = createClient<paths>({
        baseUrl,
        headers: {
            Authorization: bearerToken ? `Bearer ${bearerToken}` : undefined,
            'User-Agent': `Freemius/JS-SDK/${version}/${platform}`,
        },
    });

    return client;
}

export type FsApiClient = ReturnType<typeof createApiClient>;
