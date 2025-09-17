import { freemius } from './fs';

async function main() {
    // Retrieve by license
    const purchase = await freemius.purchase.retrievePurchase(123456);
    console.log('Purchase:', purchase);

    const purchaseData = await freemius.purchase.retrievePurchaseData(123456);
    console.log('Purchase Data:', purchaseData);

    // Retrieve for user
    const purchasesByUserId = await freemius.purchase.retrievePurchases(78910);
    console.log('Purchases by User ID:', purchasesByUserId);

    const purchasesByEmail = await freemius.purchase.retrievePurchasesByEmail('jane@example.com');
    console.log('Purchases by Email:', purchasesByEmail);

    const subscriptionByUserId = await freemius.purchase.retrieveSubscriptions(78910);
    console.log('Subscriptions by User ID:', subscriptionByUserId);

    const subscriptionsByEmail = await freemius.purchase.retrieveSubscriptionsByEmail('jane@example.com');
    console.log('Purchases by Email:', subscriptionsByEmail);

    const hasLicense = freemius.entitlement.getActive([purchase!.toEntitlement()]);
    console.log('Has License:', hasLicense);
}

main();
