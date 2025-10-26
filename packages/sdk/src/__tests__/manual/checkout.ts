import { freemius } from './fs';

async function main() {
    const checkoutLink = (await freemius.checkout.create())
        .setSandbox(await freemius.checkout.getSandboxParams())
        .getLink();
    console.log('Checkout Link:', checkoutLink);

    const checkoutOptions = (await freemius.checkout.create())
        .setSandbox(await freemius.checkout.getSandboxParams())
        .getOptions();
    console.log('Checkout Options:', checkoutOptions);

    const checkout = await freemius.checkout.create({
        user: { email: 'jane@example.com', name: 'Jane Doe' },
        planId: '1234',
    });
    console.log('Checkout with User and Plan:', checkout.getOptions());

    const link = checkout.setAffiliate(1234).setTrial('paid').setCoupon({ code: 'SAVE10' }).getLink();
    console.log('Customized Checkout Link:', link);

    const pricingData = await freemius.pricing.retrieve();
    console.log('Pricing Data:', pricingData);

    const checkoutUpgrader = (await freemius.checkout.create()).setLicenseUpgradeByAuth(
        await freemius.checkout.getLicenseUpgradeAuth('6')
    );
    checkoutUpgrader.setPlan('383');
    console.log('License Upgrade Link:', checkoutUpgrader.getLink());
}

main();
