import 'dotenv/config';
import { Freemius } from '../..';

const freemius = new Freemius(
    process.env.FS__PRODUCT_ID!,
    process.env.FS__API_KEY!,
    process.env.FS__SECRET_KEY!,
    process.env.FS__PUBLIC_KEY!
);

async function main() {
    const checkoutLink = freemius.checkout.create().inSandbox().toLink();
    console.log('Checkout Link:', checkoutLink);

    const checkoutOptions = await freemius.checkout.create().inSandbox().toOptions();
    console.log('Checkout Options:', checkoutOptions);
}

main();
