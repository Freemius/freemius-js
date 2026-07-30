import { freemius } from './fs';

async function runProductOperations() {
    const product = await freemius.api.product.retrieve();
    console.log(product);

    const pricingData = await freemius.api.product.retrievePricingData();
    console.log(pricingData);

    const cancellationCoupon = await freemius.api.product.retrieveSubscriptionCancellationCoupon();
    console.log(cancellationCoupon);
}

async function runLicenseOperations() {
    const license = await freemius.api.license.retrieve(889127);
    console.log(license);

    const licenses = [];
    for await (const license of freemius.api.license.iterateAll({ filter: 'active' })) {
        licenses.push(license);
    }
    console.table(licenses);

    const updatedLicense = await freemius.api.license.update(889127, {
        expiration: '2028-12-31 23:59:59',
        update_subscription_renewal_date: false,
    });

    console.log(updatedLicense);

    const licenseUpgrade = await freemius.api.license.retrieveCheckoutUpgrade(889127, {
        plan_id: '16805',
        billing_cycle: 'monthly',
    });

    console.log(licenseUpgrade);
}

async function runSubscriptionOperations() {
    const subscription = await freemius.api.subscription.retrieve(123);
    console.log(subscription);

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
}

async function runUserOperations() {
    const user = freemius.api.user.retrieve(123);
    console.log(user);

    const users = await freemius.api.user.retrieveMany({ filter: 'paying' });
    console.table(users);

    const allUsers = [];
    for await (const user of freemius.api.user.iterateAll({ filter: 'paying' })) {
        allUsers.push(user);
    }
    console.table(allUsers);

    const userByEmail = await freemius.api.user.retrieveByEmail('xyz@example.com');
    console.log(userByEmail);
}

async function runBillingOperations() {
    const billing = await freemius.api.user.retrieveBilling(123);
    console.log(billing);

    const updatedBilling = await freemius.api.user.updateBilling(123, { business_name: 'Foo Inc', tax_id: '12345' });
    console.log(updatedBilling);
}

async function runPurchaseOperations() {
    const userLicenses = await freemius.api.user.retrieveLicenses(123);
    console.table(userLicenses);

    const userSubscriptions = await freemius.api.user.retrieveSubscriptions(123);
    console.table(userSubscriptions);

    const userPayments = await freemius.api.user.retrievePayments(123);
    console.table(userPayments);
}

async function runPaymentOperations() {
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
}

async function runCustomerPortalOperations() {
    const customerPortalLink = await freemius.api.user.retrieveHostedCustomerPortal(4060);
    console.log(customerPortalLink);

    const customerPortalByEmail = await freemius.api.user.retrieveHostedCustomerPortalByEmail(
        'user-1759746115736-2@example.com'
    );
    console.log(customerPortalByEmail);
}

async function main() {
    await runProductOperations();
    await runLicenseOperations();
    await runSubscriptionOperations();
    await runUserOperations();
    await runBillingOperations();
    await runPurchaseOperations();
    await runPaymentOperations();
    await runCustomerPortalOperations();
}

main();
