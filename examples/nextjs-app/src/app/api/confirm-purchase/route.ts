import { freemius } from '@/lib/freemius';
import { RouteError } from '@/lib/route-error';
import { authenticateAndGetFreemiusPurchase } from '@/lib/user-license';

/**
 * This route handles sync request from the overlay Checkout.
 */
export async function POST(request: Request) {
    const requestBody = await request.json();

    if (!requestBody.fsLicenseId) {
        return Response.json({ code: 'missing_license_id', message: 'License ID is required' }, { status: 400 });
    }

    try {
        const purchaseInfo = await authenticateAndGetFreemiusPurchase(requestBody.fsLicenseId);

        return Response.json(
            { message: 'License processed successfully', credits: purchaseInfo.quota },
            { status: 200 }
        );
    } catch (error) {
        if (error instanceof RouteError) {
            return error.toResponseJson();
        }

        throw error; // Re-throw unexpected errors for Next.js to handle
    }
}

/**
 * This route processes the redirect from Freemius Checkout after a purchase.
 */
export async function GET(request: Request) {
    const data = await freemius.checkout.processRedirect(
        request.url.replace('https://localhost:3000', process.env.HTTP_PROXY_URL || 'https://xyz.ngrok-free.app')
    );

    if (!data) {
        return Response.json({ code: 'invalid_redirect', message: 'Invalid redirect data' }, { status: 400 });
    }

    try {
        const purchaseInfo = await authenticateAndGetFreemiusPurchase(data.license_id);

        return Response.json(
            { message: 'License processed successfully', credits: purchaseInfo.quota },
            { status: 200 }
        );
    } catch (error) {
        if (error instanceof RouteError) {
            return error.toResponseJson();
        }

        throw error; // Re-throw unexpected errors for Next.js to handle
    }
}
