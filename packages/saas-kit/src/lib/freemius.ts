import { Freemius } from '@freemius/sdk';

/**
 * Freemius SDK instance for the Next.js application.
 *
 * Check the .env.sample file for required environment variables.
 */
export const freemius = new Freemius({
    productId: process.env.FREEMIUS_PRODUCT_ID!,
    apiKey: process.env.FREEMIUS_API_KEY!,
    secretKey: process.env.FREEMIUS_SECRET_KEY!,
    publicKey: process.env.FREEMIUS_PUBLIC_KEY!,
});
