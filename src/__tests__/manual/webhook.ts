import { LicenseEntity } from '../../api/types';
import { WebhookService } from '../../services/WebhookService';

const webhookService = new WebhookService('your-secret-key');

// Create a listener
const listener = webhookService.createListener((error) => {
    console.error('Webhook error:', error);
});

// Register handlers with excellent type safety
listener
    .on('license.created', async (event) => {
        // event is fully typed as FreemiusEvent<'license.created'>
        console.log('License created:', event.objects.license.id);
        console.log('Expiration:', event.data.expiration);
        console.log('License ID:', event.data.license_id);

        // Save to database
        await saveNewLicenseToDatabase(event.objects.license);
    })
    .on('license.extended', async (event) => {
        // event is fully typed as FreemiusEvent<'license.extended'>
        console.log('License extended from:', event.data.from, 'to:', event.data.to);

        // Update database
        await updateLicenseExpiration(event.objects.license, event.data.to);
    });

// Example Next.js route handler
export async function POST(request: Request) {
    return await webhookService.processFetch(listener, request);
}

// Mock functions for the example
async function saveNewLicenseToDatabase(license: LicenseEntity): Promise<void> {
    console.log('Saving license:', license.id);
}

async function updateLicenseExpiration(license: LicenseEntity, newExpiration: string): Promise<void> {
    console.log('Updating license:', license.id, 'to expire on:', newExpiration);
}
