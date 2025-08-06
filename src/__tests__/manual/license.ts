import 'dotenv/config';
import { Freemius } from '../..';

const freemius = new Freemius(
    process.env.FS__PRODUCT_ID!,
    process.env.FS__API_KEY!,
    process.env.FS__SECRET_KEY!,
    process.env.FS__PUBLIC_KEY!
);

async function main() {
    const licenseId = '1770472'; // Replace with your actual license ID
    const license = await freemius.purchase.retrievePurchase(licenseId);

    console.log('License Details:', license);
}

main();
