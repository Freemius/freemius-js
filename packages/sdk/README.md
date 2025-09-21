<div align="center">

<picture>
  <source media="(prefers-color-scheme: light)" srcset="https://freemius.com/help/img/freemius-logo.svg">
  <source media="(prefers-color-scheme: dark)" srcset="https://freemius.com/help/img/freemius-logo-dark.svg">
  <img alt="Freemius Logo" src="https://freemius.com/help/img/freemius-logo.svg" width="200">
</picture>

## [JavaScript SDK](https://freemius.com/help/documentation/saas-sdk/js-sdk/)

Monetize your SaaS or app backend faster: one lightweight, fully typed SDK for Checkout creation, pricing + plans,
licenses, subscriptions, purchases, entitlements, and secure webhooks. Built for real-world production flows.

[![npm version](https://img.shields.io/npm/v/@freemius/sdk.svg?label=@freemius/sdk)](https://www.npmjs.com/package/@freemius/sdk)
![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?logo=typescript&logoColor=white)

**[Get Started »](https://freemius.com/help/documentation/saas-sdk/js-sdk/)** ·
**[Next.js Guide »](https://freemius.com/help/documentation/saas-sdk/framework/nextjs/)** ·
**[React Starter Kit »](https://freemius.com/help/documentation/saas-sdk/react-starter/)**

</div>

---

![Freemius Paywall Component](https://github.com/Freemius/freemius-js/raw/main/freemius-paywall.png)

---

Looking for a step‑by‑step walkthrough of backend checkout generation, secure purchase validation, local entitlement
storage, webhook‑driven license lifecycle syncing, and feature gating logic? Check out the guides below.

- [Next.js / React Starter Kit](https://freemius.com/help/documentation/saas-sdk/framework/nextjs/) Integration.
- [Framework Agnostic](https://freemius.com/help/documentation/saas-sdk/js-sdk/integration/) Integration.

We also have the [React Starter Kit](https://freemius.com/help/documentation/saas-sdk/react-starter/) you can use on
your front-end to quickly render Checkout overlays, pricing tables, and a customer portal.

## Why `@freemius/sdk`?

- 🔐 Backend‑only & secure: built to keep your API / Secret keys off the client.
- 🧠 Fully typed: rich IntelliSense for API filters, webhook payloads, pricing, licenses, subscriptions, payments, and
  users.
- 🛒 Frictionless Checkout builder: generate overlay options & hosted links, sandbox mode, redirect verification,
  upgrade authorization.
- 💳 Subscriptions & one‑off purchases: normalize purchase + entitlement logic with helpers (e.g.
  `purchase.retrievePurchaseData()`, `entitlement.getActive()`).
- 🧱 Framework friendly: works great with Next.js (App Router), Express, Fastify, Hono, Nuxt server routes, Workers,
  etc.
- 🧾 Licenses, billing & invoices: retrieve, paginate, iterate, and show billing data to your customers.
- 🌐 Webhooks made simple: strongly typed listener + request processors for Fetch runtimes, Node HTTP, serverless, edge.
- ⚡ Runtime agnostic: Node.js, Bun, Deno—ship the same code.
- 🪶 Lightweight, modern ESM-first design (tree-shakeable patterns).
- 🚀 Production patterns included: entitlement storage, retrieval & paywalls.

## Installation

```bash
npm install @freemius/sdk @freemius/checkout zod
```

Requires Node.js 18+ (or an Edge runtime supporting Web Crypto + standard fetch APIs). See the
[official documentation](https://freemius.com/help/documentation/saas-sdk/js-sdk/) for full capability reference.

## 10 Seconds Initialization

Go to the
[Freemius Developer Dashboard](https://freemius.com/help/documentation/saas-sdk/js-sdk/installation/#retrieving-keys-from-the-developer-dashboard))
and obtain the following:

- `productId` – Numeric product identifier
- `apiKey` – API key (used as bearer credential)
- `secretKey` – Secret key used for signing (HMAC) and secure operations
- `publicKey` – RSA public key for license / signature related verification flows

Store these in your environment variables, e.g. in a `.env` file:

```env
FREEMIUS_PRODUCT_ID=12345
FREEMIUS_API_KEY=...
FREEMIUS_SECRET_KEY=...
FREEMIUS_PUBLIC_KEY=...
```

Now initialize the SDK:

```ts
import { Freemius } from '@freemius/sdk';

export const freemius = new Freemius({
    productId: Number(process.env.FREEMIUS_PRODUCT_ID),
    apiKey: process.env.FREEMIUS_API_KEY!,
    secretKey: process.env.FREEMIUS_SECRET_KEY!,
    publicKey: process.env.FREEMIUS_PUBLIC_KEY!,
});
```

### API Client

```ts
async function getUserByEmail(email: string) {
    const user = await freemius.api.user.retrieveByEmail(email);
    // user has typed shape matching Freemius API spec
    return user;
}
```

See also `api.product`, `api.license`, `api.subscription`, `api.payment`, `api.user`, etc.

[Documentation »](http://freemius.com/help/documentation/saas-sdk/js-sdk/api/)

### Checkout & Pricing

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

Retrieve pricing metadata (plans, currencies, etc.):

```ts
async function fetchPricing() {
    return await freemius.pricing.retrieve();
}
```

Use this to create your own pricing table on your site.

[Documentation »](http://freemius.com/help/documentation/saas-sdk/js-sdk/checkout/)

### Webhooks

Listen for and securely process webhook events. Example using Node.js HTTP server:

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

[Documentation »](http://freemius.com/help/documentation/saas-sdk/js-sdk/webhooks/)

### Purchase / License Retrieval

Resolve purchase data or validate entitlement status:

```ts
async function retrievePurchase(licenseId: number) {
    const purchase = await freemius.purchase.retrievePurchase(licenseId);
    if (!purchase) throw new Error('Purchase not found');
    return purchase;
}

const purchase = await retrievePurchase(123456);
if (purchase) {
    db.entitlement.insert(purchase.toEntitlementRecord());
}

async function getActiveEntitlement(userId: number) {
    const entitlements = await db.entitlement.query({ userId, type: 'subscription' });

    return freemius.entitlement.getActive(entitlements);
}
```

[Documentation »](http://freemius.com/help/documentation/saas-sdk/js-sdk/purchases/)

## Security & Operational Notes

> **Backend Use Only**
>
> Never initialize the SDK in browser / untrusted contexts. The `secretKey` and `apiKey` are privileged credentials.

Happy shipping. ⚡

## License

MIT © Freemius Inc

---

Payments, tax handling, subscription lifecycle management, and licensing are abstracted so you can focus on product
functionality rather than billing infrastructure.

https://freemius.com
