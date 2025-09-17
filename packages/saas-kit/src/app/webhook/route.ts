import { WebhookEventType } from '@freemius/sdk';
import { freemius } from '@/lib/freemius';
import { deleteEntitlement, sendRenewalFailureEmail, syncLicenseFromWebhook } from '@/lib/user-entitlement';

const listener = freemius.webhook.createListener();

const licenseEvents: WebhookEventType[] = [
    'license.created',
    'license.extended',
    'license.shortened',
    'license.updated',
    'license.cancelled',
    'license.expired',
    'license.plan.changed',
];

listener.on(licenseEvents, async ({ objects: { license } }) => {
    if (license && license.id) {
        await syncLicenseFromWebhook(license.id);
    }
});

listener.on('license.deleted', async ({ data }) => {
    await deleteEntitlement(data.license_id);
    console.log('License deleted:', data.license_id);
});

listener.on('subscription.renewal.failed', async ({ objects: { subscription } }) => {
    await sendRenewalFailureEmail(subscription);
    console.log('Subscription renewal failed:', subscription);
});

const processor = freemius.webhook.createRequestProcessor(listener);

export { processor as POST };
