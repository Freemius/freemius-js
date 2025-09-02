import { freemius } from './fs';

async function main() {
    const purchases = await freemius.purchase.retrieveSubscriptionsByEmail('swas@freemius.com');

    console.log('Active Purchases:', purchases);
}

main();
