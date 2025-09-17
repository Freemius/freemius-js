import { freemius } from './fs';

async function main() {
    const userId = '4058'; // Replace with your actual user ID
    const primaryLicenseId = '888923'; // Replace with your actual primary license ID if needed
    const portalData = await freemius.customerPortal.retrieveData({
        userId,
        primaryLicenseId,
        endpoint: 'https://my-saas.com/api/portal',
        sandbox: true, // Optional, set to true if you want to use the sandbox environment
    });

    console.log('Portal Details:', portalData);
}

main();
