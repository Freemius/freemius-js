import 'dotenv/config';
import { Freemius } from '../..';

const freemius = new Freemius(
    process.env.FS__PRODUCT_ID!,
    process.env.FS__API_KEY!,
    process.env.FS__SECRET_KEY!,
    process.env.FS__PUBLIC_KEY!
);

async function main() {
    const purchases = await freemius.purchase.retrieveActiveSubscriptionsByEmail('swas@freemius.com');

    console.log('Active Purchases:', purchases);
}

main();
