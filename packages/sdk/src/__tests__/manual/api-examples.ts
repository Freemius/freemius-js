import { freemius } from './fs';

async function main() {
    // Licenses
    const license = await freemius.api.license.retrieve(123);
    console.log(license);

    // Getting all licenses
    const licenses = [];
    for await (const license of freemius.api.license.iterateAll({ filter: 'active' })) {
        licenses.push(license);
    }
    console.table(licenses);

    // Subscriptions
    const subscription = await freemius.api.subscription.retrieve(123);
    console.log(subscription);

    // Getting first 20 subscriptions with annual billing cycle
    const subscriptions = await freemius.api.subscription.retrieveMany({ filter: 'active' }, { count: 20, offset: 20 });
    console.table(subscriptions);

    const allSubscriptions = [];
    for await (const subscription of freemius.api.subscription.iterateAll({ filter: 'active' }, 20)) {
        allSubscriptions.push(subscription);
    }
    console.table(allSubscriptions);

    const coupon = await freemius.api.product.retrieveSubscriptionCancellationCoupon();
    await freemius.api.subscription.applyRenewalCoupon(allSubscriptions[0]!.id!, coupon![0]!.id!, true);

    await freemius.api.subscription.cancel(allSubscriptions[0]!.id!, 'Log cancellation reason from SDK', [1]);

    // Users
    const user = freemius.api.user.retrieve(123);
    console.log(user);

    const users = await freemius.api.user.retrieveMany({ filter: 'paying' });
    console.table(users);

    const allUsers = [];
    for await (const user of freemius.api.user.iterateAll({ filter: 'paying' })) {
        allUsers.push(user);
    }
    console.table(allUsers);

    // Search by email
    const userByEmail = await freemius.api.user.retrieveByEmail('xyz@example.com');
    console.log(userByEmail);

    // Billing
    const billing = await freemius.api.user.retrieveBilling(123);
    console.log(billing);

    const updatedBilling = await freemius.api.user.updateBilling(123, { business_name: 'Foo Inc', tax_id: '12345' });
    console.log(updatedBilling);

    // Purchases
    const userLicenses = await freemius.api.user.retrieveLicenses(123);
    console.table(userLicenses);

    const userSubscriptions = await freemius.api.user.retrieveSubscriptions(123);
    console.table(userSubscriptions);

    const userPayments = await freemius.api.user.retrievePayments(123);
    console.table(userPayments);

    // Payments
    const payment = await freemius.api.payment.retrieve(123);
    console.log(payment);

    const payments = await freemius.api.payment.retrieveMany({ filter: 'not_refunded' });
    console.table(payments);

    const allPayments = [];
    for await (const payment of freemius.api.payment.iterateAll({ filter: 'not_refunded' })) {
        allPayments.push(payment);
    }
    console.table(allPayments);

    const invoiceId = 123; // Replace with a valid payment ID that has an invoice
    const pdf = await freemius.api.payment.retrieveInvoice(invoiceId);
    const response = new Response(pdf, {
        headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `inline; filename="invoice_${invoiceId}.pdf"`,
        },
    });
    console.log(response);

    // Product
    const pricingData = await freemius.api.product.retrievePricingData();
    console.log(pricingData);

    const cancellationCoupon = await freemius.api.product.retrieveSubscriptionCancellationCoupon();
    console.log(cancellationCoupon);
}

main();
