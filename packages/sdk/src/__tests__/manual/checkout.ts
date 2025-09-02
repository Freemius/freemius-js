import { freemius } from './fs';

async function main() {
    const checkoutLink = freemius.checkout.create().inSandbox().toLink();
    console.log('Checkout Link:', checkoutLink);

    const checkoutOptions = await freemius.checkout.create().inSandbox().toOptions();
    console.log('Checkout Options:', checkoutOptions);
}

main();
