# Freemius TypeScript SDK

Official, minimal TypeScript/JavaScript server SDK for integrating Freemius into SaaS & application backends. Provides
typed API access, hosted checkout helpers, webhook verification, purchase / license / entitlement retrieval, and
lightweight utilities – without imposing a framework.

## Installation

```bash
npm install @freemius/sdk
```

Requires Node.js 18+ (or an Edge runtime supporting Web Crypto + standard fetch APIs). See the
[official documentation](https://freemius.com/help/documentation/saas-sdk/js-sdk/) for full capability reference.

## Core Capabilities

Focused, framework‑agnostic primitives for securely interacting with the Freemius platform:

- [Typed API Client](https://freemius.com/help/documentation/saas-sdk/js-sdk/api/): Fine-tuned OpenAPI-derived API
  classes to easily interact with the [Freemius REST API](https://freemius.com/help/documentation/api/).
- [Checkout Utilities](https://freemius.com/help/documentation/saas-sdk/js-sdk/checkout/): Create Checkout URLs or
  Options for the Overlay mode, sandbox mode, redirect result parsing etc.
- [Webhook Processing](https://freemius.com/help/documentation/saas-sdk/js-sdk/webhooks/): HMAC‑SHA256 signature
  verification + event listener abstraction
- [Purchases & Entitlements](https://freemius.com/help/documentation/saas-sdk/js-sdk/purchases/): License retrieval,
  entitlement state validation, minimal model helpers

See the [full documentation](https://freemius.com/help/documentation/saas-sdk/js-sdk/) for all exported capabilities.

## Initialization

You must supply four credentials (obtainable via the Freemius Developer Dashboard):

- `productId` – Numeric product identifier
- `apiKey` – API key (used as bearer credential)
- `secretKey` – Secret key used for signing (HMAC) and secure operations
- `publicKey` – RSA public key for license / signature related verification flows

Recommended environment variables (example):

```
FREEMIUS_PRODUCT_ID=12345
FREEMIUS_API_KEY=...
FREEMIUS_SECRET_KEY=...
FREEMIUS_PUBLIC_KEY=-----BEGIN PUBLIC KEY-----...-----END PUBLIC KEY-----
```

> Hint: You can get the environment variables from the
> [Freemius Developer Dashboard](http://freemius.com/help/documentation/saas-sdk/js-sdk/installation/#retrieving-keys-from-the-developer-dashboard).

```ts
import { Freemius } from '@freemius/sdk';

export const freemius = new Freemius({
    productId: Number(process.env.FREEMIUS_PRODUCT_ID),
    apiKey: process.env.FREEMIUS_API_KEY!,
    secretKey: process.env.FREEMIUS_SECRET_KEY!,
    publicKey: process.env.FREEMIUS_PUBLIC_KEY!,
});
```

> **Edge runtimes**: ensure the secret material is not bundled client‑side; pass via secure runtime environment
> injection.

### API Client

```ts
async function getUserByEmail(email: string) {
    const user = await freemius.api.user.retrieveByEmail(email);
    // user has typed shape matching Freemius API spec
    return user;
}
```

See also `api.product`, `api.license`, `api.subscription`, `api.payment`, `api.user`, etc.

### Checkout

Construct a [hosted checkout URL](http://freemius.com/help/documentation/checkout/hosted-checkout/) or
[retrieve overlay options](http://freemius.com/help/documentation/checkout/freemius-checkout-buy-button/) (pair with
[`@freemius/checkout`](https://www.npmjs.com/package/@freemius/checkout?activeTab=readme) on the client):

```ts
const checkout = await freemius.checkout.create();
checkout.setCoupon({ code: 'SAVE10' });
checkout.setTrial('paid');

const hostedUrl = checkout.getLink(); // Redirect user or generate email link
const overlayOptions = checkout.getOptions(); // Serialize & send to frontend for modal embed
```

### Webhooks

Minimal Node HTTP example (raw body required for signature verification):

```ts
import { createServer } from 'node:http';

const listener = freemius.webhook.createListener();

listener.on('license.created', async ({ objects: { license } }) => {
    // Persist or sync license state in your datastore
    console.log('license.created', license.id);
});

const server = createServer(async (req, res) => {
    if (req.url === '/webhook' && req.method === 'POST') {
        await freemius.webhook.processNodeHttp(listener, req, res);
    } else {
        res.statusCode = 404;
        res.end('Not Found');
    }
});

server.listen(3000, () => {
    console.log('Webhook listener active on :3000');
});
```

### Pricing

Retrieve pricing metadata (plans, currencies, etc.):

```ts
async function fetchPricing() {
    return await freemius.pricing.retrieve();
}
```

Use this to create your own pricing table on your site.

### Purchase / License Retrieval

Resolve purchase data or validate entitlement status:

```ts
async function retrievePurchase(licenseId: number) {
    const purchase = await freemius.purchase.retrievePurchase(licenseId);
    if (!purchase) throw new Error('Purchase not found');
    return purchase;
}
```

## Security & Operational Notes

> Backend Use Only
>
> Never initialize the SDK in browser / untrusted contexts. The `secretKey` and `apiKey` are privileged credentials.

## Next.js / React Starter Kit Integration

For an end‑to‑end reference (auth, UI components, portal flows, pricing tables), consult the
[Next.js Integration Guide](https://freemius.com/help/documentation/saas-sdk/framework/nextjs/) and the accompanying
Starter Kit repository section.
