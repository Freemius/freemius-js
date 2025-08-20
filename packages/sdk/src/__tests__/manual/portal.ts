import 'dotenv/config';
import { Freemius } from '../..';

const freemius = new Freemius(
    process.env.FS__PRODUCT_ID!,
    process.env.FS__API_KEY!,
    process.env.FS__SECRET_KEY!,
    process.env.FS__PUBLIC_KEY!
);

async function main() {
    const userId = '5723112'; // Replace with your actual license ID
    const primaryLicenseId = '1770522'; // Replace with your actual primary license ID if needed
    const portalData = await freemius.customerPortal.retrieveData(userId, primaryLicenseId);

    console.log('License Details:', portalData);
}

main();
