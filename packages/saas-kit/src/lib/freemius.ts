import { Freemius } from '@freemius/sdk';

/**
 * Freemius SDK instance for the Next.js application.
 *
 * Check the .env.sample file for required environment variables.
 */
export const freemius = new Freemius(
    process.env.FS__PRODUCT_ID!,
    process.env.FS__API_KEY!,
    process.env.FS__SECRET_KEY!,
    process.env.FS__PUBLIC_KEY!
);
