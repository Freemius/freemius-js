import { auth } from '@/lib/auth';
import { RouteError } from '@/lib/route-error';
import { syncLicenseByEmail } from '@/lib/user-license';
import { headers } from 'next/headers';

export async function POST() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        return Response.json({ code: 'unauthenticated', message: 'User is not authenticated' }, { status: 401 });
    }

    try {
        const purchaseInfo = await syncLicenseByEmail(session.user.email);

        if (!purchaseInfo) {
            return Response.json({ code: 'not_found', message: 'No purchase found for the user' }, { status: 404 });
        }

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
