import { RouteError } from '@/lib/route-error';
import { authenticateAndGetFreemiusPurchase } from '@/lib/user-license';

export async function POST(request: Request) {
    const requestBody = await request.json();

    if (!requestBody.fsLicenseId) {
        return Response.json({ code: 'missing_license_id', message: 'License ID is required' }, { status: 400 });
    }

    try {
        const credits = await authenticateAndGetFreemiusPurchase(requestBody.fsLicenseId);

        return Response.json({ message: 'License processed successfully', credits }, { status: 200 });
    } catch (error) {
        if (error instanceof RouteError) {
            return error.toResponseJson();
        }

        throw error; // Re-throw unexpected errors for Next.js to handle
    }
}
