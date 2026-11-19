import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { Freemius, MigrationSource, type LicenseMigrationResult, type UserEntity } from '../index';

const server = setupServer();
const usersUrl = 'https://fast-api.freemius.com/v1/products/123/users.json';
const licensesUrl = 'https://fast-api.freemius.com/v1/products/123/plans/456/pricing/789/licenses.json';

function createFreemius() {
    return new Freemius({
        productId: 123,
        apiKey: 'test-api-key',
        secretKey: 'x'.repeat(32),
        publicKey: 'test-public',
    });
}

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
beforeEach(() => vi.stubEnv('FREEMIUS_INTERNAL__IS_DEVELOPMENT_MODE', undefined));
afterEach(() => {
    server.resetHandlers();
    vi.unstubAllEnvs();
});
afterAll(() => server.close());

it('keeps both migration routes on the API endpoint selected in development mode', async () => {
    const testBaseUrl = 'http://api.freemius-local.com:8080/v1/';
    vi.stubEnv('FREEMIUS_INTERNAL__IS_DEVELOPMENT_MODE', 'true');
    const { api } = createFreemius();
    vi.stubEnv('FREEMIUS_INTERNAL__IS_DEVELOPMENT_MODE', undefined);

    const user = { id: '101' };
    const license = { id: '201' };
    server.use(
        http.post(`${testBaseUrl}products/123/users.json`, () => HttpResponse.json(user, { status: 201 })),
        http.post(`${testBaseUrl}products/123/plans/456/pricing/789/licenses.json`, () =>
            HttpResponse.json(license, { status: 201 })
        )
    );

    expect(api.baseUrl).toBe(testBaseUrl);
    await expect(api.user.migrate(MigrationSource.LEMON_SQUEEZY, { email: 'ada@example.com' })).resolves.toEqual(user);
    await expect(
        api.license.migrate(MigrationSource.LEMON_SQUEEZY, { plan_id: 456, pricing_id: 789, period: 0 })
    ).resolves.toEqual(license);
});

describe('user.migrate', () => {
    const payload = { email: 'ada@example.com', name: 'Ada Lovelace', is_marketing_allowed: false };

    it('sends the source and migration flag and returns the created user', async () => {
        const user = { id: '101', email: payload.email, first: 'Ada', last: 'Lovelace' } satisfies UserEntity;
        server.use(
            http.post(usersUrl, async ({ request }) => {
                expect(request.headers.get('authorization')).toBe('Bearer test-api-key');
                expect(await request.json()).toEqual({ ...payload, source: 'ls', is_migration: true });
                return HttpResponse.json(user, { status: 201 });
            })
        );

        await expect(createFreemius().api.user.migrate(MigrationSource.LEMON_SQUEEZY, payload)).resolves.toEqual(user);
    });

    it('returns null when the API rejects the request', async () => {
        server.use(http.post(usersUrl, () => HttpResponse.json({ error: { code: 'invalid_email' } }, { status: 400 })));

        await expect(createFreemius().api.user.migrate(MigrationSource.LEMON_SQUEEZY, payload)).resolves.toBeNull();
    });
});

describe('license.migrate', () => {
    const body = {
        email: 'ada@example.com',
        period: 0,
        license_key: 'legacy-key',
        send_email: false,
        existing_install_id: '321',
    } as const;
    const payload = { ...body, plan_id: '456', pricing_id: 789n };
    const license = {
        id: '201',
        user_id: '101',
        secret_key: body.license_key,
        source: 11,
        is_free_localhost: true,
        is_block_features: true,
        parent_license_id: '301',
    } satisfies LicenseMigrationResult;

    it('sends the source name and returns the created license', async () => {
        server.use(
            http.post(licensesUrl, async ({ request }) => {
                expect(await request.json()).toEqual({ ...body, source: 'lemonsqueezy' });
                return HttpResponse.json(license, { status: 201 });
            })
        );

        await expect(createFreemius().api.license.migrate('lemonsqueezy', payload)).resolves.toEqual(license);
    });

    it('returns null when the API rejects the request', async () => {
        server.use(
            http.post(licensesUrl, () => HttpResponse.json({ error: { code: 'invalid_license' } }, { status: 400 }))
        );

        await expect(createFreemius().api.license.migrate(MigrationSource.LEMON_SQUEEZY, payload)).resolves.toBeNull();
    });
});
