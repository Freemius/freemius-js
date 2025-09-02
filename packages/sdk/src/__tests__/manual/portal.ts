import { freemius } from './fs';

async function main() {
    const userId = '5723112'; // Replace with your actual license ID
    const primaryLicenseId = '1770522'; // Replace with your actual primary license ID if needed
    const portalData = await freemius.customerPortal.retrieveData(
        userId,
        'http://localhost:3000/billing',
        primaryLicenseId
    );

    console.log('License Details:', portalData);
}

main();
