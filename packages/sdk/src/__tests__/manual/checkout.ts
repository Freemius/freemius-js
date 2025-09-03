import { freemius } from './fs';

async function main() {
    const checkoutLink = freemius.checkout.create().inSandbox().toLink();
    console.log('Checkout Link:', checkoutLink);

    const checkoutOptions = await freemius.checkout.create().inSandbox().toOptions();
    console.log('Checkout Options:', checkoutOptions);

    const checkout = await freemius.checkout.create({
        user: { email: 'jane@example.com', name: 'Jane Doe' },
        planId: '1234',
    });
    console.log('Checkout with User and Plan:', await checkout.toOptions());

    const link = await checkout.withAffiliate(1234).inTrial('paid').withCoupon({ code: 'SAVE10' }).toLink();
    console.log('Customized Checkout Link:', link);
}

main();
