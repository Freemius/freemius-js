import { freemius } from '@/lib/freemius';
import { deleteLicense, sendRenewalFailureEmail, syncLicenseFromWebhook } from '@/lib/user-license';

const listener = freemius.webhook.createListener();

listener.on('license.created', async ({ objects: { license } }) => {
    await syncLicenseFromWebhook(license);
    console.log('License created:', license);
});

listener.on('license.extended', async ({ objects: { license } }) => {
    await syncLicenseFromWebhook(license);
    console.log('License extended:', license);
});

listener.on('license.shortened', async ({ objects: { license } }) => {
    await syncLicenseFromWebhook(license);
    console.log('License shortened:', license);
});

listener.on('license.updated', async ({ objects: { license } }) => {
    await syncLicenseFromWebhook(license);
    console.log('License updated:', license);
});

listener.on('license.cancelled', async ({ objects: { license } }) => {
    await syncLicenseFromWebhook(license);
    console.log('License cancelled:', license);
});

listener.on('license.expired', async ({ objects: { license } }) => {
    await syncLicenseFromWebhook(license);
    console.log('License expired:', license);
});

listener.on('license.plan.changed', async ({ objects: { license } }) => {
    await syncLicenseFromWebhook(license);
    console.log('License plan changed:', license);
});

listener.on('license.deleted', async ({ data }) => {
    await deleteLicense(data.license_id);
    console.log('License deleted:', data.license_id);
});

listener.on('subscription.renewal.failed', async ({ objects: { subscription } }) => {
    await sendRenewalFailureEmail(subscription);
    console.log('Subscription renewal failed:', subscription);
});

export async function POST(request: Request) {
    return await freemius.webhook.processFetch(listener, request);
}
