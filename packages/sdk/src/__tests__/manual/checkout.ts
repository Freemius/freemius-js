import { freemius } from './fs';

async function main() {
    const checkoutLink = freemius.checkout.create().setSandbox().getLink();
    console.log('Checkout Link:', checkoutLink);

    const checkoutOptions = await freemius.checkout.create().setSandbox().getOptions();
    console.log('Checkout Options:', checkoutOptions);

    const checkout = await freemius.checkout.create({
        user: { email: 'jane@example.com', name: 'Jane Doe' },
        planId: '1234',
    });
    console.log('Checkout with User and Plan:', await checkout.getOptions());

    const link = await checkout.setAffiliate(1234).setTrial('paid').setCoupon({ code: 'SAVE10' }).getLink();
    console.log('Customized Checkout Link:', link);
}

main();
