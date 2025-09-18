# Contributing to Freemius React Starter Kit

The application made in Next.js has the following structure:

1. Uses [Better-Auth](https://www.better-auth.com/) for authentication and user management.
2. Uses [Prisma](https://www.prisma.io/) as the ORM to interact with the database.
3. Integrates with [Freemius](https://freemius.com/) for handling subscriptions, one-off purchases, and customer
   portals.

## Understanding the Pricing Model

You need to create a SaaS product in Freemius to get the required API keys and set up your pricing plans.

### Subscription Plans

We will have the following three plans for subscriptions:

1. Starter: 4.99 USD/month or 49.99 USD/year
2. Professional: 12.99 USD/month or 129.99 USD/year
3. Business: 24.99 USD/month or 249.99 USD/year

Each subscription will come with it's own entitlement managed by the SaaS application.

### Credit Top-Up Plan

Additionally we will have a one-off purchase plan for credit top-ups with the following quotas:

1. 1000 Credits: 8 USD
2. 5000 Credits: 30 USD
3. 10000 Credits: 50 USD

Now go to the Freemius Dashboard and create a new SaaS product with the above pricing plans. Make sure to note down the
pricing IDs as we will need them later.

## Setting Up the Environment

Copy the `.env.example` file to `.env` and fill in the required environment variables:

```bash
cp .env.example .env
```

- `FREEMIUS_PRICING_ID_STARTER` = The Pricing ID for the Starter subscription plan.
- `FREEMIUS_PRICING_ID_PROFESSIONAL` = The Pricing ID for the Professional subscription plan.
- `FREEMIUS_PRICING_ID_BUSINESS` = The Pricing ID for the Business subscription plan.
- `FREEMIUS_PRICING_ID_TOPUP_1000` = The Pricing ID for the 1000 Credits top-up plan.
- `FREEMIUS_PRICING_ID_TOPUP_5000` = The Pricing ID for the 5000 Credits top-up plan.
- `FREEMIUS_PRICING_ID_TOPUP_10000` = The Pricing ID for the 10000 Credits top-up plan.

## Running the Application

You need to have the Database set up and the Prisma migrations applied. You can use the following commands:

```bash
docker compose up -d
npx prisma migrate deploy
```

Then, install the dependencies and start the development server:

```bash
npm ci
npm run dev
```

The application should now be running at `http://localhost:3001`.

To reset the local DB of the application, you can use:

```bash
npx prisma migrate reset
```

## Understanding the flow of the application

1. The application demos an AI chat bot where users can chat with the bot and consume credits for each message.
1. The application will work without signing in.
1. If you try to use the chat bot without signing in, you will be prompted to sign in or sign up.
1. Once signed in, you will start with a free trial of 100 credits.
1. You can then choose to subscribe to a plan or top-up your credits using the paywall.
1. The application will manage your entitlements based on your subscriptions and purchases.
1. You can manage your subscriptions and view your purchase history in the customer portal.
