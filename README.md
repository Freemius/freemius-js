# Project wide @todo (after webinar)

1. Implement the testing framework.
2. Go through all components and ensure they have proper BEM like class names.
3. Make sure all public methods have proper JSDoc comments.

# Question for Vova

- The `dispute_won` is reversed for the buyer?

# Vova - Feedback

1. Don't use license terminology in the UI.

## Priority & Webinar:

**SDK/SaaS Starter Kit**:

1. ✅ Customer Portal - https://drive.google.com/drive/u/0/folders/1FooXNfTD1vhMlNqgKn5bIyzKRBzvOejz
2. ✅ PayWall
3. Checkout
    1. ✅ Open in full screen
    2. When they complete we don't show the second screen. (Let's aim for it).
4. ✅ Webhooks
5. ✅ License management with webhooks.
6. ✅ Finish Find User By Email & Get Purchase Info and create a sync action.
7. ✅ Refactor the checkout config builder.
8. ✅ Create Checkout Redirection Processer.
9. ✅ Create the mono repo
10. ✅ Create the Shadcn registry
11. Create deployment tooling with auto version bumping
12. Make the SDK work with the UI starter kit (`@freemius/saas-kit`).
    1. Finish the action parts of the customer portal.
    2. See if the paywall can be ported to the UI starter kit (minimalist pricing table).
    3. See if restore action can be ported to the UI starter kit.

**Webinar**:

1. How to setup the starter kit (nextjs official saas starter and nextra for website/doc).
2. Building a simple SaaS AI chat app (with copy-paste code).
    1. Explain the starter kit
    2. Explain the backend (Node, DB, ORM)
3. How to add payments using Freemius SDK & Checkout & SaaS starter kit.
    1. Create SaaS app in Freemius.
    2. Configure the product in Freemius.
4. Where to deploy (Vercel & Prisma).

# Dror - Feedback

1. In confirm-purchase/route.ts have some sort of a `if` check before calling `processNewFreemiusLicense` to ensure that
   it is not called all the time. (eg, have auth required, also some signature etc.)
2. Follow up with the Checkout JS/iFrame with a way to authenticate the postMessage payload and pass all needed data
   (license, subscription, user, etc.) to the frontend with the signature.
3. Talk with Vova to see if we use pricing page to solve the credit problem or just go with monthly or create another
   plan with annual credits. (Two separate plans, one for monthly and one for annual)

# POC - Proof of Concept

The following features will be implemented in this POC:

1. **Checkout**: A Checkout class that will help with generating Checkout URLs and config for the JS SDK (Frontend).
2. **Webhooks**: A webhook handler that will process incoming webhook events.
3. **API**: A generated API from the OpenAPI specification.

## Tech Stack

- Next.js for the frontend/backend.
- Prisma & PostgreSQL for the database.
- Better Auth for user authentication.
- Freemius Node SDK for the SaaS management.

## User Flow

The UI/design will follow shadcn/ui components, which are simple and easy to use. Also it will give nice look and feel
to the application.

### Login/Signup

- Will use the `better-auth` package to handle user authentication.
- Users will be able to log in or sign up using their email and password.

### Dummy SaaS App

- A simple button on the front-end that will trigger some action.
    - It can be a dummy UI that says "Generate Asset[IMAGE/Video/Audio]" as if it was an AI app.
- Backend will check if the user is subscribed.
- If yes, then the action will be performed.
- If no, it will show a dialog message prompting the user to subscribe.

### Checkout

- The dialog will have a button that will start the Overlay Checkout flow.
- The Checkout will load in sandbox mode. ???(I need an API endpoint to generate sandbox tokens, asking for the product
  secret key & public key is also an option)???
- Upon completion, the user will see a confirmation message and the action will be performed.

## Simple User Profile (Customer Portal)

- Show the current subscription status.
- Allow to upgrade to a different plan.

## Webhooks

We will have a simple webhook listener at `/webhooks` that will handle incoming webhook events. The handler will:

- `license.created`: Update the user's subscription status.
- `license.plan.changed`: Update the user's subscription plan.
- `license.extended`, `license.shortened`: Update the user's subscription duration.
- `license.expired`: Sync the user's subscription status to expired.
- `license.deleted`, `license-cancelled`: Sync the user's subscription status to cancelled.

> Example:
>
> 1. Customer asks for a refund, maker does it from the Developer Dashboard and the SaaS is syncronized.
> 2. When payments are made for a subscription, the webhook will notify the SaaS to update user's license.

## Credit Based Workflow

- Some Plans will give recurring credits per billing cycle.
- Top up plans to purchase additional credits.
- Clicking the dummy button will check if the user has enough credits, if so will perform the action, otherwise will
  show a dialog prompting the user to top up their credits.

> Note: Show the monthly credit susbcription along with the topup plans, don't demo the annual because the UX doesn't
> support it yet.

## Sample SDK Code

The following just demonstrates how the SDK can be used in a simple way. It can change as I develop the system, but from
the top of my head, these will be needed for the MVP.

### Initialization

```ts
import { Freemius } from '@freemius/sdk';

export const freemius = new Freemius({
    productId: process.env.FREEMIUS_PRODUCT_ID,
    apiKey: process.env.FREEMIUS_API_KEY, // ???We don't really need this, as we can generate the API key from the secret key and public key???
    /// ???I think if we can omit the secret key and public key, we can just use the product ID and API key, it'd be better???
    publicKey: process.env.FREEMIUS_PUBLIC_KEY,
    secretKey: process.env.FREEMIUS_SECRET_KEY,
});
```

### Find License, User & Subscriptions

```ts
const license = await freemius.api.licenses.findById(licenseId);
const user = await freemius.api.users.findById(license.user_id);
const subscription = await freemius.api.subscriptions.findByLicenseId(licenseId);
```

### Checkout Params

```ts
const sandboxParams = freemius.checkout.getSandboxParams();
const licenseUpgradeParams = freemius.checkout.getLicenseUpgradeParams(licenseId);
```

### Webhook Handler

```ts
const listener = freemius.createWebhookListener();

listener.on('license.created', async ({ license, user }) => {
    // Handle license created event
    prisma.license.createOrUpdate({
        where: { external_id: license.id, user_id: user.id },
        data: {
            planId: license.plan_id,
            status: license.status,
            expiresAt: license.expires_at ? new Date(license.expires_at) : null,
        },
    });
});

listener.on('license.plan.changed', async ({ license, user }) => {
    // Handle license plan changed event
});

listener.process(req, res);
```

## API Generator

Before we can generate the API, we need to do minor fixes.

- Type & API Client generation: https://openapi-ts.dev/introduction (Preferred)
- https://github.com/hey-api/openapi-ts (Preferred: https://heyapi.dev/openapi-ts/output)
- Oazapfts

# Phase 2

**For Later Phase**:

1. **Pricing Table**: A set of components to display pricing information.
2. **Customer Portal**: A set of classes to ease getting started with the Customer Portal.
3. **Generated API SDK**: The `freemius.api` will have access to all resources and schema. We need to do some minor
   fixing to our spec.
