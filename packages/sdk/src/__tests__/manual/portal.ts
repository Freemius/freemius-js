import { freemius } from './fs';

async function main() {
    const userId = '5723112'; // Replace with your actual license ID
    const primaryLicenseId = '1770522'; // Replace with your actual primary license ID if needed
    const portalData = await freemius.customerPortal.retrieveData({
        userId,
        primaryLicenseId,
        endpoint: 'https://my-saas.com/api/portal',
        sandbox: true, // Optional, set to true if you want to use the sandbox environment
    });

    console.log('License Details:', portalData);
}

main();
