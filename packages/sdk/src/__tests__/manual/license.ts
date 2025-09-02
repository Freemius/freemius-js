import { freemius } from './fs';

async function main() {
    const licenseId = '1770472'; // Replace with your actual license ID
    const license = await freemius.purchase.retrievePurchase(licenseId);

    console.log('License Details:', license);
}

main();
